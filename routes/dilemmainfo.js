var express = require('express');
var mongoose = require('mongoose');
var Dilemma = require('../models/dilemma');
var ImageFile = require('../models/image');
var Response = require('../models/response');
var config = require('../config');

var ObjectId = mongoose.Types.ObjectId;

var router = express.Router();

// http - alle dilemma'er returneres
router.get('/getall', function(req, res){
  Dilemma.find(function(err, d){
    if (err) {
      console.log(err);
      res.json({success : false});
    }
    console.log(d);
    res.json(d);
  });
});

// static
router.get('/getstat/:id', function(req, res){
  Dilemma.findById(req.params.id, function(err, docs) {
    var a = [];
    var r = [];
    var i = 0;
    var samletAntalStemmer = 0;
    docs.p_answers.forEach(function(o){
      a.push(o._id);
      console.log(o);
    });
    a.forEach(function(o){
      var callback = function(c) {
        console.log(a);
        samletAntalStemmer += c;
        r[i++]  = {answer : o, count : c};
        console.log(r);
        console.log(r.length + ' : ' + a.length + '; c: ' + c + '; i: ' + i);
        if (r.length == a.length) {
          r.forEach(function(o1) {
            o1.percent = o1.count / samletAntalStemmer;
          });
          res.json({info  : {total_count : samletAntalStemmer}, answers : r});
        }

      };
      Response.find({answer : o}, function(err, count) {
      console.log(o);
        if (err) {
          res.json({success : false, msg : 'smth'});
          return;
        }
        callback(count.length);
      });
    });

  });
});

router.get('/getimg/:id', function(req, res){
  ImageFile.findById(req.params.id, function(err, doc){
    console.log(JSON.parse(JSON.stringify(doc)));
    res.json(doc);
  });
});

router.get('/get/:id', function(req, res){
  var a = [];
  var callback = function(a, doc){
    var feedback = {
      _id : doc._id,
      user : doc.user,
      name : doc.name,
      desc : doc.desc,
      alvor : doc.alvor,
      reg_time : doc.reg_time,
      p_answers : a
    };
    res.json(feedback);
  }

  Dilemma.findById(req.params.id, function(err, doc){
    if(err){
      res.json({success : false});
      return;
    }
    console.log(JSON.parse(JSON.stringify(doc.p_answers)));
    var i = JSON.parse(JSON.stringify(doc.p_answers));
    var len = i.length;
    i.forEach(function(e){
      if(e.pic){
        ImageFile.findById(e.pic, function(err, d){
          console.log(d.url);
          a.push({_id : e._id, text : e.text, pic : d.url})
          if(--len == 0) callback(a, doc);
        })
      }
      else {
        a.push({_id : e._id, text : e.text})
        if(--len == 0) callback(a, doc);
      }
    });
    console.log(a);
  });
});

module.exports = router;
