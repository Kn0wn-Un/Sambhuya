var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var compression = require('compression');
var helmet = require('helmet');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');
require('dotenv').config();

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
				bcrypt.compare(password, user.password, (err, res) => {
					if (res) {
						// passwords match! log user in
						return done(null, user);
					} else {
						// passwords do not match!
						return done(null, false, {
							message: 'Incorrect password',
						});
					}
				});
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

app.use(compression());
app.use(helmet());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(
	session({
		secret: process.env.sessionSecret,
		resave: false,
		saveUninitialized: true,
	})
);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));
app.use(function (req, res, next) {
	res.locals.currentUser = req.user;
	next();
});

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
