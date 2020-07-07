//dependencies
const express = require("express");
const exphbs = require("express-handlebars");
const logger = require("morgan");
const request = require("request");
const cheerio = require("cheerio");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const axios = require("axios");

//Require models
const db = require("./models");

const PORT = 3000;

//initialize express
const app = express();

app.use(logger("dev"));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

const MONGODB_URI = process.env.heroku_czdqmb1p || "mongodb://andyj:andy123@ds119343.mlab.com:19343/heroku_czdqmb1p

mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

//database configuration
// const databaseUrl = "nytdb";
// const collections = ["scrapedArticles"];


// Routes

app.get("/", function(req, res) {
    res.render("index");
});
// GET route for scraping WSJ website
app.get("/scrape", function (req, res) {
    axios.get("https://www.nytimes.com/").then(function(response) {
        const $ = cheerio.load(response.data);

        $("article a").each(function(i, element) {
            const result = {};
            const pTag = $(this).children("p").text();
            const ulTag = $(this).children("ul").text();

            if (pTag) {
            result.title = $(this).children().children("h2").text();
            result.link = $(this).attr("href");
            result.summary = pTag
            } else {
                result.title = $(this).children().children("h2").text();
                result.link = $(this).attr("href");
                result.summary =  ulTag;
            }

            db.Article.create(result)
                .then(function(dbArticle) {
                console.log(dbArticle);
                })
                .catch(function(err) {
                console.log(err);
                });
        });
        res.send("Scrape Complete");
    });
});

app.get("/articles", function(req, res) {
    db.Article.find({}).then(function(dbArticle) {
        res.json(dbArticle);
    })
    .catch(function (err) {
        res.json(err)
    })
})

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.findOne({ _id: req.params.id })
      // ..and populate all of the notes associated with it
      .populate("note")
      .then(function(dbArticle) {
        // If we were able to successfully find an Article with the given id, send it back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

  // Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
      .then(function(dbNote) {

        return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
      })
      .then(function(dbArticle) {
        // If we were able to successfully update an Article, send it back to the client    
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

app.listen(PORT, function () {
    console.log(`App running on port ${PORT}!`);
});