import { DOCX_CONFIG } from "../../config/docx.config.js";
import ApiError from "../../utils/ApiError.js";

const validateDocx = (fileBuffer, mimetype, size) => {
  if (!fileBuffer) {
    throw new ApiError(400, "DOCX file buffer is required.");
  }

  if (mimetype !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    throw new ApiError(400, "Invalid file format. Only DOCX is supported.");
  }

  if (size > DOCX_CONFIG.MAX_FILE_SIZE) {
    throw new ApiError(
      400,
      `File size exceeds the limit of ${
        DOCX_CONFIG.MAX_FILE_SIZE / (1024 * 1024)
      }MB.`
    );
  }

  return true;
};

export default validateDocx;
