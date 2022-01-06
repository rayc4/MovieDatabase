const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let personSchema = Schema({
  name: {type: String, required: true},
  director: [{type:Schema.Types.ObjectId, ref: 'Movie'}],
  actor: [{type:Schema.Types.ObjectId, ref: 'Movie'}],
  writer: [{type:Schema.Types.ObjectId, ref: 'Movie'}],
});

personSchema.methods.findFreqCols = function(callback){
	let thisMovies = [];
	this.actor.forEach(movie => {
		thisMovies.push(movie._id.toString());
	});
	this.director.forEach(movie => {
		if(!thisMovies.includes(movie._id.toString())){
			thisMovies.push(movie._id.toString());
		}
	});
	this.writer.forEach(movie => {
		if(!thisMovies.includes(movie._id.toString())){
			thisMovies.push(movie._id.toString());
		}
	});

	let top10 = [];
	this.model("Person").find()
	.exec((err, people) => {
		people.forEach(person =>{
			if(person._id.toString().localeCompare(this._id) != 0)
				top10.push({"person": person._id, "matches": numMatches(thisMovies, person) } );
		});
		top10.sort((a, b) => b.matches - a.matches);
		top10 = top10.slice(0, 5);

		let top10Ids = [];
		top10.forEach(t => {
			top10Ids.push(t.person);
		});

		this.model("Person").find( { _id: { $in: top10Ids } }).exec(callback);
	})
}

function numMatches(thisMovies, person){
	let comb = person.actor.concat(person.director, person.writer);
	let noDupes = comb.filter((item, pos) => comb.indexOf(item) === pos);
	let matches = 0;
	noDupes.forEach(pmovie =>{
		thisMovies.forEach(tmovie => {
			if(pmovie.toString().localeCompare(tmovie) == 0){
				matches++;
			}
		});
	});	
	return matches;	
}
module.exports = mongoose.model("Person", personSchema);