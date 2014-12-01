var express = require("express");
var config = require("./config/config.js");
var chalk = require("chalk");
var router = require("./app/routes.js");
var morgan = require("morgan");

var app = express();

app.use(morgan('dev'));

app.use(express.static(__dirname + '/public'));

app.use('/', router);

app.listen(config.port);
console.log(chalk.green("Listening on port: " + config.port));