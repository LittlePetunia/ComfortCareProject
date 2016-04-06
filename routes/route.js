
var User = require('../models/user');
var Posting = require('../models/posting');
var Rating = require('../models/rating');
var Message = require('../models/message');
var Apply = require('../models/apply');

var multer  = require('multer')
var upload = multer({ dest: 'static/avatar/' })
var fs = require("fs");
var path = require("path");
var sanitizer = require('sanitizer');



module.exports=function(app, passport){
 

    app.get("/", function(req, res){
        res.redirect("/home.html");
    });

    app.get("/home.html", function(req, res){
        var data = getData(req);
        data.tab = "home";
        res.render("home.ejs", data);
    });

    app.get("/about-us.html", function(req, res){
        var data = getData(req);
        data.tab = "about-us";
        res.render("about-us.ejs", data);
    });

    app.get("/view-users.html", isLoggedIn, function(req, res){
        User.find({}, function(err, users) {
            if (err)
                res.send(err);

            var data=getData(req);
            data.userList = users;
            data.tab = "view-users";
            res.render('user-list.ejs', data);    
        });
    });
    app.get("/view-volun.html", function(req, res){
        //Find all users
        Apply.find({}, function(err, applies) {
            if (err)
                res.send(err);

            var data=getData(req);
            data.volunList = applies;
            data.tab = "view-volun";
            res.render('view-volun.ejs', data);    
        });
    });

    app.get("/volunteer-apply.html", function(req, res){
        var data = getData(req);
        data.tab = "volunteer-apply";
        res.render("volunteer-apply.ejs", data);
    });


    app.get("/volunteer-search.html", function(req, res){
        Apply.find({}, function(err, applies) {
            if (err)
                res.send(err);

            var data=getData(req);
            data.volunList = applies;
            data.tab = "volunteer-search";
            res.render('volunteer-search.ejs', data);    
        });
    });    




    app.get("/search-postings.html", isLoggedIn, function(req, res){

        Posting.find({}, function(err, postings){
            if (err){
                res.send(err);
            }
            var data = getData(req);
            data.tab = "search-postings";
            data.postingList = postings;
            res.render("posting-list.ejs", data);
            
        });
    });

    app.get("/login.html", isNotLoggedIn, function(req, res){
        var data = getData(req);
        data.tab = "login";
        data.loginMessage=req.flash('loginMessage');
        res.render("login.ejs", data);  
        
    });


    app.get("/signup.html", isNotLoggedIn, function(req, res){
        var data = getData(req);
        data.tab = "signup";
        data.signupMessage=req.flash('signupMessage');
        res.render('signup.ejs', data);
        
    });

    app.get('/my-profile.html', isLoggedIn, function(req, res){
        return res.redirect('/users/' + req.user.id + "/profile.html");
    });

    app.get('/users/:id/profile.html', isLoggedIn, function(req, res) {

        if (req.user.id == req.params.id){
            var data=getData(req);
            data.tab = "my-profile";
            res.render('my-profile.ejs', data);        
        }

        else{
            User.findById(req.params.id, function(err, selectedUser) {
                    if (err)
                        res.send(err);

                    if (!selectedUser)
                        res.json({message: "user with selected id not found"});

                    var data=getData(req);
                    data.selectedUser = selectedUser;
                    data.tab = "user-profile";
                    res.render("user-profile.ejs", data);
                }
            );
        }
    });


    app.get("/users/:id/postings.html", isLoggedIn, function(req, res){
        if (req.params.id == req.user.id){
            Posting.find({ownerID: req.user.id}, function(err, postings){
                var data = getData(req);
                data.postingList = postings;
                data.tab = "my-postings";
                res.render("posting-list.ejs", data);
            });
        }
    });

    app.get("/postings/:id/details.html", isLoggedIn, function(req, res){
        Posting.findById(req.params.id, function(err, posting){
            if (err)
                res.send(err);

            Posting
            .find({field:posting.field, _id: {$ne : posting.id}}, 
            function(err, recommendations){
                if(posting.ownerID == req.user.id){
                    var data = getData(req);
                    data.posting = posting;
                    data.recommendations = recommendations;
                    data.tab = "my-postings";
                    res.render("my-posting-details.ejs", data);
                }else{
                    var data = getData(req);
                    data.posting = posting;
                    data.recommendations = recommendations;
                    data.tab = "search-postings";
                    res.render("posting-details.ejs", data);
                }
            });
        });
    });

    app.get('/users/:id/edit_profile.html', isLoggedIn, function(req, res) {

        if (req.user.id == req.params.id){
            var data=getData(req);
            data.tab = "my-profile";
            data.passwordMessage = req.flash("passwordMessage");
            res.render('edit-profile.ejs', data);        
        }

        else{
            res.redirect("/my-profile.html");
        }
    });

    app.get("/user/:id/messages", isLoggedIn, function(req, res){

        if (req.user.id == req.params.id){
            var data = getData(req);
            data.tab = "inbox";
            res.render("inbox.ejs", data);
        }else{
            res.redirect("/my-profile");
        }
    });

    app.get("/create-posting.html", isLoggedIn, isUser, function(req, res){
        var data = getData(req);
        data.tab="create-posting";
        res.render("create-posting.ejs", data);
    });


    app.post("/create-posting", isLoggedIn, isUser, validateFields, function(req, res){
        var newPosting = new Posting();
        newPosting.ISBN = req.body.ISBN;
        newPosting.bookTitle = req.body.bookTitle;
        newPosting.postingTitle = req.body.postingTitle;
        newPosting.authors = req.body.authors;
        newPosting.ownerID = req.user.id;
        newPosting.description= req.body.description;
        newPosting.price = req.body.price;
        newPosting.field = req.body.field;
        newPosting.availability = "true";

        if (req.user.accountType == "google"){
            newPosting.ownerName = req.user.google.name;
        }else{
            newPosting.ownerName = req.user.local.username;
        }

        newPosting.save(function(err) {
            if (err)
                throw err;
            else{
                res.redirect('/my-profile.html');
            }
        });

    });



    app.get("/users/:uid/postings/:pid/delete", isLoggedIn, function(req, res){
        Posting.remove({_id:req.params.pid}, function(err, posting){
            if (err)
                res.send(err);
            Rating.remove({postingID:req.params.pid}, function(err, ratings){
                if (err)
                    res.send(err);
                res.redirect("/users/"+req.params.uid+"/postings.html");
            });
        });
    });


    app.get("/postings/:pid/delete", isLoggedIn, function(req, res){
        Posting.remove({_id:req.params.pid}, function(err, posting){
            if (err)
                res.send(err);
            Rating.remove({postingID:req.params.pid}, function(err, ratings){
                if (err)
                    res.send(err);
                res.redirect("/search-postings.html");
            });
        });
    });

 
    app.post('/users/:id/edit', isLoggedIn, upload.single("img"), validateFields, function(req, res) {

        if (req.user.id == req.params.id){
            var user = req.user;

            if (req.file){

                if (user.imgPath != "/avatar/default.png"){
                    fs.unlink(path.join(__dirname, ".." , "static", user.imgPath), function(err) {
                    });
                }

                user.imgPath = "/avatar/" + req.file.filename;
            }
            if (req.body.name && user.accountType =="local"){
                user.local.username = req.body.name;
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
                    res.redirect("/users/" + user.id + "/profile.html");  
                }
            });       
        }else{
            res.redirect("/");
        }
    });


    app.post('/users/:id/change-password', isLoggedIn, validateFields, function(req, res){

        if (req.user.id == req.params.id){
            var user = req.user;
            if (req.body.newPassword && user.accountType =="local"){

                if (user.validPassword(req.body.oldPassword)){

                    user.local.password = user.generateHash(req.body.newPassword);
                    user.save(function(err){
                        if (err){
                            res.send(err);
                        }
                        res.redirect("/users/" + user.id + "/profile.html");  
                    });       
                }else{
                    req.flash("passwordMessage", "Incorrect (old) password!");
                    res.redirect("/users/" + user.id + "/edit_profile.html")
                }
            }
        }else{
            res.redirect("/");
        }
        
    });



    app.get('/users/:id/remove', isLoggedIn, isAdmin, function(req, res){
        Message.remove(
            {$or:[{messengerID: req.params.id}, {receiverID : req.params.id}]}
            , function(err, messages){
            if (err)
                res.send(err);

            Posting.find({ownerID:req.params.id}, function(err, postings){
                if (err)
                        res.send(err);
                var postingList = [];
                for (var i = 0; i<postings.length; i++){
                    postingList.push(postings[i].id);
                }
                Posting.remove({ownerID:req.params.id}, function(err, result){
                    if (err)
                            res.send(err);

                    Rating.remove({postingID: {$in: postingList }}, function(err, user){
                        if (err)
                            res,send(err);
                        User.remove({_id: req.params.id}, function(err, user){
                            if (err)
                                res.send(err);
                            res.redirect("/view-users.html");     
                        });
                    });

                });
                
            });

        });
    });

    app.get('/logout', function(req, res){

        req.logout();
        res.redirect("/login.html");
    });


    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/my-profile.html', 
        failureRedirect : '/login.html', 
        failureFlash : true 
    }));


    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/my-profile.html', 
        failureRedirect : '/signup.html', 
        failureFlash : true 
    }));

    app.post('/volunteer-apply', passport.authenticate('local-apply', {
        successRedirect : '/', 
        failureRedirect : '/about-us.html', 
        failureFlash : true 
    }));
    

    app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

    app.get('/auth/google/callback',
        passport.authenticate('google', {
                successRedirect : '/my-profile.html',
                failureRedirect : '/'
        })
    );




}



function isLoggedIn(req, res, next) {

    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}

function isNotLoggedIn(req, res, next){

    if (!req.isAuthenticated()){
        return next();
    }

    res.redirect("/my-profile.html");
}

function getData(req){
    var data = {authenticated: "false"}
    if (req.isAuthenticated()){
        data = {authenticated: "true", user: req.user};
    }
    return data;
}

function isUser(req, res, next){
    if (req.user.userType == "user"){
        return next();
    }

    res.redirect("/my-profile.html");
}


function isAdmin(req, res, next){
    if (req.user.userType == "admin"){
        return next();
    }

    res.redirect("/my-profile.html");
}

function validateFields(req, res, next){
    var flag = false;

    for (var field in req.body){
        if (req.body[field] != sanitizer.sanitize(req.body[field])){
            flag = true;
        }
    }   
    if (flag == true){
        var data = getData(req);
        data.tab = null;
        res.render("invalid.ejs", data);

    }else{
        next();       
    }
}