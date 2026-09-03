import axios from "axios";
import dns from "dns";
import net from "net";
import http from "http";
import https from "https";

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

// SSRF IP Validation
const checkSingleIP = (ip) => {
  if (typeof ip !== 'string' || !net.isIP(ip)) return true; // Fail safe
  
  // Convert to ipv4 format if it's ipv6 mapped ipv4
  if (ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }
  
  if (net.isIPv4(ip)) {
    const parts = ip.split('.').map(Number);
    return (
      parts[0] === 10 || // 10.0.0.0/8
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) || // 172.16.0.0/12
      (parts[0] === 192 && parts[1] === 168) || // 192.168.0.0/16
      parts[0] === 127 || // Loopback
      parts[0] === 169 || // Link-local
      parts[0] === 0 || // Current network
      parts[0] >= 224 // Multicast and reserved
    );
  }

  if (net.isIPv6(ip)) {
    return (
      ip === '::1' || // Loopback
      ip === '::' || // Unspecified
      ip.toLowerCase().startsWith('fc') || // Unique local
      ip.toLowerCase().startsWith('fd') ||
      ip.toLowerCase().startsWith('fe8') || // Link local
      ip.toLowerCase().startsWith('fe9') ||
      ip.toLowerCase().startsWith('fea') ||
      ip.toLowerCase().startsWith('feb') ||
      ip.toLowerCase().startsWith('ff') // Multicast
    );
  }
  
  return true;
};

export const isPrivateIP = (address) => {
  if (Array.isArray(address)) {
    return address.some(entry => {
      const ipStr = typeof entry === 'string' ? entry : entry?.address;
      return checkSingleIP(ipStr);
    });
  }
  const ipStr = typeof address === 'string' ? address : address?.address;
  return checkSingleIP(ipStr);
};

const safeLookup = (hostname, options, callback) => {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  dns.lookup(hostname, options, (err, address, family) => {
    if (err) return callback(err);
    if (isPrivateIP(address)) {
      return callback(new Error(`SSRF Prevention: Resolved IP for ${hostname} is blocked.`));
    }
    callback(null, address, family);
  });
};

const httpAgent = new http.Agent({ lookup: safeLookup });
const httpsAgent = new https.Agent({ lookup: safeLookup });

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
      
      httpAgent,
      httpsAgent,

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
