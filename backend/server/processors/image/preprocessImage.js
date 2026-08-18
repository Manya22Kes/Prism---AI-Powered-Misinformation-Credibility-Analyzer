
const preprocessImage = async (file) => {
  
  if (file.buffer) {
    return file.buffer;
  }
  
  throw new Error('No image buffer found for preprocessing');
};

export default preprocessImage;
