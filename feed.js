const {load} = require('cheerio');
const {Feed} = require('feed');

const URL = 'https://www.hobbycomps.co.uk/competitions/';

const PRODUCT_SELECTOR = '.product';
const PRODUCT_TITLE_SELECTOR = '.woocommerce-loop-product__title';
const PRODUCT_PRICE_SELECTOR = '.price';
const PRODUCT_IMAGE_SELECTOR = 'img';
const PRODUCT_LINK_SELECTOR = 'a';
const PRODUCT_TIME_SELECTOR = '.lty-lottery-countdown-timer';


async function getProductInfo() {
    const response = await fetch(URL);
    const page = await response.text();

    const $ = load(page);

    const products = $(PRODUCT_SELECTOR);

    return products.map(function () {
        const $el = $(this);
        const title = $el.find(PRODUCT_TITLE_SELECTOR).text();
        const price = $el.find(PRODUCT_PRICE_SELECTOR).text();
        const image = $el.find(PRODUCT_IMAGE_SELECTOR).attr('src');
        const link = $el.find(PRODUCT_LINK_SELECTOR).attr('href');
        const time = new Date($el.find(PRODUCT_TIME_SELECTOR).data('time'));

        return {
            title,
            price,
            image,
            link,
            date: time,
        }
    }).get();
}

async function generateFeed() {
    const products = await getProductInfo();

    const feed = new Feed({
        title: 'HobbyComp Competitions',
        description: 'Active competitions currently listed on HobbyComp.co.uk',
        link: 'https://www.hobbycomp.co.uk',
        id: 'https://www.hobbycomp.co.uk',
        copyright: 'Hobby Comps 2022',
    });

    products.forEach((p) => {
        feed.addItem({
            ...p

        })
    })

    return feed.rss2();
}

module.exports = {
    generateFeed
}
