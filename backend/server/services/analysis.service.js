const { generateSummary } = require("./ai.service");
const { scrapeContent } = require("./scraper.service");
const { extractTextFromImage } = require("./ocr.service");

const analyzeInput = async ({ type, source, filePath }) => {
  if (type === "url") {
    const content = await scrapeContent(source);
    return generateSummary(`Summarize this content: ${content}`);
  }

  if (type === "image") {
    const text = await extractTextFromImage(filePath);
    return generateSummary(`Summarize this extracted text: ${text}`);
  }

  return "Unsupported analysis type";
};

module.exports = { analyzeInput };
