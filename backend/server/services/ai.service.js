import ai from "../config/ai.js";

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export const generateAnalysis = async (prompt) => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes("your_api_key")) {
    throw new Error("GEMINI_API_KEY is missing or unconfigured. Please configure a valid GEMINI_API_KEY in .env");
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
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
    console.error("❌ Gemini API Error in generateAnalysis:", error);
    throw new Error(`Gemini Analysis Failed: ${error.message}`);
  }
};

