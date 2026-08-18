import { performTranscription } from "../../services/transcription/speech.service.js";
import { parseBuffer } from "music-metadata";


const transcribeAudio = async (fileBuffer, mimetype) => {
  let duration = null;
  let sampleRate = null;
  let channels = null;

  try {
    const audioMetadata = await parseBuffer(fileBuffer, mimetype);
    duration = audioMetadata.format.duration || null;
    sampleRate = audioMetadata.format.sampleRate || null;
    channels = audioMetadata.format.numberOfChannels || null;
  } catch (error) {
    console.warn("Could not parse audio metadata using music-metadata:", error.message);
  }

  // Phase 6.1 configuration strategy mapping
  const options = {
    sampleRate,
    channels,
  };

  const { transcript, provider } = await performTranscription(fileBuffer, mimetype, options);
  
  const metadata = {
    duration,
    sampleRate,
    channels,
    language: "en-US", // Defaulted or assumed for this phase
    transcriptLength: transcript ? transcript.length : 0,
    transcriptionProvider: provider,
    processingStrategy: "buffer",
  };

  return { rawText: transcript, metadata };
};

export default transcribeAudio;
