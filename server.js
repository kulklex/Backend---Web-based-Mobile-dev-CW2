const express = require("express");
const app = express();
const path = require("path");
const PORT = process.env.PORT || 5000;
const cors = require("cors");
const ObjectID = require("mongodb").ObjectId;
const morgan = require('morgan')

// Allow use from any url
app.use(cors());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

// Logging middlewares
app.use((req, res, next) => {
  console.log("Request IP: " + req.ip);
  console.log("Request url: " + req.url);
  console.log("Request type: " + req.method);
  console.log("Request date: " + new Date());
  next();
});


// Middleware to serve the static file
app.use(express.static('static'))

// Error logger
app.use(morgan('tiny'))

// use json data
app.use(express.json());

// connect to the database
const { MongoClient } = require("mongodb");
const uri =
  "mongodb+srv://kulklex:PHmrdQlNT8qwwClK@cluster0.z1hfgdd.mongodb.net/Kulklex";

let db;
MongoClient.connect(uri, (err, client) => {
  db = client.db("Kulklex");
});

// Test api is working
app.get("/", (req, res, next) => {
  res.send("Welcome to Lessons");
});

// Get all lessons
app.get("/lessons", (req, res, next) => {
  db.collection("lessons")
    .find({})
    .toArray((err, results) => {
      if (err) {
        console.error(err);
        return next(err);
      }
      res.json(results);
    });
});

// Update lesson spaces
app.put("/lessons/:lessonID", (req, res, next) => {
  req.body.forEach((item) => {
    let filter = { _id: new ObjectID(item._id) };
    let newValue = { $set: { spaces: item.spaces } };
    let options = { safe: true, multi: false };
    db.collection("lessons").updateOne(
      filter,
      newValue,
      options,
      (err, result) => {
        if (err) return next(err);
      }
    );
  });
  res.send({ msg: "Spaces updated!" });
});

// Add a new order
app.post("/orders", (req, res, next) => {
  let order = req.body;
  db.collection("orders").insertOne(order, (err, result) => {
    if (err) return next(err);
    res.send({ msg: "Order added successfully" });
  });
});

// Search route
app.get("/lessons/search", (req, res) => {
  let searchQuery = req.query.filter;
  db.collection("lessons")
    .find({})
    .toArray((err, results) => {
      if (err) return next(err);
      let filteredList = results.filter((lesson) => {
        return (
          lesson.subject.toLowerCase().match(searchQuery.toLowerCase()) ||
          lesson.location.toLowerCase().match(searchQuery.toLowerCase())
        );
      });
      res.send(filteredList);
    });
});

// Error Handling
app.use((req, res) => {
  res.status(404);
  res.send("File not found");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
