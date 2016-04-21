var express = require('express');
var soap = require('soap');
var net = require('net');
var jwt    = require('jsonwebtoken');

var router = express.Router();

const HOST = 'localhost';
const PORT = '4444';

var secret = require('../config').secret

router.post('/', function(req, res, next){
  var body = req.body;
  var uname = body.user;
  var pword = body.password;
  var ret = {};

  // kommunikation med BrugerProtocol
  var client = new net.Socket();
  client.setEncoding('utf8');
  client.connect(PORT, HOST, function() {
    client.write('login\n');
    client.write(JSON.stringify({'username' : uname, 'password' : pword})+'\n');
    client.end();
  });

  client.on('data', function(data){

    json = JSON.parse(data)
    console.log(json);
    if(!json.hasOwnProperty("error")) {
      var token = jwt.sign(json, secret, {
          expiresIn : 3600
        });
      res.json({token : token});
    }
    else {
      res.json({'error' : 'no_token'});
    }
  });

  client.on('end', function(){
    res.end();
    client.destroy();
  });

  res.type('json')
  console.log("U : " + uname + "  P : " + pword);
  //res.write({'msg' : ret});

});

module.exports = router;
