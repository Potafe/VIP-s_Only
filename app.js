const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
var passport = require("passport");
var crypto = require("crypto");
var path = require("path");
var routes = require("./routes");
const connection = require("./config/database");
var logger = require("morgan");

// Package documentation - https://www.npmjs.com/package/connect-mongo
const MongoStore = require("connect-mongo");

// Confirmation for connection to DataBase:
mongoose.set("strictQuery", false);
const mongoDB = process.env.DB_STRING;
main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
  console.log("Connected to DATABASE");
}

// Need to require the entire Passport config module so app.js knows about it
require("./config/passport");

/**
 * -------------- GENERAL SETUP ----------------
 */

// Gives us access to variables set in the .env file via `process.env.VARIABLE_NAME` syntax
require("dotenv").config();

var indexRouter = require("./routes/index");
const catalogRouter = require("./routes/catalog");

// Create the Express application
var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/catalog", catalogRouter); // Add catalog routes to middleware chain

/**
 * -------------- SESSION SETUP ----------------
 */

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: process.env.DB_STRING }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // equals 1 day
    },
  })
);

/**
 * -------------- PASSPORT AUTHENTICATION ----------------
 */

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  console.log(req.session);
  console.log(req.user);
  next();
});

/**
 * -------------- ROUTES ----------------
 */

// Imports all of the routes from ./routes/index.js
app.use(routes);

/**
 * -------------- SERVER ----------------
 */

// Server listens on http://localhost:3000
app.listen(3000);
