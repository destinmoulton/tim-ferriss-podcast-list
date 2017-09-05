const feedparser = require("feedparser-promised");

const URL = "http://timferriss.libsyn.com/rss";

feedparser.parse(URL)
    .then((items)=>{
        items.forEach((item)=>{
            console.log(item.title);
        });
    })
    .catch((err)=>{
        console.error(err);
    })