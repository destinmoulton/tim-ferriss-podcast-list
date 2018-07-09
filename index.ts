import * as fs from "fs";

import * as nunjucks from "nunjucks";
import * as rssparser from "rss-parser";

const URL = "http://timferriss.libsyn.com/rss";
parseRSS(URL);

function parseRSS(url: string) {
    rssparser.parseURL(url, (err: Error, parsed: any) => {
        if (err) done(err);

        buildHTML(parsed.feed.entries);
    });
}

function done(err: Error) {
    if (err) {
        console.error(err, err.stack);
    }

    process.exit(1);
}

function buildHTML(items: any) {
    const template = "./templates/body.njk";
    const html = nunjucks.render(template, { items: processItems(items) });

    fs.writeFile("index.html", html, (err: Error) => {
        if (err) {
            return console.error("Unable to create index.html!");
        }

        console.log("index.html created successfully!");
    });
}

function processItems(origItems: any) {
    let episodeCount = origItems.length;

    let processedItems: any = [];
    origItems.forEach((item: any) => {
        const newItem = (<any>Object).assign({}, item);
        const titleInfo = stripEpisodeNumber(item.title);

        newItem.title = titleInfo.title;

        newItem.episodeNumber = titleInfo.episodeNumber;
        newItem.description = newItem.content;
        newItem.downloadFilename = `${newItem.episodeNumber} ${
            newItem.title
        }.mp3`;
        newItem.downloadURL = newItem.enclosure.url;

        processedItems.push(newItem);
        episodeCount--;
    });

    return processedItems;
}

function stripEpisodeNumber(title: string) {
    let episodeNumber = 0;

    let episodeTitle = title;
    let colonIndex = title.indexOf(":");
    if (colonIndex > -1) {
        episodeTitle = title.substring(colonIndex + 2);
    }

    if (title.indexOf("#") === 0) {
        episodeNumber = parseInt(title.substring(1, colonIndex + 1));
    } else if (title.startsWith("Episode ")) {
        episodeNumber = parseInt(title.substring(7, colonIndex + 1));
    } else if (title.startsWith("Ep. ")) {
        episodeNumber = parseInt(title.substring(3, colonIndex + 1));
    } else if (title.startsWith("Ep ")) {
        episodeNumber = parseInt(title.substring(2, colonIndex + 1));
    }

    if (isNaN(episodeNumber)) {
        episodeNumber = 0;
    }
    return { title: episodeTitle, episodeNumber: episodeNumber };
}
