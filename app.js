const { json } = require('express');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const markdown = require('marked');
const app = express();
const router = require('./router');
const bodyParser = require('body-parser')

let sessionOptions = session({
    secret: "sis project secret",
    store: MongoStore.create({client: require('./db')}),
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 1000 * 60 * 60 * 24, httpOnly: true}
})
app.use(sessionOptions);
app.use(flash())
 
app.use(function(req, res, next) {  
    // make all error and success flash messages available from all templates
    res.locals.errors = req.flash("errors")
    res.locals.success = req.flash("success")
    // make current user id available on the req object
  if (req.session.user) {req.visitorId = req.session.user._id} else {req.visitorId = 0}
  
    // make user session data available from within view templates
    res.locals.user = req.session.user
    next()
})

app.use(express.urlencoded({extended:false}));//used for submiting 'HTML form' data(so that we can get the data using req.body)
app.use(json());//used for submiting json formated data

app.use(express.static('public'));

//configuring templete engine
app.set('views','Views')
app.set('view engine', 'ejs')

app.use('/', router);



module.exports = app