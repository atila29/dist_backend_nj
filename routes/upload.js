var express = require('express');
var formidable = require('formidable');
var util = require('util');

var router = express.Router();




// POST upload
router.post('/', function(req, res, next){
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

module.exports = router
