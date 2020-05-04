const express = require('express');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const passport = require('passport');


// bring all routes

const auth = require('./routes/api/auth');
const questions = require('./routes/api/questions');
const profile = require('./routes/api/profile');

const app = express();
// middle ware for body parser
app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());


//mongoDb configuration
const db = require('./setup/myurls').mongoURL

//attempt to connect to database

mongoose
    .connect(db, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log('mongoDB connected successfully'))
    .catch(err => console.log(err));
//Passport middleware
app.use(passport.initialize());
//Config for jwt starategy

require('./strategies/jsonwtstrategy')(passport)


//route Test
app.get('/', (req, res) => {
    res.send('Hey there big stack');
});

// actual route
app.use('/api/auth', auth);
app.use('/api/question', questions);
app.use('/api/profile', profile);

const port = process.env.PORT || 3000;

app.listen(port, () => console.log('App is running at :'+port));
