import ApiError from "../../utils/ApiError.js";
import { BATCH_CONFIG } from "../../config/batch.config.js";


const validateBatch = (files) => {
  if (!files || !Array.isArray(files) || files.length === 0) {
    throw new ApiError(400, "No files provided in the batch.");
  }

  if (files.length > BATCH_CONFIG.MAX_FILES) {
    throw new ApiError(400, `Batch exceeds the maximum limit of ${BATCH_CONFIG.MAX_FILES} files.`);
  }

  const totalSize = files.reduce((acc, file) => acc + file.size, 0);
  if (totalSize > BATCH_CONFIG.MAX_TOTAL_SIZE) {
    throw new ApiError(
      400,
      `Total batch size exceeds the limit of ${BATCH_CONFIG.MAX_TOTAL_SIZE / (1024 * 1024)}MB.`
    );
  }
};

export default validateBatch;
