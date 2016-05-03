var express = require('express');
var mongoose = require('mongoose');
var Dilemma = require('../models/dilemma');
var ImageFile = require('../models/Image');

var router = express.Router();


router.get('/getall', function(req, res){
  Dilemma.find(function(err, d){
    if(err) {
      console.log(err);
      res.json({success : false});
    }
    console.log(d);
    res.json(d);
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
