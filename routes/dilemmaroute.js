var express = require('express');
var formidable = require('formidable');
var jwt    = require('jsonwebtoken');
var mongoose = require('mongoose');
var array = require('array');
var FTPClient = require('ftp');
var fs = require('fs');

var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var Dilemma = require('../models/dilemma');
var ImageFile = require('../models/image');
var Response = require('../models/response');

var router = express.Router();
var config = require('../config');
var secret = require('../config').secret;

router.use(function(req, res, next) {
  if(req.method == 'OPTIONS') return next();
  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.header.token || req.headers["token"];
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

router.get('/already/:id', function (req, res, next) {
  Response.find({dilemma : req.params.id, user : req.decoded.username}, function(err, doc) {
    if (err) {
      res.json({success : false, error : true});
      console.log(error);
    }
    else {
      console.log(doc);
      console.log(doc.length);
      if (doc[0]) {
        res.json({success : true, answered : true});
      }
      else {
        res.json({success : true, answered : false});
      }
    }
  })
});

router.post('/answer/:id/:answer', function(req, res, next){
  Dilemma.findById(req.params.id, function(err, doc){
    console.log(req.decoded.username);
    console.log(req.params.answer);

    // check if the answer exist
    var arr = array(JSON.parse(JSON.stringify(doc.p_answers)));
    if (arr.find({_id : req.params.answer.toString()})) console.log('virker'); // hvis dette ikke er sandt skal fejl sendes og return;
    //check if user already answered
    arr = Response.find({user : req.decoded.username.toString(), dilemma : req.params.id.toString()}, function(err, docs) {
      console.log(JSON.parse(JSON.stringify(docs)));
      if(docs.length < 1){
        var r = new Response({
          dilemma : doc._id,
          user : req.decoded.username,
          answer : req.params.answer
        });
        r.save(function(err) {
          if (err) throw err;
          console.log('Response saved');
          res.json({success : true});
        });
      }
      else {
        res.json({success : false, msg : 'already answered'});
      }
    });
  });
});

// denne skal være opret uden form!
router.post('/csimple', function(req, res, next) {
  var body = req.body;

  var d = new Dilemma({
    user : req.decoded.username,
    name : body.name,
    desc : body.desc,
    alvor : body.alvor,
    p_answers : body.p_answers
  });

  d.save(function(err){
    if (err) throw err;
    console.log('saved dilemma');
    res.json({"success" : true})
  });

});

/* bør flyttes til route for form's */


//udvid til mine-dilemmaer & besvarede.
router.get('/me', function(req, res, next){
  res.json({user : req.decoded.username});
});



module.exports = router;
