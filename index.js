"use strict";
exports.__esModule = true;
var fs = require("fs");
var nunjucks = require("nunjucks");
var rssparser = require("rss-parser");
var URL = "http://timferriss.libsyn.com/rss";
parseRSS(URL);
function parseRSS(url) {
    rssparser.parseURL(url, function (err, parsed) {
        if (err)
            done(err);
        buildHTML(parsed.feed.entries);
    });
}
function done(err) {
    if (err) {
        console.error(err, err.stack);
    }
    process.exit(1);
}
function buildHTML(items) {
    var template = "./templates/body.njk";
    var html = nunjucks.render(template, { items: processItems(items) });
    fs.writeFile("index.html", html, function (err) {
        if (err) {
            return console.error("Unable to create index.html!");
        }
        console.log("index.html created successfully!");
    });
}
function processItems(origItems) {
    var episodeCount = origItems.length;
    var processedItems = [];
    origItems.forEach(function (item) {
        var newItem = Object.assign({}, item);
        var titleInfo = stripEpisodeNumber(item.title);
        newItem.title = titleInfo.title;
        newItem.episodeNumber = titleInfo.episodeNumber;
        newItem.description = newItem.content;
        newItem.downloadFilename = newItem.episodeNumber + " " + newItem.title + ".mp3";
        newItem.downloadURL = newItem.enclosure.url;
        processedItems.push(newItem);
        episodeCount--;
    });
    return processedItems;
}
function stripEpisodeNumber(title) {
    var episodeNumber = 0;
    var episodeTitle = title;
    var colonIndex = title.indexOf(":");
    if (colonIndex > -1) {
        episodeTitle = title.substring(colonIndex + 2);
    }
    if (title.indexOf("#") === 0) {
        episodeNumber = parseInt(title.substring(1, colonIndex + 1));
    }
    else if (title.startsWith("Episode ")) {
        episodeNumber = parseInt(title.substring(7, colonIndex + 1));
    }
    else if (title.startsWith("Ep. ")) {
        episodeNumber = parseInt(title.substring(3, colonIndex + 1));
    }
    else if (title.startsWith("Ep ")) {
        episodeNumber = parseInt(title.substring(2, colonIndex + 1));
    }
    if (isNaN(episodeNumber)) {
        episodeNumber = 0;
    }
    return { title: episodeTitle, episodeNumber: episodeNumber };
}
