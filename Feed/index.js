const {generateFeed} = require('../feed');

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    const feed = await generateFeed();

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: feed
    };
}
