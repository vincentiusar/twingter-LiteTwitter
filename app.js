if (process.nextTick.NODE_ENV !== 'production') {
    require('dotenv').config();
} 

const cloudinary = require('cloudinary').v2
cloudinary.config({
    cloud_name: 'twingter',
    api_key: '568615274274788',
    api_secret: 'm2kehmLEst2I9lS_3-iC45aNlqM',
})


const express = require('express');
const upload = require('express-fileupload')
const app = express();
// const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodeOverride = require('method-override');

require('./utils/db');
const User = require('./model/user');
const feed = require('./model/feed');

let users = [], feeds = [];

app.use(methodeOverride('_method'));

const initializePassport = require('./passport-config');
initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
);

const port = process.env.PORT || 3000;

app.set('view-engine', 'ejs');

app.use(upload());
app.use(express.urlencoded( { extended: false } ))
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('asset'));
app.use(methodeOverride("_method"));

app.get('/', function(req, res) {
    res.render('index.ejs');
})

app.get('/profile', checkLogin, async function(req, res) {
    users = await User.User.find();
    res.render('profile.ejs', { user: req.user, users: users, });
})

app.get('/profile/:userid', async function(req, res) {
    const tmp = await User.User.findOne( {"id": req.params.userid });
    const feeds = await feed.feed.find();
    res.render('profile-view.ejs', { feeds: feeds, user_login: req.user, user: tmp, users });
})

app.put('/update', checkLogin, async function(req, res) {
    let file = undefined, filename, uploadedRespone;
    if (req.files) {
        file = req.files.myfile;
        filename = Date.now().toString() + file.name;

        file.mv('./asset/' + filename, function(err) {
            if (err) {
                res.send("<h1>Error Saving File</h1>");
            }
        });

        uploadedRespone = await cloudinary.uploader.upload('./asset/' + filename, {use_filename: true, unique_filename: false, invalidate: true}, function(error, result) {  }).catch((rej) => {  });
    }
    const tmp = await User.User.findOne({ "id": req.body.id });
    User.User.updateOne(
        { "id": req.body.id }, 
        { 
            nama: req.body.nama,
            email: req.body.email,
            address: req.body.address,
            gender: req.body.gender,
            prfpict: file === undefined ? 
            tmp.prfpict : uploadedRespone.url,
        },
        {multi:true},
            function(err, numberAffected) {
        }
    ).then(async (result) => {
        if (req.body.password !== '') {
            User.User.updateOne(
                { "id": req.body.id }, 
                { 
                    password: req.body.password,
                },
                {multi:true},
                    function(err, numberAffected) {
                }
            ).then(async (result) => {
                users = await User.User.find();
                res.redirect('/profile');
            })
        } else {
            users = await User.User.find();
            res.redirect('/profile');
        }
    })
})

app.get('/home', checkLogin, async function(req, res) {
    users = await User.User.find();
    feeds = await feed.feed.find();
    res.render('home.ejs', { users: users, user: req.user, feeds: feeds, });
})

app.get('/search', function(req, res) {
    res.render('search.ejs', { user: req.user, users: users, nama: req.query.nama });
})

app.get('/post', checkLogin, async function(req, res) {
    users = await User.User.find();
    res.render('post.ejs', { users: users, user: req.user });
})

app.post('/post', checkLogin, async function(req, res) {
    users = await User.User.find();
    const feedID = Date.now().toString();
    User.User.updateOne(
        { "id": req.user.id }, 
        { $push:
            {
                feeds: feedID,
            }
        }
    ).then(async (result) => {
        let file = undefined, filename, uploadedRespone;
        if (req.files) {
            file = req.files.myfile;
            filename = Date.now().toString() + file.name;

            file.mv('./asset/feeds/' + filename, function(err) {
                if (err) {
                    res.send("<h1>Error Saving File</h1>");
                }
            });

            uploadedRespone = await cloudinary.uploader.upload('./asset/feeds/' + filename, {use_filename: true, unique_filename: false, invalidate: true}, function(error, result) {  }).catch((rej) => {  });
        }

        feed.feed.insertMany(
            {
                id: feedID,
                nama: req.user.nama,
                email: req.user.email,
                pict: file === undefined ? 
                "" : uploadedRespone.url,
                describe: req.body.desc,
            }
        )
            res.redirect('/home');
        }
    );
})

app.get('/login', async function(req, res) {
    users = await User.User.find();
    res.render('login.ejs');
})

app.get('/signup', function(req, res) {
    res.render('signup.ejs');
})

app.post('/login', passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/login',
    failureFlash: true
}))

app.post('/signup', async function(req, res) {
    try {
        // const hashedPass = await bcrypt.hash(req.body.password, 10);
        User.User.insertMany({
            id: Date.now().toString(),
            nama: req.body.nama,
            email: req.body.email,
            password: req.body.password,
        });
        res.redirect('/login');
    } catch {
        res.redirect('/signup');
    }
})

app.delete('/logout', function(req, res) {
    req.logOut();
    res.redirect('/login')
})

function checkLogin(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    res.redirect('./login');
}

app.use(function(req, res) {
    res.status(404);
    res.render('error.ejs');
})

app.listen(port, () => {
    console.log(`App listen to port ${port}`);
})