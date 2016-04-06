var mongoose = require('mongoose');



var messageSchema = mongoose.Schema({
    messengerID : String,
    messengerName : String,
    receiverName : String,
    receiverID  : String,
    message : String,
    read : Boolean, 
    dateSent : {type:Date, default: Date.now}
});

module.exports = mongoose.model('Message', messageSchema);
