var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var routes = require('./routes/index');
var users = require('./routes/users');
var uploads = require('./routes/upload');
var login = require('./routes/login');
var auth = require('./routes/auth');
var dilemmaCRoute = require('./routes/dilemmaroute');

var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file
var Dilemma = require('./models/dilemma');
//var _client   = require('./models/client'); // get our mongoose model


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, token");
  next();
});

app.use('/', routes);
app.use('/users', users);
app.use('/upload', uploads);
app.use('/login', login);
app.use('/api/authenticate', auth)
app.use('/d', dilemmaCRoute)




mongoose.connect(config.database); // connect to database
app.set('tSecret', config.secret); // secret variable


////
app.get('/setup', function(req, res) {

  // sample dilemma
  var d = new Dilemma({
    name: 'test',
    user: 'test_u',
    desc: 'test_d',
    alvor: 2,
    p_answers: [{text:'virk1'}, {text:'virk2'}]
  });


  // save the sample user
  d.save(function(err) {
    if (err) throw err;

    console.log('User saved successfully');
    res.json({ success: true });
  });
});
///


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});



// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

app.listen(3001, function() {
	console.log("working 3001");
});

module.exports = app;
