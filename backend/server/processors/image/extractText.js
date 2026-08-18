import { performOcr } from '../../services/ocr/googleVision.service.js';


const extractText = async (imageBuffer) => {
  const ocrResult = await performOcr(imageBuffer);
  
  return ocrResult;
};

export default extractText;
