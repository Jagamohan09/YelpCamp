if (process.env.NODE_ENV !== "production") {
    require('dotenv').config()
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate')
const session = require('express-session')
const { campgroundSchema, reviewSchema } = require('./schemas.js')
//requiring & destructuring at the same time
const ExpressError = require('./utils/ExpressErrors');
const flash = require('connect-flash')
const Joi = require('joi');
const MongoStore = require('connect-mongo');

const passport = require('passport');
const LocalStrategy = require('passport-local')
const helmet = require('helmet');

const User = require('./models/user');
const usersRoutes = require('./routes/users')
const campgroundRoutes = require('./routes/campgrounds')
const reviewsRoutes = require('./routes/reviews')

const mongoSanitize = require('express-mongo-sanitize');

const dbUrl = process.env.DB_URL;

mongoose.set('strictQuery', true);
//mongodb://127.0.0.1:27017/yelpcamp

mongoose.connect(dbUrl)
    .then(() => {
        console.log("Connection Done");
    })
    .catch(err => {
        console.log(err);
    })

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))


app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize());

const store = MongoStore.create({
    mongoUrl:dbUrl,
    touchAfter:24*360,
    crypto: {
        secret: 'thisshouldbeabettersecret!'
      }
})

store.on('Error',function(e){
    console.log("SESSION STORES ERROR ",e)
})

const sessionConfig = {
    store,
    name:'sessions',
    //name attribute sets the name of the session
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        cookies: {
            httpOnly: true,
            expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
            maxAge: 1000 * 60 * 60 * 24 * 7
        }
    }
}

app.use(session(sessionConfig))
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/diqjruhl5/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize())
app.use(passport.session())
//we need to execute the session middleware if the user wants persistent login session
//Applications must initialize session support in order to make use of login sessions
//Session must be used before passport.session
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
//Detemine how we serialising a user ie how we store data in a session
passport.deserializeUser(User.deserializeUser());
//Determine how to deserialise(remove) a user from a session


app.use((req, res, next) => {
    //console.log(req.session)
    //To print the content inside the session ie the req.originalUrl which is saved in session 
    res.locals.currentUser = req.user
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})




const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    //Destructing out of the object we get if an error occur
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        //Using map method on the details & join is used if multiple message are there 
        throw new ExpressError(msg, 400)
    }
    else {
        next()
    }
}



//Using router
app.use("/campgrounds", campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewsRoutes)
app.use('/', usersRoutes)



app.get('/', (req, res) => {
    res.render('home');
})


app.all('*', (req, res, next) => {
    next(new ExpressError('Page not Found', 404))
})


app.use((err, req, res, next) => {
    const { statusCode = 500, } = err;
    if (!err.message) err.message = "Oh no something went wrong"
    res.status(statusCode).render('error', { err });
    //rendering the error.ejs by creating object literal of err object 
})

app.listen(3000, () => {
    console.log('serving on port 3000')
})