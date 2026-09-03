import validateAudio from "./validateAudio.js";
import transcribeAudio from "./transcribeAudio.js";
import normalizeTranscript from "./normalizeTranscript.js";


const processAudio = async (file) => {
  const fileBuffer = file.buffer || file;
  const mimetype = file.mimetype || file.mimeType || "audio/mp3";
  const size = file.size || (fileBuffer?.length ?? 0);
  const originalname = file.originalname || "audio_recording.mp3";

  // 1. Validation
  validateAudio(fileBuffer, mimetype, size);

  // 2. Transcription (Extraction)
  const { rawText, metadata } = await transcribeAudio(fileBuffer, mimetype);

  // 3. Normalization
  const { normalizedText, truncated } = normalizeTranscript(rawText);

  const audioMetadata = {
    file: {
      originalname,
      mimeType: mimetype,
      size,
    },
    audio: {
      ...metadata, // includes duration, sampleRate, channels, language, transcriptLength, transcriptionProvider, processingStrategy
      truncated,
    },
  };

  // 5. Return Standard Processor Contract
  return {
    sourceType: "audio",
    originalInput: originalname, 
    processedContent: normalizedText,
    metadata: audioMetadata,
  };
};

export default processAudio;
