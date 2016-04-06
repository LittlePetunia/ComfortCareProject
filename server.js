var express=require("express");
var morgan=require("morgan");
var mongoose=require("mongoose");
var bodyParser=require("body-parser");
var path=require("path");
var session=require("express-session");
var cookieParser=require("cookie-parser");
var MongoStore = require('connect-mongo')(session);
var passport=require("passport"); 
var flash=require('connect-flash'); 




var createServer = function(port, db, online){

	mongoose.connect(db);

	require('./config/passport')(passport);

	var app=express();

	app.use(morgan("dev"));
	app.use(cookieParser());
	app.use(bodyParser.urlencoded({ extended: false }))
	app.use(bodyParser.json())
	
	if (online == true){
		app.use(session({secret:"mysecret", 
						store: new MongoStore({url:db,
						ttl: 14 * 24 * 60 * 60 }),
				resave: false, saveUninitialized: true}));
	}else{
		app.use(session({secret:"mysecret", resave: false, saveUninitialized: true}));
	}
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(flash());

	app.use("/api", require("./routes/REST-API/apply.js"));
	app.use("/api", require("./routes/REST-API/user.js"));
	app.use("/api", require("./routes/REST-API/posting.js"));
	app.use("/api", require("./routes/REST-API/rating.js"));
	app.use("/api", require("./routes/REST-API/message.js"));
	require("./routes/route.js")(app, passport);

    app.set('port', (process.env.PORT || port));

	app.use(express.static(path.join(__dirname,"static"), { maxAge: 86400000 }));

	app.set('view engine', 'ejs'); 

	return app.listen(app.get('port'), function(){
		console.log("Server running")
	});	
}


module.exports=createServer;


