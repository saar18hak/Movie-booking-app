const mongoose = require('mongoose')

mongoose.connect("mongodb://127.0.0.1:27017/moviebooking")


const Schema = mongoose.Schema
const bookingSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    showtime_id: { type: Schema.Types.ObjectId, ref: 'Showtime', required: true },
    // booking_date: { type: Date, default: Date.now },
    number_of_tickets: { type: Number, required: true,default:1 },
    total_amount: { type: Number, required: true },
   
    booked_seats: [
      {
        seat_id: { type: Schema.Types.ObjectId, ref: 'Seat'},
      }
    ]
  });


  const Booking = mongoose.model('Booking', bookingSchema);

  module.exports = Booking