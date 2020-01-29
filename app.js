const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
require('dotenv').config();
const indexRouter = require('./routes/index');
const authorize = require('./routes/authorize');
const mail = require('./routes/mail');
const mailOut = require('./routes/mailOut');
const mongoose = require('mongoose');

const app = express();

// MongoDB Connection
mongoose.connect('mongodb+srv://admin:admin@cluster0-5tjqm.mongodb.net/Emails?retryWrites=true&w=majority', {
  useNewUrlParser: true, useUnifiedTopology: true
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/authorize', authorize);
app.use('/mail', mail);
app.use('/mailOut', mailOut);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

// id: e3c91d0d-0dc4-4fd4-876d-08e39f638ea4
// ClientSecret: [cmC6U?[mj2PUHfZiqyX6aibw9dllMY?