"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const cheerio = require("cheerio");
(0, dotenv_1.config)();
async function test() {
    const keyword = "Top-rated air fryers under $100";
    const scraperKey = process.env.SCRAPERAPI_KEY;
    const targetUrl = `https://www.google.com/search?q=site%3Areddit.com+OR+site%3Ayoutube.com+"${encodeURIComponent(keyword)}"+after%3A2024-01-01`;
    const scraperUrl = `https://api.scraperapi.com/?api_key=${scraperKey}&url=${encodeURIComponent(targetUrl)}&render=true`;
    console.log("Fetching: " + targetUrl);
    const response = await fetch(scraperUrl);
    console.log("Status: ", response.status);
    const html = await response.text();
    const $ = cheerio.load(html);
    const results = [];
    const allLinks = [];
    $('a').each((i, el) => {
        const h = $(el).attr('href');
        if (h && (h.includes('reddit.com') || h.includes('youtube.com')))
            allLinks.push(h);
    });
    console.log(`Found ${allLinks.length} total reddit/youtube links in raw HTML`);
    $('.tF2Cxc').each((i, el) => {
        const url = $(el).find('.yuRUbf a').attr('href') || '';
        const title = $(el).find('.yuRUbf h3').text() || '';
        const snippet = $(el).find('.VwiC3b').text() || '';
        if (url && title) {
            results.push({ title, url, snippet });
        }
    });
    console.log(`Successfully Parsed ${results.length} structured results using .tF2Cxc`);
    if (results.length === 0) {
        console.log("Trying alternative selector '#search div.g' ...");
        $('#search div.g').each((i, el) => {
            const url = $(el).find('a').first().attr('href') || '';
            const title = $(el).find('h3').first().text() || '';
            let snippet = $(el).find('div[data-sncf]').text();
            if (!snippet) {
                snippet = $(el).text().substring(0, 150);
            }
            if (url && title) {
                results.push({ title, url, snippet });
            }
        });
        console.log(`Parsed ${results.length} using '#search div.g'`);
    }
    if (results.length === 0) {
        console.log("Trying selector 'div.MjjYud' (often wraps organic results) ...");
        $('div.MjjYud').each((i, el) => {
            const url = $(el).find('a').first().attr('href') || '';
            const title = $(el).find('h3').first().text() || '';
            const snippet = $(el).text().substring(0, 150);
            if (url && title && (url.includes('reddit.com') || url.includes('youtube.com'))) {
                results.push({ title, url, snippet });
            }
        });
        console.log(`Parsed ${results.length} using 'div.MjjYud'`);
    }
    if (results.length > 0) {
        console.log("Sample result:");
        console.log(results.slice(0, 2));
    }
    else {
        console.log("No results parsed. Dumping snippet of HTML to see what Google returned:");
        console.log(html.substring(0, 3000));
    }
}
test();
