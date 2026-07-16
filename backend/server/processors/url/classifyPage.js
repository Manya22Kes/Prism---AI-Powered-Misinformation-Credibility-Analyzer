const PAGE_TYPES = {
  ARTICLE: "Article",
  LANDING_PAGE: "Landing Page",
  HOMEPAGE: "Homepage",
  CATEGORY_PAGE: "Category Page",
  REPOSITORY: "Repository",
  DOCUMENTATION: "Documentation",
  BLOG_INDEX: "Blog Index",
  SEARCH_RESULTS: "Search Results",
  UNKNOWN: "Unknown",
};

const articleTypes = /article|newsarticle|blogposting|report/i;
const documentationTypes = /techarticle|documentation|api reference|howto/i;
const githubReservedPaths = new Set([
  "about",
  "apps",
  "collections",
  "contact",
  "customer-stories",
  "enterprise",
  "events",
  "explore",
  "features",
  "github-copilot",
  "issues",
  "login",
  "marketplace",
  "new",
  "notifications",
  "organizations",
  "orgs",
  "pricing",
  "pulls",
  "search",
  "settings",
  "sponsors",
  "topics",
  "trending",
]);

const clampConfidence = (score) => Math.max(0.5, Math.min(score, 0.98));

const getPathSegments = (url) =>
  new URL(url).pathname.split("/").filter(Boolean);

const countLinks = (document, selector) =>
  document.querySelectorAll(selector).length;

const hasSearchUrlSignals = (url) => {
  const parsedUrl = new URL(url);
  const pathname = parsedUrl.pathname.toLowerCase();

  return (
    /(^|\/)search(\/|$)/.test(pathname) ||
    parsedUrl.searchParams.has("q") ||
    parsedUrl.searchParams.has("query")
  );
};

const hasEmbeddedSearch = (document) =>
  document.querySelectorAll('input[type="search"], form[action*="search" i]')
    .length > 0;

const getCardLinkCount = (document) =>
  countLinks(
    document,
    'article a[href], [class*="card" i] a[href], [class*="teaser" i] a[href], [class*="post" i] a[href]',
  );

const getNavigationDensity = (document) => {
  const bodyLinks = countLinks(document, "body a[href]");
  const navLinks = countLinks(document, "nav a[href], header a[href], footer a[href]");

  if (!bodyLinks) return 0;

  return navLinks / bodyLinks;
};

const hasArticleMeta = (document) =>
  Boolean(
    document.querySelector(
      [
        'meta[property^="article:" i]',
        'meta[name="article:author" i]',
        'meta[property="og:type" i][content*="article" i]',
        'meta[name="twitter:label1" i][content*="author" i]',
      ].join(", "),
    ),
  );

const hasCanonicalLink = (document) =>
  Boolean(document.querySelector('link[rel="canonical" i][href]'));

const isGithubRepository = (parsedUrl, segments) =>
  parsedUrl.hostname.toLowerCase() === "github.com" &&
  segments.length >= 2 &&
  !githubReservedPaths.has(segments[0].toLowerCase()) &&
  !segments[0].startsWith(".");

const isDocumentationHost = (hostname) =>
  hostname === "developer.mozilla.org" ||
  hostname.endsWith(".readthedocs.io") ||
  hostname === "readthedocs.io" ||
  hostname.startsWith("docs.") ||
  hostname.includes(".docs.");

const hasDocumentationPath = (pathname) =>
  /(^|\/)(docs|documentation|api|reference|guide|guides|learn)(\/|$)/.test(
    pathname,
  );

const scoreSignals = (signals) =>
  Object.values(signals).reduce((total, value) => total + value, 0);

export const classifyPage = ({
  document,
  url,
  articleText,
  metadata,
  structuredDataTypes,
}) => {
  const parsedUrl = new URL(url);
  const segments = getPathSegments(url);
  const hostname = parsedUrl.hostname.toLowerCase();
  const pathname = parsedUrl.pathname.toLowerCase();
  const textLength = articleText?.length || 0;
  const headingCount = document.querySelectorAll("h1, h2, h3").length;
  const cardLinkCount = getCardLinkCount(document);
  const navigationDensity = getNavigationDensity(document);
  const structuredTypeText = structuredDataTypes.join(" ");
  const hasArticleType = articleTypes.test(structuredTypeText);
  const hasDocumentationType = documentationTypes.test(structuredTypeText);
  const hasPublishedDate = Boolean(metadata.publishedDate);
  const hasAuthor = Boolean(metadata.author);
  const hasArticleElement = Boolean(document.querySelector("article"));
  const articleMeta = hasArticleMeta(document);
  const canonicalLink = hasCanonicalLink(document);
  const documentationHost = isDocumentationHost(hostname);
  const documentationPath = hasDocumentationPath(pathname);

  if (!segments.length) {
    return {
      pageType: PAGE_TYPES.HOMEPAGE,
      pageTypeConfidence: 0.92,
    };
  }

  if (isGithubRepository(parsedUrl, segments)) {
    return {
      pageType: PAGE_TYPES.REPOSITORY,
      pageTypeConfidence: 0.94,
    };
  }

  const documentationScore = scoreSignals({
    host: documentationHost ? 3 : 0,
    path: documentationPath ? 2 : 0,
    structuredData: hasDocumentationType ? 2 : 0,
    headings: headingCount >= 6 && cardLinkCount < 8 ? 1 : 0,
  });

  const indexScore = scoreSignals({
    cards: cardLinkCount >= 12 ? 3 : cardLinkCount >= 6 ? 2 : 0,
    navigation: navigationDensity > 0.45 ? 1 : 0,
    headings: headingCount >= 8 ? 1 : 0,
  });

  const articleScore = scoreSignals({
    readabilityLength: textLength >= 1200 ? 3 : textLength >= 600 ? 2 : 0,
    structuredData: hasArticleType ? 2 : 0,
    date: hasPublishedDate ? 1 : 0,
    author: hasAuthor ? 1 : 0,
    canonical: canonicalLink ? 1 : 0,
    metadata: articleMeta ? 1 : 0,
    articleElement: hasArticleElement ? 1 : 0,
    pathDepth: segments.length >= 2 ? 1 : 0,
  });

  if (documentationScore >= 4) {
    return {
      pageType: PAGE_TYPES.DOCUMENTATION,
      pageTypeConfidence: clampConfidence(0.7 + documentationScore * 0.06),
    };
  }

  if (articleScore >= 5 && textLength >= 600) {
    return {
      pageType: PAGE_TYPES.ARTICLE,
      pageTypeConfidence: clampConfidence(0.64 + articleScore * 0.045),
    };
  }

  if (hasSearchUrlSignals(url) || (hasEmbeddedSearch(document) && indexScore >= 3)) {
    return {
      pageType: PAGE_TYPES.SEARCH_RESULTS,
      pageTypeConfidence: 0.9,
    };
  }

  if (/\/category|\/topics?|\/tags?|\/sections?/.test(pathname)) {
    return {
      pageType: PAGE_TYPES.CATEGORY_PAGE,
      pageTypeConfidence: clampConfidence(0.78 + indexScore * 0.04),
    };
  }

  if (/\/blog\/?$/.test(pathname) || (/\/blog/.test(pathname) && indexScore >= 3)) {
    return {
      pageType: PAGE_TYPES.BLOG_INDEX,
      pageTypeConfidence: clampConfidence(0.74 + indexScore * 0.05),
    };
  }

  if (indexScore >= 4 && articleScore < 6) {
    return {
      pageType:
        segments.length <= 1 ? PAGE_TYPES.LANDING_PAGE : PAGE_TYPES.CATEGORY_PAGE,
      pageTypeConfidence: clampConfidence(0.72 + indexScore * 0.05),
    };
  }

  if (segments.length <= 1 && textLength < 900) {
    return {
      pageType: PAGE_TYPES.LANDING_PAGE,
      pageTypeConfidence: 0.72,
    };
  }

  return {
    pageType: PAGE_TYPES.UNKNOWN,
    pageTypeConfidence: 0.55,
  };
};

export const isSuitableArticle = (pageType) => pageType === PAGE_TYPES.ARTICLE;

export { PAGE_TYPES };
export default classifyPage;
