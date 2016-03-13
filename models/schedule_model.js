var mongoose = require('mongoose');

var Schedule = new mongoose.Schema({
  promotion: Number,
  mon: Array,
  tus: Array,
  wed: Array,
  thu: Array,
  fri: Array
},{collection: "schedule"});

module.exports = mongoose.model('Schedule', Schedule);
