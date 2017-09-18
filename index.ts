import request from "request";
import fs from "fs";

import FeedParser from "feedparser";
import nunjucks from "nunjucks";

const URL = "http://timferriss.libsyn.com/rss";
parseRSS(URL);


function parseRSS(url: string){
    const req = request(url);
    const feedparser = new FeedParser({});

    req.onRequestError((err)=>{
        done(err);
    });

    req.onRequestResponse((res)=>{
        if(res.statusCode !== 200){
            done(new Error("There was a problem fetching the RSS feed."));
        } else {
            res.pipe(feedparser);
        }
    });

    feedparser.on("error", done);
    feedparser.on("end", done);
    feedparser.on("readable", (data)=>{
        console.log(data);
    });
}

function done(err: Error){
    if(err){
        console.error(err, err.stack);
    }

    process.exit(1);
}


function buildHTML(items){
    const template = "./templates/body.njk";
    const html = nunjucks.render(template, {items: processItems(items)});

    fs.writeFile("index.html", html, (err)=>{
        if(err) {
            return console.error("Unable to create index.html!");
        }

        console.log("index.html created successfully!")
    });
}

function processItems(origItems){
    let episodeCount = origItems.length;

    let processedItems = [];
    origItems.forEach((item)=>{
        const newItem = Object.assign({}, item);
        const titleInfo = stripEpisodeNumber(item.title);

        newItem.title = titleInfo.title;
        newItem.episodeNumber = titleInfo.episodeNumber;

        processedItems.push(newItem);
        episodeCount--;
    });

    return processedItems;
}

function stripEpisodeNumber(title: string){
    let episodeNumber = 0;
    
    let episodeTitle = title;
    let colonIndex = title.indexOf(":");
    if(colonIndex > -1){
        episodeTitle = title.substring(colonIndex + 2);
    }
    
    if(title.indexOf("#") === 0){
        episodeNumber = parseInt(title.substring(1, colonIndex + 1));
    } else if(title.startsWith("Episode ")){
        episodeNumber = parseInt(title.substring(7, colonIndex + 1));
    } else if(title.startsWith("Ep. ")){
        episodeNumber = parseInt(title.substring(3, colonIndex + 1));
    } else if(title.startsWith("Ep ")){
        episodeNumber = parseInt(title.substring(2, colonIndex + 1));
    }

    if(isNaN(episodeNumber)){
        episodeNumber = 0;
    }
    return {title: episodeTitle, episodeNumber: episodeNumber};
}