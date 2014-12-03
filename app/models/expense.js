var mongoose = require("mongoose");
var Schema = mongoose.Schema;
//currency library
require('mongoose-currency').loadType(mongoose);
var Currency = mongoose.Types.Currency;

var expenseSchema = new Schema({
	den: String,
	title: String,
	description: String,
	amount: {type: Currency},
	date: Date,
	user: String,
	tags: Array
});

module.exports = mongoose.model('Expense', expenseSchema);