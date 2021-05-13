var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const passport = require('passport');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');
require('dotenv').config();

const userController = require('./controllers/userController');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var aboutRouter = require('./routes/about');
var postRouter = require('./routes/posts');

passport.use(
	new LocalStrategy(
		{
			usernameField: 'email',
			passwordField: 'password',
		},
		(email, password, done) => {
			User.findOne({ email: email }, (err, user) => {
				if (err) {
					return done(err);
				}
				if (!user) {
					return done(null, false, { message: 'Incorrect username' });
				}
				if (user.password !== password) {
					return done(null, false, { message: 'Incorrect password' });
				}
				return done(null, user);
			});
		}
	)
);

passport.serializeUser(function (user, done) {
	done(null, user.id);
});

passport.deserializeUser(function (id, done) {
	User.findById(id, function (err, user) {
		done(err, user);
	});
});

const { appendFileSync } = require('fs');
var app = express();
//connect to mongoosedb
var mongoose = require('mongoose');
var mongoDB = process.env.DB_URI;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({ secret: 'cats', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

//app.get('/login', userController.userLoginGet);
//app.post(
//	'/login',
//	function (req, res, next) {
//		// call passport authentication passing the "local" strategy name and a callback function
//		passport.authenticate('local', function (error, user, info) {
//			// this will execute in any case, even if a passport strategy will find an error
//			// log everything to console
//			console.log(error);
//			console.log(user);
//			console.log(info);
//
//			if (error) {
//				res.status(401).send(error);
//			} else if (!user) {
//				res.status(401).send(info);
//			} else {
//				next();
//			}
//
//			res.status(401).send(info);
//		})(req, res);
//	},
//
//	// function to call once successfully authenticated
//	function (req, res) {
//		res.status(200).send('logged in!');
//	}
//	//passport.authenticate('local', {
//	//	successRedirect: '/',
//	//	failureRedirect: '/login',
//	//})
//);

app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use('/about', aboutRouter);
app.use('/post', postRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;
