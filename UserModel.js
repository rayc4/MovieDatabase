const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let userSchema = Schema({
  username: {type: String, required: true},
  password: {type: String, required: true},
  isContr: {type: Boolean, required: true},
  reviews: String,
  followingPeople: [{type:Schema.Types.ObjectId, ref: 'Person'}],
  followingUsers: [{type:Schema.Types.ObjectId, ref: 'User'}],
  watchlist: [{type:Schema.Types.ObjectId, ref: 'Movie'}],
  recommended: [{type:Schema.Types.ObjectId, ref: 'Movie'}],
  notifications: [String],
  reviews: [{type:Schema.Types.ObjectId, ref: 'Review'}]
});

module.exports = mongoose.model("User", userSchema);