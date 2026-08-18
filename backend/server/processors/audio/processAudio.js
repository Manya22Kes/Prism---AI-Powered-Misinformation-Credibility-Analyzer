import validateAudio from "./validateAudio.js";
import transcribeAudio from "./transcribeAudio.js";
import normalizeTranscript from "./normalizeTranscript.js";


const processAudio = async (fileBuffer, mimetype, size) => {
  // 1. Validation
  validateAudio(fileBuffer, mimetype, size);

  // 2. Transcription (Extraction)
  const { rawText, metadata } = await transcribeAudio(fileBuffer, mimetype);

  // 3. Normalization
  const { normalizedText, truncated } = normalizeTranscript(rawText);

  const audioMetadata = {
    file: {
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
    originalInput: "audio_buffer", 
    processedContent: normalizedText,
    metadata: audioMetadata,
  };
};

export default processAudio;
