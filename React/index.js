const { generateFeed } = require("../feed");
const { load } = require("cheerio");
const { fetch } = require("cross-fetch");

const SITE_URL = "https://react.dev/blog";

const ITEM_SELECTOR = "article a.block";
const PRODUCT_TITLE_SELECTOR = "h2";
const PRODUCT_TIME_SELECTOR = ".items-center";

/**
 * @param {string} url
 * @param {string} siteUrl
 * @returns {string}
 */
function makeFullUrl(url, siteUrl) {
  if (url.startsWith("http")) {
    return url;
  }

  const uri = new URL(siteUrl);
  const origin = `${uri.protocol}//${uri.host}`;
  return new URL(url, origin).href;
}

async function getEntries() {
  const response = await fetch(SITE_URL);
  const page = await response.text();

  const $ = load(page);

  const entries = $(ITEM_SELECTOR);

  return entries
    .map(function () {
      const $el = $(this);
      const title = $el.find(PRODUCT_TITLE_SELECTOR).text();
      const link = $el.attr("href");
      const $timeEl = $el.find(PRODUCT_TIME_SELECTOR);
      const time = new Date($timeEl.text());

      return {
        title,
        link: makeFullUrl(link, SITE_URL),
        date: time,
      };
    })
    .get();
}

module.exports = async function (context, req) {
  context.log("JavaScript HTTP trigger function processed a request.");

  const entries = await getEntries();

  const feed = await generateFeed({
    title: "React",
    author: "React",
    feedLink: req.originalUrl, //"https://edsalter-rss.azurewebsites.net/api/hobbycomps",
    siteLink: "https://react.dev/blog",
    entries,
  });
  context.res = {
    // status: 200, /* Defaults to 200 */
    body: feed,
    headers: {
      ["Content-Type"]: "application/atom+xml",
    },
  };
};
