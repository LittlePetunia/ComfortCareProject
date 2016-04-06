var express = require('express');
var Apply = require('../../models/apply');
var router = express.Router();
var sanitizer = require('sanitizer');


router.get("/applies",  function(req, res){
    Apply.find({},  function(err, applies) {
        if (err)
            res.send(err);
        res.json(applies);    
    });

});

router.post('/apply', validateFields, function(req, res){
	var newapply = new Apply();
	if (req.body.accountType){
		newapply.accountType = req.body.accountType;
	}
	if (req.body.userType){
		newapply.userType = req.body.userType;
	}
	if (req.body.imgPath){
        newapply.imgPath = req.body.imgPath;
    }
    if (req.body.phone){
		newapply.phone = req.body.phone;
	}
	if (req.body.description){
        newapply.description = req.body.description;
    }
	if (req.body.latitude){
	 	newapply.latitude = req.body.latitude;
	 }
	 if (req.body.altitude){
	 	newapply.altitude = req.body.altitude;
	 }
	if (req.body.userType == 'local'){
		if (req.body.username){
            newapply.local.username = req.body.username;
        }
		if (req.body.email){
			newapply.local.email = req.body.email;
		}
		if (req.body.password){
            newUser.local.password = req.body.password;
        }
	}
	newapply.save(function(err, applying){
		if (err)
			res.send(err);
		res.json(applying);
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