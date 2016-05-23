var express = require('express');
var formidable = require('formidable');
var jwt    = require('jsonwebtoken');
var mongoose = require('mongoose');
var array = require('array');
var FTPClient = require('ftp');
var fs = require('fs');

var Dilemma = require('../models/dilemma');
var ImageFile = require('../models/image');
var Response = require('../models/response');

var router = express.Router();
var config = require('../config');
var secret = require('../config').secret;

var tokenVerify = function (token, callback, wrongTokErr, noTokErr) {
  token = JSON.parse(JSON.stringify(token));
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, secret, function(err, decoded) {
      if (err) {
        wrongTokErr();
        //return res.json({ success: false, message: 'Failed to authenticate token.' });
      } else {
        // if everything is good, save to request for use in other routes
        callback(decoded);
      }
    });
  } else {
    // if there is no token
    // return an error
    noTokErr();
  }
}


router.post('/opret', function(req, res, next) {

  var form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.uploadDir = __dirname + '/../public/upload/';

  var pics = [];

  form.on('file', function(name, file){
    // dette burde først håndteres efter token er verificeret...
    var p = file.path.split('/upload/')[1];
    console.log('her: ' + p);
    var c = new FTPClient();
    c.on('ready', function() {
      console.log('klar');
      c.put(file.path, '/uploads/'+p, function (err) {
        if(err) throw err; // smart fejlhåndtering...
        c.end();
      });
    });
    c.connect(config.ftp_server);

    var p0 = config.cdn_server.host + ':' + config.cdn_server.port + '/' +p;
    var pic = new ImageFile({
      url : p0
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

    tokenVerify(fields.token, function(data) {
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
        user : data.username,
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
    },
    function() {
      return res.json({ success: false, message: 'Failed to authenticate token.' });
    },
    function() {
      return res.status(403).send({
          success: false,
          message: 'No token provided.'
      });
    });
	});

});

module.exports = router;
