const URL_METADATA_FIELDS = [
  "title",
  "author",
  "publishedDate",
  "domain",
  "canonicalUrl",
  "siteName",
  "excerpt",
  "language",
];

const emptyMetadata = () =>
  URL_METADATA_FIELDS.reduce(
    (metadata, field) => ({
      ...metadata,
      [field]: null,
    }),
    {},
  );

const getMetaContent = (document, selectors) => {
  const selectorList = Array.isArray(selectors) ? selectors : [selectors];

  for (const selector of selectorList) {
    const content = document.querySelector(selector)?.getAttribute("content");

    if (content?.trim()) return content.trim();
  }

  return null;
};

const getJsonLdNodes = (document) =>
  [...document.querySelectorAll('script[type="application/ld+json"]')]
    .map((script) => {
      try {
        return JSON.parse(script.textContent);
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .flatMap((node) => {
      if (Array.isArray(node)) return node;
      if (Array.isArray(node["@graph"])) return node["@graph"];

      return [node];
    });

const getJsonLdType = (node) => {
  const type = node?.["@type"];

  if (Array.isArray(type)) return type.join(" ");

  return type || "";
};

const getJsonLdArticle = (jsonLdNodes) =>
  jsonLdNodes.find((node) =>
    /article|newsarticle|blogposting|report/i.test(getJsonLdType(node)),
  );

const getJsonLdValue = (value) => {
  if (!value) return null;
  if (typeof value === "string") return value.trim() || null;
  if (Array.isArray(value)) return getJsonLdValue(value[0]);
  if (typeof value === "object") {
    return value.name || value.headline || value["@id"] || null;
  }

  return null;
};

const normalizeDate = (value) => {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return date.toISOString();
};

const getCanonicalUrl = (document, originalUrl) => {
  const canonicalHref = document
    .querySelector('link[rel="canonical"]')
    ?.getAttribute("href");

  if (!canonicalHref) return originalUrl;

  try {
    return new URL(canonicalHref, originalUrl).toString();
  } catch {
    return originalUrl;
  }
};

export const extractUrlMetadata = (document, originalUrl, readability = null) => {
  const metadata = emptyMetadata();
  const jsonLdNodes = getJsonLdNodes(document);
  const jsonLdArticle = getJsonLdArticle(jsonLdNodes);
  const parsedUrl = new URL(originalUrl);

  metadata.title =
    getMetaContent(document, [
      'meta[property="og:title"]',
      'meta[name="twitter:title"]',
    ]) ||
    readability?.title ||
    document.querySelector("title")?.textContent?.trim() ||
    getJsonLdValue(jsonLdArticle?.headline) ||
    null;

  metadata.author =
    getMetaContent(document, [
      'meta[name="author"]',
      'meta[property="article:author"]',
    ]) ||
    getJsonLdValue(jsonLdArticle?.author) ||
    null;

  metadata.publishedDate = normalizeDate(
    getMetaContent(document, [
      'meta[property="article:published_time"]',
      'meta[name="date"]',
      'meta[name="pubdate"]',
      'meta[name="publish-date"]',
      'meta[name="sailthru.date"]',
    ]) ||
      getJsonLdValue(jsonLdArticle?.datePublished) ||
      document.querySelector("time[datetime]")?.getAttribute("datetime"),
  );

  metadata.domain = parsedUrl.hostname;
  metadata.canonicalUrl = getCanonicalUrl(document, originalUrl);

  metadata.siteName =
    getMetaContent(document, [
      'meta[property="og:site_name"]',
      'meta[name="application-name"]',
    ]) ||
    getJsonLdValue(jsonLdArticle?.publisher) ||
    null;

  metadata.excerpt =
    getMetaContent(document, [
      'meta[property="og:description"]',
      'meta[name="twitter:description"]',
      'meta[name="description"]',
    ]) ||
    readability?.excerpt ||
    getJsonLdValue(jsonLdArticle?.description) ||
    null;

  metadata.language =
    document.documentElement.lang?.trim() ||
    getMetaContent(document, 'meta[property="og:locale"]') ||
    null;

  return metadata;
};

export const getStructuredDataTypes = (document) =>
  getJsonLdNodes(document).map(getJsonLdType).filter(Boolean);

export default extractUrlMetadata;
