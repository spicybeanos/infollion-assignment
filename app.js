require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var { getUserFromSession } = require('./database.js');
var { validateToken } = require('./validate.js')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var loginRouter = require('./routes/login');
var signUpRouter = require('./routes/signup');
var balanceRouter = require('./routes/balance');
var transferRouter = require('./routes/transfer');
var adminRouter = require('./routes/admin');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/login', loginRouter);
app.use('/signup', signUpRouter);
app.use('/balance', async (req, res, next) => {
  if (req.headers.authorization === undefined) {
    res.status(403).send("Unauthorized");
    return;
  }
  const auth = req.headers.authorization.split(' ')[1];
  const valid = await validateToken(auth);

  if (!valid) {
    res.status(403).send("Invalid token");
    return;
  }
  next();
}, balanceRouter);

app.use('/transfer', async (req, res, next) => {
  if (req.headers.authorization === undefined) {
    res.status(403).send("Unauthorized");
    return;
  }
  const auth = req.headers.authorization.split(' ')[1];
  const valid = await validateToken(auth);

  if (!valid) {
    res.status(403).send("Invalid token");
    return;
  }
  next();
}, transferRouter);

app.use('/admin', async (req, res, next) => {
  if (req.headers.authorization === undefined) {
    res.status(403).send("Unauthorized");
    return;
  }
  const auth = req.headers.authorization.split(' ')[1];
  const valid = await validateToken(auth);

  if (!valid) {
    res.status(403).send("Invalid token");
    return;
  }
  const username = await getUserFromSession(auth);

  if(username != process.env.ADMIN){
    return res.status(403).send("Not admin");
  }
  next();
}, adminRouter);

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
