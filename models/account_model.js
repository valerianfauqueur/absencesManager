var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var Account = new mongoose.Schema({
  username: String,
  admin: Boolean,
  promotion: Number,
  group: String,
  state: Array
},{collection: "accounts"});

Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Account', Account);
