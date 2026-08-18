
const processText = async (content) => {
  if (!content || !content.trim()) {
    throw new Error("Content is required.");
  }

  return {
    sourceType: "text",
    originalInput: content,
    processedContent: content,
    metadata: {
      textLength: content.length,
      wordCount: content.split(/\s+/).filter(Boolean).length
    }
  };
};

export default processText;
