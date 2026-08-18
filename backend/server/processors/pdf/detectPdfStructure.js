
const detectPdfStructure = (pageTextContent) => {
  if (!pageTextContent || !pageTextContent.items) {
    return false;
  }
  
  const hasVisibleText = pageTextContent.items.some(item => item.str.trim().length > 0);
  
  return hasVisibleText;
};

export default detectPdfStructure;
