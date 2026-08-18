
const extractText = (pageTextContent) => {
  if (!pageTextContent || !pageTextContent.items || pageTextContent.items.length === 0) {
    return '';
  }

  // Join the text elements from the PDF stream
  return pageTextContent.items
    .map(item => item.str)
    .join(' ')
    .trim();
};

export default extractText;
