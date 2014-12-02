var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var expenseSchema = new Schema({
	den: String,
	title: String,
	description: String,
	amount: Number,
	date: Date,
	user: String,
	tags: Array
});

module.exports = mongoose.model('Expense', expenseSchema);