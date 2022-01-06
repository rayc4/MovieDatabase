const express = require('express');
const app = express();
const mongoose = require("mongoose");
const Review = require("./ReviewModel");
const session = require('express-session');

app.use(session({
	secret:'supersecretkey',
	resave: true,
	saveUninitialized: false
}));
app.set("view engine", "pug");
app.use(express.static(__dirname));

app.use(function(req,res,next){
	console.log(req.method + ' ' + req.url);
	next();
});

app.get("/", function(req, res, next) {
	mongoose.connection.db.collection("movies").aggregate([{ $sample: {size: 10} }]).toArray(
		function(err, movies){
			if(err){
				res.status(500).send("Server Error");
				return;
			}
			res.render("pages/index", {shuffled: movies}); 
		}
	);
});

let usersRouter = require("./users-router");
app.use("/users", usersRouter);

let signRouter = require("./sign-router");
app.use("/sign", signRouter);

let moviesRouter = require("./movies-router");
app.use("/movies", moviesRouter);

let peopleRouter = require("./people-router");
app.use("/people", peopleRouter);

app.get("/search", (req, res, next) => res.render("pages/search", {}));

app.get("/reviews/:id", (req, res, next) => {
	Review.findById(req.params.id).populate("movie user")
	.exec((err, review) =>{
		res.render("pages/review", {review: review});
	});
});

app.get("/contribute", (req, res, next) => {
	let isContr;
	mongoose.connection.db.collection("users").findOne({username: req.session.username},
		function(err, user){
			if(err){
				res.status(500).send("Server Error");
				return;
			}
			let isContr = user ? user.isContr : false
			res.render("pages/contribute", {session: req.session, isContr: isContr});
		}
	);
});

app.get("/myacc", (req, res, next) =>{
	if(req.session.username == undefined){
		res.render("pages/message", {message: "You are not logged in. Please click on 'Sign In/Up'."});
	}else{
		res.redirect("/users/" + req.session.username);
	}
});

mongoose.connect('mongodb://localhost/moviedata', {useNewUrlParser: true, useUnifiedTopology: true});
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
 	app.listen(3000);
	console.log("Listening on port 3000");
});
