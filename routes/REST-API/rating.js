var router = require('express').Router();
var Rating = require('../../models/rating');
var sanitizer = require('sanitizer');


router.post("/postings/:pid/ratings", validateFields, function(req, res){
    var newRating = new Rating();
    newRating.postingID = req.params.pid;
    if (req.body.heading){
        newRating.heading = req.body.heading;
    }
    if (req.body.raterID){
        newRating.raterID = req.body.raterID;
    }
    if (req.body.raterName){
        newRating.raterName = req.body.raterName;
    }
    if (req.body.comment){
        newRating.comment = req.body.comment;
    }
    if (req.body.rating){
        newRating.rating = req.body.rating;
    }

    newRating.save(function(err, rating){
        if (err)
            res.send(err);
        res.json(rating);
    });
});

router.delete("/postings/:pid/ratings/:rid", function(req, res){
    Rating.remove({_id: req.params.rid}, function(err, result){
        if (err)
            res.send(err);
        res.json(result);
    });
});


router.get("/postings/:pid/ratings", function(req, res){
    Rating.find({postingID:req.params.pid}, function(err, ratings){
        if (err)
            res.send(err);
        res.json(ratings);
    });
});



router.get("/ratings", function(req, res){
    Rating.find({}, function(err, ratings){
        if (err)
            res.send(err);
        res.json(ratings);
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