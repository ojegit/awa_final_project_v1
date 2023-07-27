require('dotenv').config();

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var mongoose = require("mongoose");
var logger = require('morgan');

//import routes
var apiRouter = require('./routes/api');
//

var app = express();
const cors = require('cors'); //has to be added even though not mentioned...


//view engine
app.engine('pug', require('pug').__express);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
//

//database
const mongoDB = "mongodb://localhost:27017/projektidb1";
mongoose.connect(mongoDB);
mongoose.Promise = Promise;
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error"));
//

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//use routes
app.use('/', apiRouter);
//


//
//error handler
//


//port listener
port = 3000;
app.listen(port, () => console.log(`Server listening a port ${port}!`));
//