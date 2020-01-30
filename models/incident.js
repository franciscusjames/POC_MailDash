const mongoose = require('mongoose');

const IncidentSchema = new mongoose.Schema({
    remetente:{
        type:String,
        required:true,
        trim:true
    },    
    assunto:{
        type:String, 
        required:true
    },
    emailBody:{
        type:String, 
        required:true
    },
    receivedDateTime:{
        type:Date,
        default:Date.now,
        required:true
    },    
    attachments:{  
        type:Array,
        default:[{fileName:String, fileContent:String}]
    },
}, {
    timestamps: true
});

const Incident = mongoose.model('Incident', IncidentSchema);
module.exports = Incident
