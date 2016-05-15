var express = require('express');
var net = require('net');
var jwt    = require('jsonwebtoken');
var config = require('../config');

var router = express.Router();

const HOST = config.java_server.host;
const PORT = config.java_server.port;

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
          expiresIn : config.tok_expires
        });
      res.json({token : token});
    }
    else {
      res.json({error : 'no_token'});
    }
  });

  client.on('error', function(err) {
    console.log(err);
    res.json({error : 'no connection'});
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
