var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');


var applySchema = new mongoose.Schema({
	
	accountType: String, 
    userType: String, 
    imgPath : String, 
    description: String,
    city: String,
    phone: String,
    latitude: String,
    altitude: String,

    local:{
	    username: String,
        email        : String, 
        password     : String,
    },

});

// checking if password is valid
applySchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

applySchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

module.exports = mongoose.model('Apply', applySchema);

