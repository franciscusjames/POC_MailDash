const mongoose = require('mongoose');

const IncidentSchema = new mongoose.Schema({
    remetente:{
        type:String,
        required:true,
        trim:true
    },
    receivedDateTime:{
        type:Date,
        default:Date.now,
        required:true
    },
    assunto:{
        type:String, 
        required:true
    },
    body:{
        type:String, 
        required:true
    }
}, {
    timestamps: true
});

const Incident = mongoose.model('Incident', IncidentSchema);
module.exports = Incident
