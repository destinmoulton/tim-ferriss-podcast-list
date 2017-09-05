const fs = require("fs");

const feedparser = require("feedparser-promised");
const nunjucks = require("nunjucks");

const URL = "http://timferriss.libsyn.com/rss";

feedparser.parse(URL)
    .then((items)=>{
        buildHTML(items);
    })
    .catch((err)=>{
        console.error(err);
    })

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

function stripEpisodeNumber(title){
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