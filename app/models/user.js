var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var userSchema = new Schema({
	firstName: String,
	lastName: String,
	dens: Array,
	local			: {
		email		: String,
		password	: String
	}
});

userSchema.methods.generateHash = function(password){
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password){
	return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', userSchema);