import axios from "axios";

const DEFAULT_TIMEOUT = 10000;

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0 Safari/537.36 PrismAI/1.0";

export const URL_BLOCKED_ERROR_CODE = "URL_BLOCKED";
export const URL_BLOCKED_MESSAGE =
  "This website does not allow automated retrieval of this page. Please copy and paste the article text instead.";

const browserHeaders = {
  "User-Agent": USER_AGENT,
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
  DNT: "1",
  "Upgrade-Insecure-Requests": "1",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
};

const blockedWebsiteStatuses = new Set([401, 403, 429, 451]);

const createHttpError = (status) => {
  const error = new Error(`Failed to fetch URL. HTTP ${status}.`);
  error.statusCode = status;

  return error;
};

const createBlockedWebsiteError = (status) => {
  const error = new Error(URL_BLOCKED_MESSAGE);
  error.code = URL_BLOCKED_ERROR_CODE;
  error.originalStatusCode = status;
  error.statusCode = status;

  return error;
};

export const fetchUrl = async (url) => {
  try {
    const response = await axios.get(url, {
      timeout: DEFAULT_TIMEOUT,

      maxRedirects: 5,

      headers: browserHeaders,

      validateStatus: (status) => status >= 200 && status < 400,
    });

    const contentType = response.headers["content-type"] || "";

    if (!contentType.includes("text/html")) {
      throw new Error("URL does not point to an HTML document.");
    }

    return response.data;
  } catch (error) {
    if (error.code === "ECONNABORTED") {
      throw new Error("Request timed out while fetching the URL.");
    }

    if (error.response) {
      if (blockedWebsiteStatuses.has(error.response.status)) {
        throw createBlockedWebsiteError(error.response.status);
      }

      throw createHttpError(error.response.status);
    }

    if (error.request) {
      throw new Error("Unable to reach the provided URL.");
    }

    throw new Error(error.message || "Failed to fetch URL.");
  }
};

export default fetchUrl;
