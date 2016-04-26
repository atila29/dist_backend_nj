var express = require('express');
var formidable = require('formidable');
var jwt    = require('jsonwebtoken');

var Dilemma = require('../models/dilemma');

var router = express.Router();
var secret = require('../config').secret;

router.use(function(req, res, next) {
  if(req.method == 'OPTIONS'){
    next();
    return;
  }
  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.header.token;
  //console.log(req.body);
  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, secret, function(err, decoded) {
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });

  } else {

    // if there is no token
    // return an error
    return res.status(403).send({
        success: false,
        message: 'No token provided.'
    });

  }
});

/* skal laves */
router.post('/opret-e/p', function(req, res, next) {
  var form = new formidable.IncomingForm();
	form.keepExtensions = true;
	form.uploadDir = __dirname + '/../public/upload/';


	form.parse(req, function(err, fields, files) {
		res.writeHead(200, {'content-type': 'text/plain'});
    res.write('received upload:\n\n');
		console.log(files.name);
    res.end(util.inspect({fields: fields, files: files}));
	});
});

/* skal laves */
router.post('/opret', function(req, res, next) {
  console.log(req.body);
  //var input = JSON.parse(req.body);
  var input = req.body;

  var d = new Dilemma({
    name : input.name,
    user : req.decoded.username,
    desc : input.desc,
    alvor : input.alvor,
    p_answers: input.p_answers
  });

  d.save(function(err){
    if(err){
      res.json({error: err});
    } else {
      res.json(d);
    }
  });
});

router.get('/me', function(req, res, next){
  res.json({user : req.decoded.username});
});



module.exports = router;
