const mongoose = require('mongoose')

mongoose.connect("mongodb://127.0.0.1:27017/moviebooking")


const cinemaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  total_screens: { type: Number, required: true }
});

const Cinema = mongoose.model('Cinema', cinemaSchema);

module.exports = Cinema;