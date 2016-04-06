var router = require('express').Router();
var User = require('../../models/user');
var sanitizer = require('sanitizer');



router.get("/users",  function(req, res){
    User.find({},  function(err, users) {

        if (err)
            res.send(err);
        res.json(users);    
    });

});


router.get("/users/:id", function(req, res){
    User.findById(req.params.id, function(err, user) {

        if (err)
            res.send(err);
        res.json(user);    
    });
});


router.post("/users", validateFields, function(req, res){
    var newUser = new User();
    if (req.body.accountType){
        newUser.accountType = req.body.accountType;
    }
    if (req.body.userType){
        newUser.userType = req.body.userType;
    }
    if (req.body.imgPath){
        newUser.imgPath = req.body.imgPath;
    }
    if (req.body.description){
        newUser.description = req.body.description;
    }
    if (req.body.phone){
        newUser.phone = req.body.phone;
    }
    if (req.body.accountType == "local"){
        if (req.body.username){
            newUser.local.username = req.body.username;
        }
        if (req.body.email){
            newUser.local.email = req.body.email;
        }
        if (req.body.password){
            newUser.local.password = req.body.password;
        }
    }

    newUser.save(function(err, user){
        if(err){
            res.send(err);
        }
        res.json(user);
    });
});


router.put("/users/:id", validateFields, function(req, res){
    User.findById(req.params.id, function(err, user) {

        if (err)
            res.send(err);

        if (req.body.name && user.accountType =="local"){
            user.local.username = req.body.name;
        }
        if (req.body.password && user.accountType =="local"){
            user.local.password = req.body.password;
        }

        if (req.body.phone){
            user.phone = req.body.phone;
        }

        if (req.body.description){
            user.description = req.body.description;
        }

        user.save(function(err){
            if (err){
                res.send(err);
            }else{
                res.json(user)  
            }
        });
    });
});



router.delete("/users/:id", function(req, res){
    User.remove({_id:req.params.id}, function(err, result) {
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

