const { generateFeed } = require("../feed");

module.exports = async function (context) {
  context.log("JavaScript HTTP trigger function processed a request.");

  const feed = await generateFeed();
  console.log(feed);
  context.res = {
    // status: 200, /* Defaults to 200 */
    body: feed,
  };
};
