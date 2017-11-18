const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cheerio = require("cheerio");
const exhbs = require("express-handlebars");
const axios = require("axios");

const db = require("./models");

const PORT = 3000;

const app = express();

app.use(bodyParser.urlencoded({ extended: false}));

app.use(express.static("public"));

// pointing handlebars to main page
app.engine("handlebars", exhbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

mongoose.Promise = Promise;

mongoose.connect("mongodb://localhost/mongoScraper",{
  useMongoClient: true
});

// Route to scrape digg.com and insert articles into database
app.get("/scrape", function(req, res) {
  axios.get("http://digg.com/channel/technology")
  .then(function(response){
    var $ = cheerio.load(response.data);

   $("header h2").each(function(i, element) {
      var result = {};
      // console.log(i);

      result.title = $(this).children("a").text();
      result.link = $(this).children("a").attr("href");
      result.summary = $(this).children("a").text(); 
      // console.log(result);
      db.Article
      .create(result)
      .then(function(dbArticle){
        }).catch(function(err){     
      });
    })
   res.send(true);
   res.redirect("/");
  });
});


// Root route finding all articles in database, sorting them and rendering the handlebars
app.get("/", function (req, res) {
    db.Article
    .find({saved: false})
    .sort({_id: -1})
    .then(function(result){
        console.log("hello");
        res.render("index", {articles: result, saved: false});
      });
    });
  
   


app.get("/saved", function(req, res){
  db.Article
  .find({saved: true})
  .sort({_id: -1})
  .then(function(articles){
    res.render("index", {articles: articles, saved: true});
  })
  .catch(function(err){
    res.json(err);
  });
});

// Route to save articles you like
app.get("/save/:id", function (req, res) {
    db.Article.findOneAndUpdate({"_id": req.params.id}, {"saved": true}, {new: true})
    .then(function (err, article) {
        if(err) {
          res.send(err)
        }
        else {
          console.log("article saved successfully")
          res.status(200)
        };
      });
  });

// route to add a comment
app.post("/articles/:id", function(req, res) {
    db.Note.create(req.body)
    .then(function(dbComment) {  
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: { comments: dbComment._id } }, { new: true });
    }).then(function(dbArticle) {
    res.json(dbArticle);
    }).catch(function(err) {
      res.json(err);
    });
});

// route to remove article
app.delete("/remove/:id", function(req, res) {
    Comment.findOne({"_id": req.params.id}).remove().then(function (err, remove) {
      if (err) {
        console.log(err)
      } else {
        res.redirect("/articles")
      }
    });
  });


app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});



