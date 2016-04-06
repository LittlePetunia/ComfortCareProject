var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');


var userSchema = mongoose.Schema({
	
	accountType: String, 
    userType: String, 
    imgPath : String, 
    description: String,
    phone: String,
    
        
    local:{
	    username:String,
        email        : String,  
        password     : String,
    },

    google:{
    	id           : String, 
        token        : String,
        email        : String,
        name         : String
    }
});


userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};


module.exports = mongoose.model('User', userSchema);