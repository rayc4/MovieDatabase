const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let movieSchema = Schema({
	title: {type: String, required: true},
	year: {type: String, required: true},
	runtime: {type: String, required: true},
	genre: [{type: String, required: true}],
	director: [{type: Schema.Types.ObjectId, ref: 'Person', required: true}],
	actor: [{type: Schema.Types.ObjectId, ref: 'Person', required: true}],
	writer: [{type: Schema.Types.ObjectId, ref: 'Person', required: true}],
	plot: [{type: String, required: true}],
	poster: String,
	reviews: [{type: Schema.Types.ObjectId, ref: 'Review'}],
	scores: [Number],
	avgScore: Number
});

module.exports = mongoose.model("Movie", movieSchema);