var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var denSchema = new Schema({
	name: String,
	users: Array,
	lastUpdated: Date
});

module.exports = mongoose.model('Den', denSchema);