
const mongoose = require('mongoose')

mongoose.connect("mongodb://127.0.0.1:27017/moviebooking")



const showtimeSchema = new mongoose.Schema({
    movie_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    screen_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Screen', required: true },
    
    start_time: { type: Date, required: true },
    end_time: { type: Date, required: true },
    ticketprice:Number
  });
  

  const Showtime = mongoose.model('Showtime', showtimeSchema);

  module.exports = Showtime