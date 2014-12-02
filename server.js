var express = require("express");
var config = require("./config/config.js");
var chalk = require("chalk");
var router = require("./app/routes.js");
var morgan = require("morgan");
var mongoose = require("mongoose");
var path = require("path");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var flash = require("connect-flash");

var app = express();

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());

var db = mongoose.connect(config.db, function(err) {
	if (err) {
		console.error(chalk.red('Could not connect to MongoDB!'));
		console.log(chalk.red(err));
	}
	else {
		console.log(chalk.green("MongoDB connection established to " + config.db));
	}
});

app.use('/',express.static(path.resolve('./public')));
app.use('/api', router);

app.listen(config.port);
console.log(chalk.green("Listening on port: " + config.port));