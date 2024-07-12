const mongoose = require('mongoose')

mongoose.connect("mongodb://127.0.0.1:27017/moviebooking")


const screenSchema = new mongoose.Schema({
  cinema_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Cinema', required: true },
  screen_number: { type: Number, required: true },
  seating_capacity: { type: Number, required: true }
});

const Screen = mongoose.model('Screen', screenSchema);

module.exports = Screen;