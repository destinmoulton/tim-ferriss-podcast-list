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
    const html = nunjucks.render(template, {items: items});

    fs.writeFile("index.html", html, (err)=>{
        if(err) {
            return console.error("Unable to create index.html!");
        }

        console.log("index.html created successfully!")
    });
}