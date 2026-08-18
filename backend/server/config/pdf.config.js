
export const PDF_CONFIG = {
    // Enforced by Multer: Maximum file size allowed for upload
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10 MB
    
    MAX_PAGES: 100,
    
    MAX_OCR_PAGES: 20,
    
    // Timeout for a single page OCR operation in milliseconds
    OCR_TIMEOUT_MS: 15000,
    
    MAX_TEXT_LENGTH: 100000
};
