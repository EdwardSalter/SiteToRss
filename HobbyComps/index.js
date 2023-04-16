const { generateFeed } = require("../feed");
const { load } = require("cheerio");
const { fetch } = require("cross-fetch");

const URL = "https://www.hobbycomps.co.uk/competitions/";

const PRODUCT_SELECTOR = ".product";
const PRODUCT_TITLE_SELECTOR = ".woocommerce-loop-product__title";
const PRODUCT_PRICE_SELECTOR = ".price";
const PRODUCT_IMAGE_SELECTOR = "img";
const PRODUCT_LINK_SELECTOR = "a";
const PRODUCT_TIME_SELECTOR = ".lty-lottery-countdown-timer";

async function getProductInfo() {
  const response = await fetch(URL);
  const page = await response.text();

  const $ = load(page);

  const products = $(PRODUCT_SELECTOR);

  return products
    .map(function () {
      const $el = $(this);
      const title = $el.find(PRODUCT_TITLE_SELECTOR).text();
      const price = $el.find(PRODUCT_PRICE_SELECTOR).text();
      const image = $el.find(PRODUCT_IMAGE_SELECTOR).attr("src");
      const link = $el.find(PRODUCT_LINK_SELECTOR).attr("href");
      const time = new Date($el.find(PRODUCT_TIME_SELECTOR).data("time"));

      return {
        title,
        price,
        image,
        link,
        date: time,
      };
    })
    .get();
}

module.exports = async function (context, req) {
  context.log("JavaScript HTTP trigger function processed a request.");

  const products = await getProductInfo();

  const feed = await generateFeed({
    title: "HobbyComp Competitions",
    author: "HobbyComps",
    feedLink: req.originalUrl, //"https://edsalter-rss.azurewebsites.net/api/hobbycomps",
    siteLink: "https://www.hobbycomps.co.uk",
    entries: products.map((p) => ({
      title: p.title,
      link: p.link,
      image: p.image,
      description: p.price,
    })),
  });
  context.res = {
    // status: 200, /* Defaults to 200 */
    body: feed,
    headers: {
      ["Content-Type"]: "application/atom+xml",
    },
  };
};
