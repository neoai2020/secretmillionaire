import * as cheerio from 'cheerio';

async function test() {
    const keyword = "Top-rated air fryers under $100";
    const scraperKey = "32b75ca1bab9047cfa6197108747e16f";
    const targetUrl = `https://www.google.com/search?q=site%3Areddit.com+OR+site%3Ayoutube.com+${encodeURIComponent(keyword)}+after%3A2024-01-01`;
    const scraperUrl = `https://api.scraperapi.com/?api_key=${scraperKey}&url=${encodeURIComponent(targetUrl)}&render=true&premium=true`;

    console.log("Fetching: " + targetUrl);
    const response = await fetch(scraperUrl);
    console.log("Status: ", response.status);
    const html = await response.text();
    const $ = cheerio.load(html);
    const results = [];

    const allLinks = [];
    $('a').each((i, el) => {
        const h = $(el).attr('href');
        if (h && (h.includes('reddit.com') || h.includes('youtube.com'))) allLinks.push(h);
    });
    console.log(`Found ${allLinks.length} total reddit/youtube links in raw HTML`);

    $('.tF2Cxc').each((i, el) => {
        const url = $(el).find('.yuRUbf a').attr('href') || $(el).find('a').first().attr('href') || '';
        const title = $(el).find('.yuRUbf h3').text() || $(el).find('h3').first().text() || '';
        const snippet = $(el).find('.VwiC3b').text() || $(el).text().substring(0, 100);
        if (url && title) {
            results.push({ title, url, snippet });
        }
    });
    console.log(`Successfully Parsed ${results.length} structured results using .tF2Cxc`);

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
    } else {
        console.log("No results parsed. Dumping snippet of HTML to see what Google returned:");
        console.log(html.substring(0, 2000));
    }
}

test();
