import { AUDIO_CONFIG } from "../../config/audio.config.js";
import ApiError from "../../utils/ApiError.js";

const validateAudio = (fileBuffer, mimetype, size) => {
  if (!fileBuffer) {
    throw new ApiError(400, "Audio file buffer is required.");
  }

  if (!AUDIO_CONFIG.SUPPORTED_FORMATS.includes(mimetype)) {
    throw new ApiError(400, `Invalid file format. Supported formats are: ${AUDIO_CONFIG.SUPPORTED_FORMATS.join(", ")}`);
  }

  if (size > AUDIO_CONFIG.MAX_FILE_SIZE) {
    throw new ApiError(
      400,
      `File size exceeds the limit of ${
        AUDIO_CONFIG.MAX_FILE_SIZE / (1024 * 1024)
      }MB. For longer audio files, please use a Google Cloud Storage URI (future implementation).`
    );
  }

  return true;
};

export default validateAudio;
