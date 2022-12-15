const { load } = require("cheerio");
const XMLWriter = require("xml-writer");
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

async function generateFeed() {
  const products = await getProductInfo();

  const xw = new XMLWriter();
  const doc = xw.startDocument();
  const feed = doc.startElement("feed");
  feed.writeAttribute("xmlns", "http://www.w3.org/2005/Atom");
  feed.writeAttribute("xmlns:media", "http://search.yahoo.com/mrss/");

  const link = feed.startElement("link");
  link.writeAttribute("rel", "self");
  link.writeAttribute(
    "href",
    "https://edsalter-rss.azurewebsites.net/api/feed"
  );
  link.endElement();

  feed.writeElement("id", "HobbyComp");

  feed.writeElement("title", "HobbyComp Competitions");

  const link2 = feed.startElement("link");
  link2.writeAttribute("rel", "alternate");
  link2.writeAttribute("href", "https://www.hobbycomp.co.uk");
  link2.endElement();

  const author = feed.startElement("author");
  author.writeElement("name", "HobbyComp");
  author.writeElement("uri", "https://www.hobbycomp.co.uk");
  author.endElement();

  feed.writeElement("published", new Date().toISOString());

  products.forEach((p) => {
    const entry = feed.startElement("entry");
    entry.writeElement("id", p.title);
    entry.writeElement("title", p.title);

    const link = entry.startElement("link");
    link.writeAttribute("rel", "alternate");
    link.writeAttribute("href", p.link);
    link.endElement();

    const entryAuthor = entry.startElement("author");
    entryAuthor.writeElement("name", "HobbyComps");
    entryAuthor.writeElement("uri", "https://www.hobbycomp.co.uk");
    entryAuthor.endElement();

    entry.writeElement(
      "published",
      new Date("2022-12-05T13:39:10.000Z").toISOString()
    );

    const media = entry.startElement("media:group");
    media.writeElement("media:title", p.title);
    const content = media.startElement("media:content");
    content.writeAttribute("url", p.image);
    content.writeAttribute("type", "image/png");
    content.writeAttribute("width", "324");
    content.writeAttribute("height", "324");
    content.endElement();

    const thumbnail = media.startElement("media:thumbnail");
    thumbnail.writeAttribute("url", p.image);
    thumbnail.writeAttribute("width", "324");
    thumbnail.writeAttribute("height", "324");
    thumbnail.endElement();

    media.writeElement("media:description", p.price);

    media.endElement();
    entry.endElement();
  });

  feed.endElement();
  doc.endDocument();

  return xw.toString();

  // const feed = new Feed({
  //     title: 'HobbyComp Competitions',
  //     description: 'Active competitions currently listed on HobbyComp.co.uk',
  //     link: 'https://www.hobbycomp.co.uk',
  //     id: 'https://www.hobbycomp.co.uk',
  //     copyright: 'Hobby Comps 2022',
  // });

  // products.forEach((p) => {
  //     feed.addItem({
  //         ...p,
  //         description: p.price,
  //         content: p.image,
  //     })
  // })
  //
  // return feed.atom1();
}

module.exports = {
  generateFeed,
};
