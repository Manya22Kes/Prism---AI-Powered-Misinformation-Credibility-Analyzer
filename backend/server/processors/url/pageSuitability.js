import { PAGE_TYPES } from "./classifyPage.js";

const unsupportedPageTypes = new Set([
  PAGE_TYPES.HOMEPAGE,
  PAGE_TYPES.LANDING_PAGE,
  PAGE_TYPES.CATEGORY_PAGE,
  PAGE_TYPES.REPOSITORY,
  PAGE_TYPES.DOCUMENTATION,
  PAGE_TYPES.SEARCH_RESULTS,
  PAGE_TYPES.BLOG_INDEX,
]);

export const getArticleSuitability = (pageType) => ({
  isArticle: pageType === PAGE_TYPES.ARTICLE,
  message: unsupportedPageTypes.has(pageType)
    ? "This URL appears to be a homepage, repository, documentation page, search results page, landing page, or directory rather than a single article. Please provide the URL of a specific news article."
    : null,
});

export default getArticleSuitability;
