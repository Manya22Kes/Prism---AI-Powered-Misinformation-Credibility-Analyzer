import ai from "../config/ai.js";

const MODEL = process.env.GEMINI_MODEL;

export const generateAnalysis = async (prompt) => {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(response.text);
};
