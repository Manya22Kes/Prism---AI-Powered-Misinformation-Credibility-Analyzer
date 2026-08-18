import * as cheerio from "cheerio";


export const extractSlideContent = (xmlString) => {
  const $ = cheerio.load(xmlString, { xmlMode: true });
  let slideText = "";
  const stats = {
    titleCount: 0,
    textBoxCount: 0,
    bulletListCount: 0,
    tableCount: 0,
    imageCount: 0,
  };

  // 1. Detect Images (`p:pic`)
  stats.imageCount = $("p\\:pic").length;

  // 2. Extract Titles & Text Boxes (`p:sp`)
  $("p\\:sp").each((_, sp) => {
    // Check if it's a title (has p:ph type="title" or similar)
    const isTitle = $(sp).find("p\\:ph").attr("type") === "title" || $(sp).find("p\\:ph").attr("type") === "ctrTitle";
    
    if (isTitle) {
      stats.titleCount++;
    } else {
      stats.textBoxCount++;
    }

    // Extract paragraphs within this shape
    $(sp).find("a\\:p").each((_, p) => {
      if ($(p).find("a\\:pPr a\\:buFont").length > 0 || $(p).find("a\\:pPr a\\:buChar").length > 0) {
        stats.bulletListCount++;
      }

      // Extract text runs
      const paragraphText = $(p).find("a\\:t").map((_, t) => $(t).text()).get().join("");
      if (paragraphText.trim()) {
        slideText += paragraphText.trim() + "\n";
      }
    });
    slideText += "\n";
  });

  // 3. Extract Tables (`a:tbl`)
  $("a\\:tbl").each((_, tbl) => {
    stats.tableCount++;
    $(tbl).find("a\\:tr").each((_, tr) => {
      const rowText = [];
      $(tr).find("a\\:tc").each((_, tc) => {
        const cellText = $(tc).find("a\\:t").map((_, t) => $(t).text()).get().join("");
        rowText.push(cellText.trim());
      });
      slideText += rowText.join(" | ") + "\n";
    });
    slideText += "\n";
  });

  return { text: slideText.trim(), stats };
};
