const XMLWriter = require("xml-writer");
const { format } = require("prettier");

/**
 * @typedef Entry
 * @property {string} title
 * @property {string} link
 * @property {string} [image]
 * @property {string} [description]
 */

/**
 * @typedef Feed
 * @property {string} title
 * @property {string} author
 * @property {string} feedLink
 * @property {string} siteLink
 * @property {string} description
 * @property {Entry[]} entries
 * @property {number} [imageWidth]
 * @property {number} [imageHeight]
 */

/**
 * @param {Feed} properties
 * @returns {Promise<*>}
 */
async function generateFeed(properties) {
  const xw = new XMLWriter();
  const doc = xw.startDocument();
  const feed = doc.startElement("feed");
  feed.writeAttribute("xmlns", "http://www.w3.org/2005/Atom");
  feed.writeAttribute("xmlns:media", "http://search.yahoo.com/mrss/");

  const link = feed.startElement("link");
  link.writeAttribute("rel", "self");
  link.writeAttribute("href", properties.feedLink);
  link.endElement();

  feed.writeElement("id", properties.siteLink);

  feed.writeElement("title", properties.title);

  const link2 = feed.startElement("link");
  link2.writeAttribute("rel", "alternate");
  link2.writeAttribute("href", properties.siteLink);
  link2.endElement();

  const author = feed.startElement("author");
  author.writeElement("name", properties.author);
  author.writeElement("uri", properties.siteLink);
  author.endElement();

  feed.writeElement("updated", new Date().toISOString());

  if (!Array.isArray(properties.entries)) {
    throw new Error("Entries must be an array");
  }

  properties.entries.forEach((e) => {
    const entry = feed.startElement("entry");
    entry.writeElement("id", e.link);
    entry.writeElement("title", e.title);

    const link = entry.startElement("link");
    link.writeAttribute("rel", "alternate");
    link.writeAttribute("href", e.link);
    link.endElement();

    const entryAuthor = entry.startElement("author");
    entryAuthor.writeElement("name", properties.author);
    entryAuthor.writeElement("uri", properties.siteLink);
    entryAuthor.endElement();

    entry.writeElement("published", new Date().toISOString());
    entry.writeElement("updated", new Date().toISOString());

    if (e.image || e.description) {
      const media = entry.startElement("media:group");
      media.writeElement("media:title", e.title);

      if (e.image) {
        const imageWidth = properties.imageWidth || "324";
        const imageHeight = properties.imageHeight || "324";

        const content = media.startElement("media:content");
        content.writeAttribute("url", e.image);
        content.writeAttribute("type", "image/png");
        content.writeAttribute("width", imageWidth);
        content.writeAttribute("height", imageHeight);
        content.endElement();

        const thumbnail = media.startElement("media:thumbnail");
        thumbnail.writeAttribute("url", e.image);
        thumbnail.writeAttribute("width", imageWidth);
        thumbnail.writeAttribute("height", imageHeight);
        thumbnail.endElement();
      }

      if (e.description) {
        media.writeElement("media:description", e.description);
      }

      media.endElement();
    }

    entry.endElement();
  });

  feed.endElement();
  doc.endDocument();

  return format(xw.toString(), {
    parser: "xml",
    bracketSameLine: true,
    tabWidth: 4,
    xmlWhitespaceSensitivity: "ignore",
  });
}

module.exports = {
  generateFeed,
};
