import ApiError from "../../utils/ApiError.js";
import { PPTX_CONFIG } from "../../config/pptx.config.js";


const validatePptx = (fileBuffer, mimetype, size) => {
  if (!fileBuffer || fileBuffer.length === 0) {
    throw new ApiError(400, "File buffer is empty.");
  }

  if (!PPTX_CONFIG.SUPPORTED_FORMATS.includes(mimetype)) {
    throw new ApiError(
      400,
      "Invalid file format. Only valid PowerPoint (.pptx) presentations are supported."
    );
  }

  if (size > PPTX_CONFIG.MAX_FILE_SIZE) {
    throw new ApiError(
      400,
      `File size exceeds the limit of ${
        PPTX_CONFIG.MAX_FILE_SIZE / (1024 * 1024)
      }MB.`
    );
  }
};

export default validatePptx;
