var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var mongoose = require("mongoose");
var logger = require('morgan');

var apiRouter = require('./routes/api');

var app = express();
const cors = require('cors'); //has to be added even though not mentioned...

pp.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());