var router = require('express').Router();
var Posting = require('../../models/posting');
var sanitizer = require('sanitizer');

router.delete("/postings/:id", function(req, res){
    Posting.remove({_id:req.params.id}, function(err, result){
        if (err)
            res.send(err);
        res.json(result);
    })
});


router.get("/postings", function(req, res){
    Posting.find({}, function(err, postings) {

        if (err)
            res.send(err);
        res.json(postings);    
    });

});

router.put("/postings/:id", validateFields, function(req, res){
    Posting.findById(req.params.id, function(err, posting){
        if (err)
            res.send(err);
        if (req.body.availability){
            posting.availability = req.body.availability;
        }

        posting.save(function(err){
            if (err)
                res.send(err);
            res.json(posting);  
        });
    });
});


router.post("/postings", validateFields, function(req, res){
    var newPosting = new Posting();
    if (req.body.ISBN){
        newPosting.ISBN = req.body.ISBN;
    }
    if (req.body.postingTitle){
        newPosting.postingTitle = req.body.postingTitle;
    }
    if (req.body.bookTitle){
        newPosting.bookTitle = req.body.bookTitle;
    }
    if (req.body.authors){
        newPosting.authors = req.body.authors;
    }
    if (req.body.ownerID){
        newPosting.ownerID = req.body.ownerID;
    }
    if (req.ownerName){
        newPosting.ownerName = req.body.ownerName;
    }
    if (req.body.description){
        newPosting.description = req.body.description;
    }
    if (req.body.price){
        newPosting.price = req.body.price;
    }
    if (req.body.field){
        newPosting.field = req.body.field;
    }
    if (req.body.availability){
        newPosting.availability = req.body.availability;
    }

    newPosting.save(function(err, posting){
        if (err)
            res.send(err);
        res.json(posting);
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