const mongoose = require('mongoose');
// Create a new Express server
const express = require('express');
const app = express();
const db = require('./config/keys').mongoURI;
// Connect to MongoDB using Mongoose
mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log("Right on! Connected to MongoDB successfully."))
  .catch(err => console.log(err))

const users = require("./routes/api/users");
const tweets = require("./routes/api/tweets");
// Import body-parser to parse JSON we send to frontend
const bodyParser = require("body-parser");
const passport = require("passport");
require('./config/passport')(passport)


// Specify which port to run on (process.env.PORT is for Heroku)
const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server is running on port ${port}`));

// Setup basic route. N.B. the callback for every
// Express route requires a request and response as arguments
app.use(bodyParser.urlencoded({ extended: false })); // Tell app to respond from requests from other software (i.e. Postman)
app.use(bodyParser.json()); // Tell app to respond to JSON requests
app.use(passport.initialize()); // Middleware for passport
app.use("/api/users", users);
app.use("/api/tweets", tweets);