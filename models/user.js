const mongoose = require('mongoose')

mongoose.connect("mongodb://127.0.0.1:27017/moviebooking")

const userSchema = mongoose.Schema({
    username:String,
    email:String,
    password:String,
    image:String
})

module.exports = mongoose.model("User", userSchema)