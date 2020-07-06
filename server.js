var express = require("express");
var bodyParser = require("body-parser");
var request = require("request");
var mongoose = require("mongoose");
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");
var Save = require("./models/Save.js");
var logger = require("morgan");
var cheerio = require("cheerio");
var path = require("path");
var app = express();
var PORT = process.env.PORT || 3000;

// Parse application/x-www-form-urlencoded
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(express.static("./public"));

// connect to database

const mongoURI = `mongodb+srv://mermer143:Duchess143!@cluster0.28o4d.mongodb.net/Scraper?retryWrites=true&w=majority`
mongoose
.connect(
    mongoURI,
    { useNewUrlParser: true, useUnifiedTopology: true } 
)
.then(() => console.log(`Successfully connected to MongoDB.` + 
`\n-----------------------------------------------------`))
.catch(err => console.log(err))


var exphbs = require("express-handlebars");

app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main",
  })
);

app.set("view engine", "handlebars");

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "views/index.html"));
});

require("./routes/scrape")(app);
require("./routes/html.js")(app);

app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, "views/index.html"));
});

app.listen(PORT, function () {
  console.log("App listening on PORT " + PORT);
});
