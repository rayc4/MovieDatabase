const mongoose = require("mongoose");
const express = require('express');
let router = express.Router();
router.use(express.json());

router.get("/", (req, res, next) => res.render("pages/signinup", {session: req.session}));
router.post("/in", signIn);
router.post("/up", [checkDupe, addUser]);
router.post("/out", signOut);

function signIn(req, res, next){
	mongoose.connection.db.collection("users").findOne({username: req.body.username, password: req.body.password},
		function(err, data){
			if(err || data == null){
				res.status(401).send();
				return;
			}
			req.session.username = req.body.username;
			res.status(200).send();
		}
	);
}


function checkDupe(req, res, next){
	if(req.body.username.length == 0 || req.body.password.length == 0){
		res.status(400).send();
		return;
	}
	mongoose.connection.db.collection("users").findOne({username: req.body.username},
		function(err, data){
			if(err) throw err;
			if(data == null){
				next();
			}else{
				res.status(409).send();
				return;
			}
		}
	);
}

function addUser(req, res, next){
	let user = {username: req.body.username, password: req.body.password, isContr: false, reviews: [], followingPeople: [], watchlist: [], followingUsers: [], followedByUsers: [], recommended: [], notifications: []};
	mongoose.connection.db.collection("users").insertOne(user, function(err, result){
		if(err) throw err;
		console.log("Added user: " + user.username + " to the database");
		res.status(201).send();
	});
}

function signOut(req, res, next){
	delete req.session.username;
	res.status(200).send();
}

module.exports = router;