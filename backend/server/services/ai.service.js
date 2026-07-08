const { ai } = require("../config/ai");

const generateSummary = async (prompt) => {
  if (!ai) {
    return "AI service is not configured yet.";
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
  });

  return response.text;
};

module.exports = { generateSummary };
