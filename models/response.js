var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('Response', new Schema({
    dilemma : {type : mongoose.Schema.Types.ObjectId, ref : 'Dilemma', required : true},
    user : {type : String, required : true},
    answer : {type : mongoose.Schema.Types.ObjectId, required : true}, // burde være en ref til answer, se om muligt
    reg_time: {type: Date, default: Date(Date.toString())},
    active : {type : Boolean, default : true}
}));
