var express = require('express');
var formidable = require('formidable');
var jwt    = require('jsonwebtoken');

var Dilemma = require('../models/dilemma');
var ImageFile = require('../models/Image');

var router = express.Router();
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

/* skal laves */
router.post('/opret', function(req, res, next) {
  //var input = JSON.parse(req.body);


  var form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.uploadDir = __dirname + '/../public/upload/';

  var pics = [];

  form.on('file', function(name, file){
    var pic = new ImageFile({
      url : file.path
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

    var q = JSON.parse(fields.p_answers);
    console.log(q);

    for(var i = 0; i < q.length; i++) {
      if(pics[i]){
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
      if(err) throw err;
      console.log('saved dilemma');
    });

    res.json({"success" : true})
	});

});

router.get('/me', function(req, res, next){
  res.json({user : req.decoded.username});
});



module.exports = router;
