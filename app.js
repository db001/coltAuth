const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const bodyParser = require('body-parser');
const LocalStrategy = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');
const User = require('./models/user');

require('dotenv').config();

mongoose.connect(process.env.DB_URL);

const app = express();

app.use(require('express-session')({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//===================
// ROUTES

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/secret', isLoggedIn, (req, res) => {
    res.render('secret');
});

// Auth routes
app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', (req, res) => {
    User.register(new User({
        username: req.body.username
    }),
        req.body.password,
        (err, user) => {
            if (err) {
                console.log(err);
                res.render('register');
            }
            passport.authenticate('local')(req, res, () => {
                res.redirect('secret');
            })
        }
    )
});

// LOGIN ROUTES
app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login',
    passport.authenticate('local', {
        successRedirect: '/secret',
        failureRedirect: '/login'
    }),
    (req, res) => {

    }
);

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

app.listen(process.env.PORT, process.env.IP, () => {
    console.log('Server started');
});