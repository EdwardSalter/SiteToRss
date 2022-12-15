const { generateFeed } = require("../feed");

module.exports = async function (context) {
  context.log("JavaScript HTTP trigger function processed a request.");

  const feed = await generateFeed();
  context.res = {
    // status: 200, /* Defaults to 200 */
    body: feed,
    headers: {
      ["Content-Type"]: "application/atom+xml",
    },
  };
};
