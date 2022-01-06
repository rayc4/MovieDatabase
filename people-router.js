const mongoose = require('mongoose');
const Person = require('./PersonModel');
const User = require('./UserModel');
const express = require('express');
let router = express.Router();
router.use(express.json());

router.get("/", sendPeople);
router.get("/:id", sendPerson);
router.post("/:id/follow", followPerson);
router.post("/:id/unfollow", unfollowPerson);
router.post("/", [checkDupe, addPerson]);

function sendPeople(req, res, next){
	Person.find(
		{ "name": { "$regex": req.query.nameIncludes, "$options": "i"} },
		(err, people) => {
			names = people.map(p => p.name)
			res.status(200).json(names);
		}
	)
}

function sendPerson(req, res, next){ 
	Person.findById(req.params.id).populate("director actor writer").exec((err, person) => {
		if(err){
			res.status(500).send();
			return;
		}
		if(!person){
			res.status(404).send();
			return;
		}
		person.findFreqCols((err, freqCols) => { 
			if(err){
				res.status(500).send();
				return;
			}
			res.format({
				"application/json": () => {
					res.status(200).json(person);
				},
				"text/html":  () => {
					if (!req.session.username){
						res.render("pages/person", {person: person, isFollowed: false, freqCols: freqCols});
					}else{
						User.findOne({username: req.session.username}, (err, user) => {
							if(err){
								res.status(500).send();
								return;
							}
							let isFollowed = user.followingPeople.includes(req.params.id);
							res.render("pages/person", {person: person, isFollowed: isFollowed, freqCols: freqCols});
						});
					}
				}
			});	
		});
	});
}

function followPerson(req, res, next){
	if(!req.session.username){
		res.status(401).send();
		return;
	}
	User.findOneAndUpdate( {username: req.session.username}, { $push: { followingPeople: req.params.id}}, {useFindAndModify: false},
		function(err, user){
			if(err){
				res.status(500).send();
				return;
			}
			res.status(200).send();
		}
	);	
}

function unfollowPerson(req, res, next){
	if(!req.session.username){
		res.status(401).send();
		return;
	}
	User.findOneAndUpdate( {username: req.session.username}, { $pull: { followingPeople: req.params.id}}, {useFindAndModify: false},
		function(err, user){
			if(err){
				res.status(500).send();
				return;
			}
			res.status(200).send();
		}
	);
}

function checkDupe(req, res, next){
	Person.findOne( { "name": { $regex: "^"+req.body.name+"$", $options: 'i' } } , (err, person) =>{
		if(err){
			res.status(500).send("Server error");
			return;
		}
		if(person){
			res.status(409).send("Error: A person with that name already exists (case-insensitive)");
			return;
		}
		next();
	});
}

function addPerson(req, res, next){
	Person.create(req.body, (err, person) =>{
		if(err){
			res.status(500).send(err.message);
			return;
		}
		res.status(201).send("Person created successfully");
	});
}

module.exports = router;
