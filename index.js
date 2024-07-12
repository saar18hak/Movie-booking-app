const express = require('express')
const app = express()
const path = require("path")
const session  = require("express-session")
const { log, error } = require('console')
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser")

app.use(bodyParser.json());




app.set("view engine","ejs")
app.use(express.json())

app.use(cookieParser())

app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname, 'public')))
// app.use(session({secret:"My secret here"}))
app.use(session({
    secret: 'My secret here',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: 'mongodb://127.0.0.1:27017/moviebooking' }),
    cookie: { maxAge: 180 * 60 * 1000 } // Example: 3-hour expiration
}));
const userModel = require("./models/user")
const movieModel = require("./models/movie")
const cinemaModel = require("./models/cinema")
const screenModel = require("./models/screen")
const showtimeModel = require("./models/showtime")
const newbookModel = require("./models/newbookmodel")
const seatModel = require('./models/seat')
const user = require('./models/user')

async function authenticate(req,res,next){
    try{
        const p = req.cookies.teraid
        console.log(p);
        req.userkaid = p
        next()
    }catch(error){

        console.log(error);
    }

}

app.post("/seatpost/:screen_id",async(req,res)=>{
    const { screen_id } = req.params;

    try {
      const screen = await screenModel.findById(screen_id);
      if (!screen) {
        return res.status(404).json({ message: 'Screen not found' });
      }
  
      const seatingCapacity = screen.seating_capacity;
      const rows = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      const seatsPerRow = Math.ceil(seatingCapacity / rows.length);
  
      const seats = [];
      let seatCount = 0;
  
      for (let i = 0; i < rows.length && seatCount < seatingCapacity; i++) {
        for (let j = 1; j <= seatsPerRow && seatCount < seatingCapacity; j++) {
          seats.push({
            screen_id: screen._id,
            seat_row: rows[i],
            seat_number: j.toString(),
            is_available: true
          });
          seatCount++;
        }
      }
  
      await seatModel.insertMany(seats);
      res.status(201).json({ message: 'Seats created successfully' });
    } catch (error) {
      console.error('Error creating seats:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
})


app.get('/',(req,res)=>{
    // res.send("hey bhai")
    
    
    res.render("index") //ejs file 
  

})

app.get('/readone',async(req,res)=>{
    const x = req.session.username
    let user = await userModel.findOne({username:x})
    console.log(user);
    res.render("readone",{user})
})

app.get('/read',async(req,res)=>{
    let users = await userModel.find()  // find fetches all users
    res.render('read',{users, z: req.session.username})
})

app.get("/cookiewala",(req,res)=>{
    console.log("cookies:",req.cookies.teraid);
    // res.cookie("name","saaale").send('cookie set')
})

app.get("/clearcookie",(req,res)=>{
    res.clearCookie('name')
    res.send("cleared")
})


//create user 
app.post('/create',async(req,res)=>{
    let {username,email,password,image} = req.body
    let createdUser = await userModel.create({
        username,
        email,
        password,
        image
    })
    req.session.username = username
    req.session.userid = createdUser._id
    console.log(req.session.userid);
    res.redirect("readone")  ///imp hai yaad kro
    // res.send(createdUser)
   
})

app.get("/loginpage",(req,res)=>{
    
    res.render("login")
})


app.post("/login",async(req,res)=>{
    let {username,email}  = req.body
    let user = await userModel.findOne({username:username,email:email})
    if(user){
        req.session.userid = user._id
        console.log("Id is ",req.session.userid);
    }
    res.cookie('teraid',`${req.session.userid}`).send("hogaya")
    console.log("Tera baap ",req.cookies);
    

})



app.get("/getuser",async(req,res)=>{
    console.log("tera :",req.cookies.teraid);
    const c = req.cookies.teraid;
    console.log(c);
    let user = await userModel.findOne({_id:c})
    console.log(user);
    // let shows = await showtimeModel.find({_id:req.params.showtimeid})
    // res.send(shows)
    
})

app.get('/showtimedisplay/:showid',async(req,res)=>{
    let showmovie = await showtimeModel.findOne({_id:req.params.showid}).populate("movie_id")
    let shownew = await showtimeModel.findOne({_id:req.params.showid}).populate("screen_id").populate({
        path: 'screen_id',
        populate: {
            path: 'cinema_id'
        }
    })


    console.log(shownew);

    let seats = await seatModel.find({screen_id:shownew.screen_id})
    console.log(seats);

    res.render('showtimedisplay',{shownew:shownew,showmovie:showmovie,seats:seats})
})

app.post("/postbooking/:showtimeid",authenticate,async(req,res)=>{

    // const c = req.cookies.teraid;
    // console.log(c);
    // res.send(c)

    const x = req.userkaid;   //most important 
    console.log(x);
    const userData = await userModel.findOne({_id:x})
    if(!userData){
        return res.send("Please Login")
    }else{
        console.log(userData);
    }
    let shownew = await showtimeModel.findOne({_id:req.params.showtimeid})
    let tickp = shownew.ticketprice
    console.log(tickp);
    let {number_of_tickets,seats} = req.body
    let total_amount = number_of_tickets*tickp
    console.log(total_amount);
    // Ensure the number of selected seats matches the number of tickets
    if (seats.length !== parseInt(number_of_tickets)) {
        return res.status(400).send('Number of selected seats does not match the number of tickets');
    }
    let booknewseat = await newbookModel.create({
        user_id:x,
        showtime_id:req.params.showtimeid,
        number_of_tickets:number_of_tickets,
        total_amount:total_amount,
        seats:seats
    })
    // console.log(booknewseat);

    await seatModel.updateMany({ _id: { $in: seats } }, { is_available: false });
    console.log(booknewseat);
    
    // res.send(booknewseat)
    let bkseat =await newbookModel.findOne({_id:booknewseat._id}).populate("showtime_id").populate({
        path: 'showtime_id',
        populate: {
            path: 'movie_id'
          
        }
    })

    let bkcinema = await showtimeModel.findOne({_id:bkseat.showtime_id._id}).populate("screen_id").populate({
        path: 'screen_id',
        populate: {
            path: 'cinema_id'
          
        }
    })


    res.render("yourbookticket",{bkseat:bkseat,bkcinema:bkcinema})
})

app.get("/seathog/:bkid",async(req,res)=>{
    let bkseatnew = await newbookModel.findOne({_id:req.params.bkid}).populate('seats')
    console.log(bkseatnew);
})

app.get("/check",(req,res)=>{
    console.log(req.session.userid);
})


app.post('/createmovie',async(req,res)=>{
    let {title,description,genre,rating,duration,release_date,image} = req.body
    let date = new Date(release_date)
    let createdMovie = await movieModel.create({
        title,
        description,
        genre,
        rating,
        duration,
        release_date:date,
        image
    })
    console.log(createdMovie);
    res.redirect("/moviedisplay")
})

app.get("/moviedisplay/:id",async(req,res)=>{
    let movie = await movieModel.findOne({_id:req.params.id})
    let cinemas = await cinemaModel.find()

    console.log(cinemas);
    // console.log(movie);
    let showtimes = await showtimeModel.find({movie_id:req.params.id}).populate("screen_id").populate({
        path: 'screen_id',
        populate: {
            path: 'cinema_id'
        }
    })
    console.log(showtimes);

//     async function movienew(){
//         let results = []
//         for(const showtime of showtimes){

//             // console.log(showtime.movie_id);
//             let showcine = await screenModel.find({_id:showtime.screen_id}).populate('cinema_id')
//             // console.log(showcine);
//             results.push(showcine)

//         }
//         return results
//     }
//    let x = await movienew()
//    console.log(x);

    res.render("moviebook",{movie:movie,cinemaAll:cinemas, showmecinema:showtimes})

    // ,showmecinema:x
    // res.send("Movie page")


})


app.get('/moviedisplay',async(req,res)=>{
    let userId = req.cookies.teraid

    let movies = await movieModel.find()
    console.log(movies);

    res.render("moviedisplay",{movies,userId})
})



app.post('/createcinemas',async(req,res)=>{
    let {name, location, total_screens} = req.body

    let cinemas = await cinemaModel.create({
        name, location, total_screens
    })
    console.log(cinemaAll);
    res.send(cinemas)

})

app.get("/cinemas",async(req,res)=>{
    let cinemas = await cinemaModel.find()
    console.log(cinemas);
})

app.post("/cinemas/:id/screens",async(req,res)=>{
    let cinema_id = req.params.id
    let {screen_number,seating_capacity} = req.body
    let screens = await screenModel.create({
        cinema_id,
        screen_number,
        seating_capacity
    })
    res.send(screens)
})

app.post("/:movieid/:screenid",async(req,res)=>{
    let movieid = req.params.movieid
    let screenid = req.params.screenid
    let {start_time,end_time,ticketprice} = req.body

    let showtimes = await showtimeModel.create({
        movie_id:movieid,
        screen_id:screenid,
        start_time:start_time,
        end_time:end_time,
        ticketprice:ticketprice

    })
    console.log(showtimes);
})




// app.post("/:showtimeid",async(req,res)=>{
//    let {number_of_tickets} = req.body
    
//     let userid = req.cookies.teraid
//     console.log(userid);
//     let showtimeA = await showtimeModel.findOne({_id:req.params.showtimeid})
//     // console.log("sorry");
//     console.log(showtimeA);
//     let ticketprice = showtimeA.ticketprice
//     // let date = new Date(booking_date)
    
//     let bookedSeats = await bookSeatModel.create({
//         user_id:userid,
//         showtime_id:req.params.showtimeid,
        
//         number_of_tickets:number_of_tickets,
//         total_amount:number_of_tickets*ticketprice
        
//     })
//     res.render("showtimedisplay",{showtimeA,userid,bookedSeats})
// })

// app.put("/bookseatnew/:bookid/:seatid",async(req,res)=>{
//     const bookingseat = await bookSeatModel.findOne({_id:req.params.bookid}) 
//     console.log(bookingseat);
//     const seatid = req.params.seatid
//     const isAlreadyBooked = bookingseat.booked_seats.some(
//         (seat)=>seat.seat_id.toString()===seatid
//     )
//     if(isAlreadyBooked){
//         res.send("Already Booked")
//     }

//     bookingseat.booked_seats.push({seat_id:seatid})

//     await bookingseat.save()
//     res.send(bookingseat)
// })

app.post("/seatpost",async(req,res)=>{
    let {seat_number} = req.body
    let seats = await seatModel.create({
        seat_number
    })
    console.log(seats)
})

app.get("/showtime",(req,res)=>{
    res.render("showtimepost")
})

app.listen(3000)