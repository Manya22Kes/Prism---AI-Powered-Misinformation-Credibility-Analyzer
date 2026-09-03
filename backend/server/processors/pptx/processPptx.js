import JSZip from "jszip";
import validatePptx from "./validatePptx.js";
import { extractSlideContent } from "./extractSlides.js";
import { extractNotesContent } from "./extractNotes.js";
import normalizeSlides from "./normalizeSlides.js";
import { PPTX_CONFIG } from "../../config/pptx.config.js";
import ApiError from "../../utils/ApiError.js";


const processPptx = async (file) => {
  // 1. Validation
  validatePptx(file.buffer, file.mimetype, file.size);

  let zip;
  try {
    zip = await JSZip.loadAsync(file.buffer);
  } catch (error) {
    if (error.message && error.message.includes("encrypted")) {
      throw new ApiError(400, "Password-protected files are not supported.");
    }
    throw new ApiError(400, "Invalid or corrupted PPTX file. Failed to unzip.");
  }

  // PPTX Structure Tracking
  let rawText = "";
  const stats = {
    slideCount: 0,
    titleCount: 0,
    textBoxCount: 0,
    bulletListCount: 0,
    tableCount: 0,
    notesDetected: false,
    notesProcessed: 0,
    imageCount: 0,
  };

  // 2. Extract Slides
  const slideFiles = Object.keys(zip.files).filter(
    (name) => name.startsWith("ppt/slides/slide") && name.endsWith(".xml")
  );

  if (slideFiles.length > PPTX_CONFIG.MAX_SLIDES) {
    throw new ApiError(400, `Presentation exceeds maximum limit of ${PPTX_CONFIG.MAX_SLIDES} slides.`);
  }

  stats.slideCount = slideFiles.length;

  for (let i = 1; i <= slideFiles.length; i++) {
    const slidePath = `ppt/slides/slide${i}.xml`;
    const slideZipFile = zip.file(slidePath);
    
    if (!slideZipFile) continue;

    const slideXml = await slideZipFile.async("string");
    const { text: slideText, stats: slideStats } = extractSlideContent(slideXml);
    
    // Accumulate Stats
    stats.titleCount += slideStats.titleCount;
    stats.textBoxCount += slideStats.textBoxCount;
    stats.bulletListCount += slideStats.bulletListCount;
    stats.tableCount += slideStats.tableCount;
    stats.imageCount += slideStats.imageCount;

    if (slideText) {
      rawText += `[Slide ${i}]\n${slideText}\n`;
    } else {
      rawText += `[Slide ${i}]\n(Empty Slide)\n`;
    }

    // 3. Extract Relationships and Speaker Notes
    const relsPath = `ppt/slides/_rels/slide${i}.xml.rels`;
    const relsZipFile = zip.file(relsPath);
    
    if (relsZipFile) {
      const relsXml = await relsZipFile.async("string");
      const notesMatch = relsXml.match(/Target="\.\.\/notesSlides\/(notesSlide\d+\.xml)"/);
      
      if (notesMatch && notesMatch[1]) {
        stats.notesDetected = true;
        const notesFileName = notesMatch[1];
        const notesPath = `ppt/notesSlides/${notesFileName}`;
        const notesZipFile = zip.file(notesPath);
        
        if (notesZipFile) {
          const notesXml = await notesZipFile.async("string");
          const notesText = extractNotesContent(notesXml);
          if (notesText) {
            rawText += `Notes: ${notesText}\n`;
            stats.notesProcessed++;
          }
        }
      }
    }
    rawText += `\n`;
  }

  // 4. Normalization
  const { normalizedText, truncated } = normalizeSlides(rawText);

  // 5. Metadata Schema Mapping
  const metadata = {
    file: {
      originalname: file.originalname,
      mimeType: mimetype,
      size,
    },
    pptx: {
      ...stats,
      processingStrategy: "text-only",
      truncated,
    },
  };

  // 6. Output Standard Contract
  return {
    sourceType: "pptx",
    originalInput: "pptx_buffer",
    processedContent: normalizedText,
    metadata,
  };
};

export default processPptx;
