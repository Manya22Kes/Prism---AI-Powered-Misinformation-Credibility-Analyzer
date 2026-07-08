const { createWorker } = require("tesseract.js");

const extractTextFromImage = async (filePath) => {
  const worker = await createWorker("eng");
  const result = await worker.recognize(filePath);
  await worker.terminate();
  return result.data.text;
};

module.exports = { extractTextFromImage };
