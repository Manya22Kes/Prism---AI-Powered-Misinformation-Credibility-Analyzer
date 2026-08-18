export const AUDIO_CONFIG = {
  MAX_FILE_SIZE: 25 * 1024 * 1024, // 25 MB
  MAX_DURATION: 3600,              // Seconds (1 hour)
  MAX_TRANSCRIPT_LENGTH: 100000,   // Characters
  SUPPORTED_FORMATS: [
    'audio/mpeg', // MP3
    'audio/wav',  // WAV
    'audio/x-wav', 
    'audio/mp4',  // M4A
    'audio/x-m4a'
  ],
  CHUNK_SIZE: 10 * 1024 * 1024,    // For future streaming/chunking (10MB)
  TRANSCRIPTION_TIMEOUT: 60000     // Milliseconds
};
