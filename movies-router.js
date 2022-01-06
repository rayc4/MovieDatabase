const mongoose = require('mongoose');
const Movie = require('./MovieModel');
const Person = require('./PersonModel');
const User = require('./UserModel');
const Review = require('./ReviewModel');
const express = require('express');
let router = express.Router();

router.use(express.json());

router.get("/", [handleQuery, sendMovies]);
router.get("/:id", sendMovie);
router.post("/:id/addToWatchlist", addToWatchlist);
router.post("/:id/removeFromWatchlist", removeFromWatchlist);
router.post("/:id/reviews", [addReview, sendUserNotif]);
router.post("/", [checkDupe, addMovie, updatePeople, sendPeopleNotifs]);

function handleQuery(req, res, next){
	if(!req.query.genre)
		req.query.genre = "";
	if(!req.query.title)
		req.query.title = "";
	Movie.find( 
		{$and: 
			[ 
				{title: {$regex: req.query.title, $options: 'i'}},
				{genre: {$regex: req.query.genre, $options: 'i'}}
			] 
		}
	).exec(function(err, movies){
		if(err){
			res.status(500).send();
			return;
		}
		if(!req.query.actor){
			res.movies = movies;
			next();
		}
		Person.findOne({name: {$regex: req.query.actor, $options: 'i'}}).exec( (err, person) => {
			if(err){
				res.status(500).send();
				return;
			}
			if(!person || !person.actor || person.actor.length == 0){
				res.render("pages/message", {message: "Could not find an actor with that name"});
				return;
			}
			res.actor = person.name;
			movies = movies.filter(movie => person.actor.includes(movie._id));
			res.movies = movies;
			next();
		});
		
	});
}

function sendMovies(req, res, next){
	res.format({
		"application/json": () => {
			res.status(200).json(res.movies);
		},
		"text/html":  () => {
			if(res.movies.length == 0){
				res.render("pages/message", {message: "No movies found"});
				return;
			}
			let url = req.originalUrl.slice(0, - req.query.page.toString().length);
			res.render("pages/results", 
				{
					movies: res.movies.slice((req.query.page-1)*10, req.query.page*10),
					currPage: req.query.page,
					numPages: Math.ceil(res.movies.length / 10),
					nextUrl: url + (parseInt(req.query.page)+1).toString(),
					prevUrl: url + (parseInt(req.query.page)-1).toString(),
					actor: res.actor,
					title: req.query.title,
					genre: req.query.genre
				}
			)
		}
	});

}

function sendMovie(req, res, next){
	Movie.findByIdAndUpdate(req.params.id, [ { $addFields: { avgScore: { $avg: "$scores"} } } ], {new: true, useFindAndModify: false})
	.populate("actor writer director")
	.populate( { path: "reviews", populate: { path: "user"} } )
	.exec(function(err, movie){
		if(err){
			res.status(500).send("Error loading movie");
			return;
		}
		if(!movie){
			res.status(404).send("Movie ID " + req.params.id + " does not exist.");
			return;
		}
		res.format({
			"application/json": () => {
				res.status(200).json(movie);
			},
			"text/html":  () => {
				Movie.find({genre: movie.genre, _id: {$ne: movie._id}}).limit(5).exec((err, similars) => {
					if(err){
						res.status(500).send();
						throw err;
					}
					if(!req.session.username){
						res.render("pages/movie", {movie: movie, inWatchlist: false, similars: similars});
					}else{
						User.findOne({username: req.session.username}, (err, user) => {
							if(err){
								res.status(500).send();
								throw err;
							}
							let inWatchlist = user.watchlist.includes(req.params.id);
							res.render("pages/movie", {movie: movie, inWatchlist: inWatchlist, similars: similars});
						});
					}
				});
			}
		});
	});
};

function addToWatchlist(req, res, next){
	if(!req.session.username){
		res.status(401).send();
		return;
	}
	User.findOneAndUpdate({username: req.session.username}, { $push: { watchlist: req.params.id}}, {useFindAndModify: false},
		function(err, user){
			if(err){
				res.status(500).send();
				return;
			}
			res.status(200).send();
		}
	);
}

function removeFromWatchlist(req, res, next){
	if(!req.session.username){
		res.status(401).send();
		return;
	}
	User.findOneAndUpdate({username: req.session.username}, { $pull: { watchlist: req.params.id}}, {useFindAndModify: false},
		function(err, user){
			if(err){
				res.status(500).send();
				return;
			}
			res.status(200).send();
		}
	);
}

function addReview(req, res, next){
	if(!req.session.username){
		res.status(401).send();
		return;
	}
	User.findOne({username: req.session.username}, (err, user) => {
		if(err){
			res.status(500).send();
			return;
		}
		req.body.user = user._id;
		Review.create(req.body, (err, review) => {
			if(err){
				res.status(400).json(err.message);
				return;
			}
			user.reviews.push(review._id);
			user.save((err, user) => {
				if(err){
					res.status(500).send();
					return;
				}
				Movie.findByIdAndUpdate(req.body.movie, { $push: { reviews: review._id, scores: review.score } }, {useFindAndModify: false},
					(err, movie) =>{
						if(err){
							res.status(500).send();
							return;
						}
						res.movie = movie;
						res.user = user;
						next();
					}
				);
			});
		});
	});
}

function sendUserNotif(req, res, next){
	User.find({followingUsers: res.user._id}).exec((err, followers) => {
		if(err){
			res.status(500).send();
			return;
		}
		followers.forEach(async follower =>{
			follower.notifications.push("user: <i>"+res.user.username+"</i> has added a review for <i>"+res.movie.title+"</i>");
			await follower.save();
		});
		res.status(201).send();
	});
	
}

function checkDupe(req, res, next){
	console.log(req.body);
	Movie.findOne( { "title": { $regex: "^"+req.body.title+"$", $options: 'i' } } , (err, movie) =>{
		if(err){
			res.status(500).send("Server error");
			return;
		}
		if(movie){
			res.status(409).send("Error: A movie with that name already exists (case-insensitive)");
			return;
		}
		next();
	});
}

function addMovie(req, res, next){
	Movie.create(req.body, (err, movie) =>{
		if(err){
			res.status(500).send(err.message);
			return;
		}
		res.id = movie._id;
		res.movieTitle = movie.title;
		next();
	});
}

async function updatePeople(req, res, next){
	for (const personId of req.body.director){
		await Person.findByIdAndUpdate(personId, { $push: { director: res.id } } , {useFindAndModify: false});
	}

	for (const personId of req.body.writer){
		await Person.findByIdAndUpdate(personId, { $push: { writer: res.id } } , {useFindAndModify: false});
	}

	for (const personId of req.body.actor){
		await Person.findByIdAndUpdate(personId, { $push: { actor: res.id } } , {useFindAndModify: false});
	}

	next();
}

function sendPeopleNotifs(req, res, next){
	let peopleIds = req.body.director.concat(req.body.writer, req.body.actor);
	User.find( { followingPeople: { $in: peopleIds } } ).exec( (err, users)=>{
		if(err){
			res.status(500).send();
			return;
		}
		users.forEach(user => {
			let matchingPeople = user.followingPeople
			.filter(person => peopleIds.includes(person.toString()))
			matchingPeople.forEach( async person => {
				let found = await Person.findById(person);
				user.notifications.push("<i>"+res.movieTitle+"</i> has been added to the database, it includes "+found.name);
				await user.save();
			});
		});
		res.status(201).send("Movie created successfully");
	});
	
}

module.exports = router;
