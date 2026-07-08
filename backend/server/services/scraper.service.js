const axios = require("axios");
const cheerio = require("cheerio");

const scrapeContent = async (url) => {
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);
  return $("body").text().trim();
};

module.exports = { scrapeContent };
