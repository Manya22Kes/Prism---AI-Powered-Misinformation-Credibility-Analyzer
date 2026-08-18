import * as cheerio from "cheerio";


export const extractNotesContent = (xmlString) => {
  const $ = cheerio.load(xmlString, { xmlMode: true });
  let notesText = "";

  $("a\\:t").each((_, t) => {
    const text = $(t).text();
    if (text.trim()) {
      notesText += text.trim() + " ";
    }
  });

  return notesText.trim();
};
