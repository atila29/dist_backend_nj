// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;


// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('Dilemma', new Schema({
    name: String,
    user: String,
    desc: String,
    alvor: Number,
    p_answers: [{text : String, pic : {type : mongoose.Schema.Types.ObjectId, ref : 'Image' ,default : undefined}}],
    active: {type: Boolean, default: true},
    reg_time: {type: Date, default: Date(Date.toString())}
}));
