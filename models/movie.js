const mongoose = require('mongoose')

mongoose.connect("mongodb://127.0.0.1:27017/moviebooking")


const movieSchema = mongoose.Schema({
    title:String,
    description:String,
    genre:String,
    rating:String,
    duration:String,
    release_date:Date,
    image:String
})

module.exports = mongoose.model("Movie", movieSchema)
