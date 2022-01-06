const fileName = "./movie-data-2500.json";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let Movie = require("./MovieModel");
let Person = require("./PersonModel");

let allMovies = []; 
let people = {};
let allPeople = [];

function addPersonToMovie(personName, movie, position){
  if(!people.hasOwnProperty(personName)){
    let newPerson = new Person();
    
    newPerson._id = mongoose.Types.ObjectId();
    
    newPerson.name = personName;
    newPerson.director = [];
    newPerson.actor = [];
    newPerson.writer = [];
    allPeople.push(newPerson);
    people[newPerson.name] = newPerson;
  }
  
  let curPerson = people[personName];
  curPerson[position].push(movie._id);
  movie[position].push(curPerson._id);
}

let data = require(fileName);
data.forEach(movie=>{
  /*
  movie is something like:
    {
      "Title":"The Ballad of Cable Hogue",
      "Year":"1970",
      "Rated":"R",
      "Released":"18 Mar 1970",
      "Runtime":"121 min",
      "Genre":["Comedy","Drama","Romance","Western"],
      "Director":["Sam Peckinpah"],
      "Writer":["John Crawford","Edmund Penney"],
      "Actors":["Jason Robards","Stella Stevens","David Warner","Strother Martin"],
      "Plot":"A hobo accidentally stumbles onto a water spring, and creates a profitable way station in the middle of the desert.",
      "Awards":"1 win & 1 nomination.",
      "Poster":"https://m.media-amazon.com/images/M/MV5BMTQwMjkwNjE0Ml5BMl5BanBnXkFtZTgwOTU5ODIyMTE@._V1_SX300.jpg"
    }
  */
  
  let newMovie = new Movie();
  newMovie._id = mongoose.Types.ObjectId();
  newMovie.title = movie.Title;
  newMovie.year = movie.Year;
  newMovie.runtime = movie.Runtime;
  newMovie.genre = movie.Genre;
  newMovie.plot = movie.Plot;
  newMovie.poster = movie.Poster;

  movie.Actors.forEach(actorName => {
    addPersonToMovie(actorName, newMovie, "actor");
  })
  
  movie.Director.forEach(directorName => {
    addPersonToMovie(directorName, newMovie, "director");
  })
  
  movie.Writer.forEach(directorName => {
    addPersonToMovie(directorName, newMovie, "writer");
  })
  
  allMovies.push(newMovie)
})


mongoose.connect('mongodb://localhost/moviedata', {useNewUrlParser: true, useUnifiedTopology: true});
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	mongoose.connection.db.dropDatabase(function(err, result){
		if(!result){
			console.log("Database drop failed. It probably does not exist yet.")
		}
		console.log("Dropped database")
		Movie.insertMany(allMovies, function(err, result){
			if(err){
				console.log(err);
				return;
			}
			console.log("Inserted "+ result.length + " movies");
			Person.insertMany(allPeople, function(err, result){
				if(err){
					console.log(err);
					return;
				}
				console.log("Inserted "+ result.length + " people");
        		mongoose.connection.close();
        		console.log("Finished")
				process.exit();
			});
		});
	});
});
