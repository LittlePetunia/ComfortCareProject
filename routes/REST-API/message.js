var router = require('express').Router();
var Message = require('../../models/message');
var sanitizer = require('sanitizer');

router.get("/messages", function(req, res){
	

	if (req.query.receiverID){
		Message.find({receiverID:req.query.receiverID}, function(err, messages){
			if (err){
				res.send(err);
			}
			res.json(messages);
		});
	}else{
		Message.find({}, function(err, messages){
			if (err){
				res.send(err);
			}
	        res.json(messages);
		});
	}
});

router.get("/messages/:id", function(req, res){
	Message.findById(req.params.id, function(err, message){
        if (err)
            res.send(err);
        res.json(message);
    })
});


router.post("/messages", validateFields, function(req, res){
	var newMessage = new Message();
	if (req.body.messengerID){
		newMessage.messengerID = req.body.messengerID;
	}
	if (req.body.messengerName){
		newMessage.messengerName = req.body.messengerName;
	}
	if (req.body.receiverID){
		newMessage.receiverID = req.body.receiverID;
	}
	if (req.body.receiverName){
		newMessage.receiverName = req.body.receiverName;
	}
	if (req.body.message){
		newMessage.message = req.body.message;
	}
	if (req.body.read){
		newMessage.read = req.body.read;
	}
	if (req.body.dateSent){
		newMessage.dateSent = req.body.dateSent;
	}

	newMessage.save(function(err, message){
		if (err)
			res.send(err)
		res.json(message);
	})
});

router.delete("/messages/:id", function(req, res){
	Message.remove({_id:req.params.id}, function(err, result){
        if (err)
            res.send(err);
        res.json(result);
    });
});

module.exports = router;


function validateFields(req, res, next){
    var flag = false;
    for (var field in req.body){
        if (req.body[field] != sanitizer.sanitize(req.body[field])){
            flag = true;
        }
    }   
    if (flag == true){
        res.json({ error: "invalid input! Try again."});

    }else{
        next();       
    }
}