const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

/**
 * Helper to process SSE stream from a Fetch POST response.
 */
const streamResponse = async (url, options, onEvent) => {
  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    // Add auth headers here if needed in the future
  });

  if (!response.ok) {
    let errorMsg = 'Failed to analyze content';
    try {
      const errorData = await response.json();
      errorMsg = errorData.message || errorMsg;
    } catch {
      // Non-JSON response body fallback
    }
    throw new Error(errorMsg);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    
    const rawLines = buffer.split('\n');
    buffer = rawLines.pop() || ''; // Keep incomplete trailing line

    for (const rawLine of rawLines) {
      const line = rawLine.trim();
      if (line.startsWith('data: ')) {
        const dataStr = line.slice(6).trim();
        if (dataStr) {
          try {
            const data = JSON.parse(dataStr);
            onEvent(data);
          } catch (err) {
            console.error("Failed to parse SSE data:", err, dataStr);
          }
        }
      }
    }
  }
};

export const analysisApi = {
  /**
   * Analyze raw text
   */
  analyzeText: (data, onEvent) => {
    return streamResponse('/analyze/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }, onEvent);
  },

  /**
   * Analyze a URL
   */
  analyzeUrl: (data, onEvent) => {
    return streamResponse('/analyze/url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }, onEvent);
  },

  /**
   * Analyze a single file (PDF, DOCX, PPTX, Image, Audio)
   */
  analyzeFile: (endpoint, file, onEvent) => {
    const formData = new FormData();
    const fieldName = endpoint === 'image' ? 'image' : 'file';
    formData.append(fieldName, file);
    
    return streamResponse(`/analyze/${endpoint}`, {
      method: 'POST',
      body: formData,
    }, onEvent);
  },

  /**
   * Analyze a batch of files
   */
  analyzeBatch: (files, onEvent) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    
    return streamResponse('/analyze/batch', {
      method: 'POST',
      body: formData,
    }, onEvent);
  },

  /**
   * Re-analyze an existing report
   */
  reanalyze: (id, onEvent) => {
    return streamResponse(`/analyze/${id}/reanalyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, onEvent);
  },
};
