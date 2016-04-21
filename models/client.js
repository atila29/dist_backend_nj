// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('Client', new Schema({
    name: String,
    admin: Boolean,
    reg_time: {type: Date, default: Date.now}
}, {
    versionKey: false // You should be aware of the outcome after set to false
}));
