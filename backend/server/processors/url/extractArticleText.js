import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

export const createUrlDocument = (html, url) =>
  new JSDOM(html, {
    url,
  }).window.document;

const getFallbackText = (document) => {
  const clonedDocument = document.cloneNode(true);

  clonedDocument
    .querySelectorAll("script, style, noscript, svg, nav, footer, header, aside, form")
    .forEach((element) => element.remove());

  return [...clonedDocument.querySelectorAll("article, main, h1, h2, h3, p, li")]
    .map((element) => element.textContent.trim())
    .filter(Boolean)
    .join("\n");
};

export const extractArticleText = (document) => {
  try {
    const reader = new Readability(document.cloneNode(true));

    const article = reader.parse();

    if (!article) {
      throw new Error("Unable to extract readable article content.");
    }

    if (!article.textContent?.trim()) {
      throw new Error("Extracted article is empty.");
    }

    return {
      articleText: article.textContent,
      readability: article,
    };
  } catch (error) {
    const fallbackText = getFallbackText(document);

    if (!fallbackText) {
      throw new Error(`Article extraction failed: ${error.message}`);
    }

    return {
      articleText: fallbackText,
      readability: null,
    };
  }
};

export default extractArticleText;
