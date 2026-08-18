
const normalizeOcrText = (text) => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Normalize line endings to \n
  let normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Remove control characters (except newline and tab)
  normalized = normalized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');

  // Collapse multiple blank lines into a single blank line
  normalized = normalized.replace(/\n{3,}/g, '\n\n');

  normalized = normalized
    .split('\n')
    .map(line => line.trim())
    .join('\n');

  // Trim overall whitespace from start and end
  return normalized.trim();
};

export default normalizeOcrText;
