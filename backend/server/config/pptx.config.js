export const PPTX_CONFIG = {
  MAX_FILE_SIZE: 30 * 1024 * 1024, // 30 MB
  MAX_SLIDES: 500,                 // Prevent zip bomb/infinite loops
  MAX_TEXT_LENGTH: 100000,         // Characters
  SUPPORTED_FORMATS: [
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]
};
