import mammoth from "mammoth";
import * as cheerio from "cheerio";


const extractText = async (fileBuffer) => {
  const { value: html, messages } = await mammoth.convertToHtml({ buffer: fileBuffer });
  
  // Parse the HTML with cheerio
  const $ = cheerio.load(html);
  
  const metadata = {
    wordCount: 0,
    paragraphCount: 0,
    tableCount: 0,
    imageCount: 0,
    hyperlinkCount: 0,
    embeddedImagesProcessed: false,
    processingStrategy: "text-only"
  };

  // Extract structural counts
  metadata.paragraphCount = $("p").length;
  metadata.tableCount = $("table").length;
  metadata.imageCount = $("img").length;
  metadata.hyperlinkCount = $("a").length;

  $("p, h1, h2, h3, h4, h5, h6, li, tr").append("\n");
  const rawText = $.text().trim();

  // Calculate word count based on the extracted text
  metadata.wordCount = rawText.split(/\s+/).filter(Boolean).length;

  return { rawText, metadata };
};

export default extractText;
