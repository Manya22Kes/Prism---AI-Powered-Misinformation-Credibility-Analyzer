import ai from "../config/ai.js";

const PRIMARY_MODEL = process.env.GEMINI_MODEL || "gemini-3.7-flash";
const FALLBACK_MODELS = [PRIMARY_MODEL, "gemini-2.5-flash", "gemini-2.0-flash"].filter((m, i, a) => a.indexOf(m) === i);

export const generateAnalysis = async (prompt) => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes("your_api_key")) {
    throw new Error("GEMINI_API_KEY is missing or unconfigured. Please configure a valid GEMINI_API_KEY in .env");
  }

  let lastError = null;

  for (const model of FALLBACK_MODELS) {
    for (let attempt = 0; attempt < 3; attempt++) {
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

        return JSON.parse(response.text);
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
        const isRateLimit = 
          msg.includes('429') || 
          msg.includes('demand') || 
          msg.includes('quota') || 
          msg.includes('503');

        if ((isRateLimit || isTransientNetwork) && attempt < 2) {
          console.warn(`⚠️ [AI Service] Transient connection issue (${model}, attempt ${attempt + 1}): ${error.message}. Retrying in ${1.5 * (attempt + 1)}s...`);
          await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
          continue;
        }
        break;
      }
    }
  }

  console.error("❌ Gemini API Error in generateAnalysis:", lastError);
  
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

