const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const seatSchema = new Schema({
  screen_id:{type: Schema.Types.ObjectId, ref: 'Screen'},
  seat_row: { type: String, required: true },
  seat_number: { type: String, required: true },
  is_available:{type:Boolean, default:true}
 
});

const Seat = mongoose.model('Seat', seatSchema);

module.exports = Seat;
