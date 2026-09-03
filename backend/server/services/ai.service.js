import ai from "../config/ai.js";

const PRIMARY_MODEL = process.env.GEMINI_MODEL || "gemini-3.7-flash";

// Modern Gemini 3.x series models: Primary -> 3.6 -> 3.8
const FALLBACK_MODELS = [
  PRIMARY_MODEL,
  "gemini-3.6-flash",
  "gemini-3.8-flash",
].filter((m, i, a) => a.indexOf(m) === i);

export const generateAnalysis = async (prompt, onProgress = null) => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes("your_api_key")) {
    throw new Error("GEMINI_API_KEY is missing or unconfigured. Please configure a valid GEMINI_API_KEY in .env");
  }

  let lastError = null;

  for (const model of FALLBACK_MODELS) {
    const maxAttempts = 2;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: model,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        });

        if (!response.text) {
          throw new Error("Gemini API returned an empty response text payload.");
        }

        const parsed = JSON.parse(response.text);
        parsed._modelUsed = model;
        return parsed;
      } catch (error) {
        lastError = error;
        const msg = (error.message || '').toLowerCase();
        const isTransientNetwork = 
          msg.includes('wsarecv') ||
          msg.includes('stream reading error') ||
          msg.includes('forcibly closed') ||
          msg.includes('econnreset') ||
          msg.includes('etimedout') ||
          msg.includes('fetch failed') ||
          msg.includes('socket hang up') ||
          msg.includes('network error');
        const isRateLimitOrDemand = 
          msg.includes('429') || 
          msg.includes('demand') || 
          msg.includes('quota') || 
          msg.includes('503') ||
          msg.includes('unavailable');

        if ((isRateLimitOrDemand || isTransientNetwork) && attempt < maxAttempts - 1) {
          const delayMs = 1500 * (attempt + 1);
          console.warn(`⚠️ [AI Service] Temporary issue with ${model} (attempt ${attempt + 1}/${maxAttempts}): ${error.message}. Retrying in ${(delayMs / 1000).toFixed(1)}s...`);
          if (onProgress) {
            onProgress({
              stage: "analyzing",
              failoverNotice: {
                type: "high_demand_retry",
                model: model,
                attempt: attempt + 1,
                maxAttempts: maxAttempts,
                message: `High traffic spike detected on ${model}. Retrying in ${(delayMs / 1000).toFixed(1)}s...`
              },
              message: `High traffic spike on ${model}. Retrying in ${(delayMs / 1000).toFixed(1)}s...`
            });
          }
          await new Promise((r) => setTimeout(r, delayMs));
          continue;
        }
        break;
      }
    }

    const currentIndex = FALLBACK_MODELS.indexOf(model);
    const nextModel = FALLBACK_MODELS[currentIndex + 1];
    if (nextModel) {
      console.warn(`⚠️ [AI Service] Model ${model} unavailable or exhausted. Trying next fallback model (${nextModel})...`);
      if (onProgress) {
        onProgress({
          stage: "analyzing",
          failoverNotice: {
            type: "model_failover",
            fromModel: model,
            toModel: nextModel,
            message: `High demand on ${model}. Seamlessly switching to ${nextModel}...`
          },
          message: `High demand on ${model}. Switching to ${nextModel}...`
        });
      }
    }
  }

  console.error("❌ All Gemini models failed in generateAnalysis:", lastError);
  
  let cleanMessage = lastError?.message || "Unknown error";
  try {
    if (typeof cleanMessage === 'string' && cleanMessage.trim().startsWith('{')) {
      const parsed = JSON.parse(cleanMessage);
      if (parsed?.error?.message) {
        cleanMessage = parsed.error.message;
      }
    }
  } catch (e) {
    // Ignore parsing errors
  }

  throw new Error(`Gemini Analysis Failed: ${cleanMessage}`);
};

