const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let reviewSchema = Schema({
	isFull: {type: Boolean, required: true},
	movie: {type:Schema.Types.ObjectId, ref: 'Movie', required: true},
	user: {type:Schema.Types.ObjectId, ref: 'User', required: true},
	summary: {
		type: String,
		validate: {
			validator: function(){
				if(this.isFull && !this.summary)
					return false;
				return true;
			}
		}
	},
	body: {
		type: String,
		validate: {
			validator: function(){
				if(this.isFull && !this.body)
					return false;
				return true;
			}
		}
	},
	score: {
		type: Number, 
		required: true, 
  		min: 1,
  		max: 10,
	}
});

module.exports = mongoose.model("Review", reviewSchema);