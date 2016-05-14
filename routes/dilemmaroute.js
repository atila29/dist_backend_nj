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

  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, token");

  if(req.method == 'OPTIONS'){
    next();
    return;
  }


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
router.post('/opret/p', function(req, res, next) {

/* skal laves */
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

/* bør flyttes til route for form's */
router.post('/opret', function(req, res, next) {

  var form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.uploadDir = __dirname + '/../public/upload/';

  var pics = [];

  form.on('file', function(name, file){

    var p = file.path.split('public')[1];
    var c = new FTPClient();
    c.on('ready', function() {
      console.log('klar');
      c.put(file.path, 'uploads/'+p, function (err) {
        if(err) throw err;
        c.end();
      });
    });
    c.connect(config.ftp_server);

    p = config.cdn_server + p;
    var pic = new ImageFile({
      url : p
    });
    pic.save(function(err) {
      if (err) throw err;
      console.log('Image saved');
    });
    pics.push(pic);
  });

  form.parse(req, function(err, fields, files) {
		console.log(files);
    console.log(JSON.parse(JSON.stringify(fields)));

    var answers = [];

     // dette skal fejlhåndteres, gerne ogs' testes,
    var q = JSON.parse(fields.p_answers); // fordi angular sender json-arrays i forms serialized
    console.log(q);

    for (var i = 0; i < q.length; i++) {
      if (pics[i]){
        answers.push({text : q[i].text, pic : pics[i]._id});
      }
      else {
        answers.push({text : q[i].text})
      }
    }

    var d = new Dilemma({
      user : req.decoded.username,
      name : fields.name,
      desc : fields.desc,
      alvor : fields.alvor,
      p_answers : answers
    });

    d.save(function(err){
      if (err) throw err;
      console.log('saved dilemma');
    });

    res.json({"success" : true})
	});

});

//udvid til mine-dilemmaer & besvarede.
router.get('/me', function(req, res, next){
  res.json({user : req.decoded.username});
});



module.exports = router;
