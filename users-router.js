const mongoose = require('mongoose');
const Person = require('./PersonModel');
const User = require('./UserModel');
const Movie = require('./MovieModel');
const express = require('express');
let router = express.Router();

router.use(express.json());

router.get("/:username", [populateUser, findRec, sendUser]);
router.post("/:username/isContr", toggle);
router.post("/:username/follow", [findUser, followUser]);
router.post("/:username/unfollow", [findUser, unfollowUser]);

function populateUser(req, res, next){
	User.findOne({username: req.params.username}).populate("followingPeople followingUsers watchlist")
	.populate( { path: "reviews", populate: { path: "movie" } } )
	.exec((err, user)=>{
		if(err){
			res.status(500).send();
			return;
		}
		if(!user){
			res.status(404).send("User does not exist");
		}
		res.user = user;
		next();
	});
}

function findRec(req, res, next){
	res.user.recommended = [];
	if(res.user.watchlist.length == 0){
		next();
		return;
	}
	let movie = res.user.watchlist[0];
	Movie.find({genre: movie.genre, _id: {$ne: movie._id}}).limit(5).exec((err, similars) => {
		if(err){
			res.status(500).send();
			return;
		}
		similars.forEach(movie => res.user.recommended.push(movie));
		next();
	});
}

function sendUser(req, res, next){
	res.format({
		"application/json": function(){
			let userDeepCopy = JSON.parse(JSON.stringify(res.user));
			delete userDeepCopy.password;
			res.status(200).json(userDeepCopy);
		},
		"text/html": function(){
			if (!req.session.username){
				res.render("pages/user", {user: res.user, isSelf: false, isFollowed: false});
			}
			else{
				// req.session.username is username of the viewer
				// user.username is username of the user being viewed
				let isSelf = req.session.username.localeCompare(res.user.username) == 0;
				if(isSelf){
					res.render("pages/user", {user: res.user, isSelf: true, isFollowed: false});
				}
				else{
					User.findOne({username: req.session.username}).exec((err, viewer) => {
						if(err){
							res.status(500).send();
							return;
						}
						let isFollowed = viewer.followingUsers.includes(res.user._id);
						res.render("pages/user", {user: res.user, isSelf: false, isFollowed: isFollowed});
					});
				}
			}
		}
	});
}

function toggle(req, res, next){
	User.findOne({username: req.params.username},
		function(err, user){
			if(err || user == null){
				res.status(500).send();
				return;
			}
			User.updateOne({username: req.params.username}, { $set: {isContr: !user.isContr}},
				function(err, result){
					if(err || result == null){
						res.status(500).send();
						return;
					}
					res.status(200).send();
				}
			);
		}
	);
}

function findUser(req, res, next){
	if(!req.session.username){
		res.status(401).send();
		return;
	}
	User.findOne({username: req.params.username}, function(err, user){
		if(err){
			res.status(500).send();
			throw err;
		}
		if(!user){
			res.status(404).send();
			return;
		}
		res.user = user;
		next();
	});
}

function followUser(req, res, next){
	User.findOneAndUpdate( {username: req.session.username}, { $push: { followingUsers: res.user._id}}, {useFindAndModify: false},
		function(err, result){
			if(err){
				res.status(500).send();
				throw err;
			}
			res.status(200).send();
		}
	);
}

function unfollowUser(req, res, next){
	User.findOneAndUpdate( {username: req.session.username}, { $pull: { followingUsers: res.user._id}}, {useFindAndModify: false},
		function(err, result){
			if(err){
				res.status(500).send();
				throw err;
			}
			res.status(200).send();
		}
	);
}

module.exports = router;