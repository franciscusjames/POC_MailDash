const mongoose = require('mongoose');

const IncidentSchema = new mongoose.Schema({  
    Incidente:{
        type:String,
        required:true,
        unique:true
    },
    Autor:{
        type:String,
        required:true,
        trim:true
    },
    DataOcorrencia:{
        type:Date,
        default:Date.now,
        required:true
    },
    Setor:{
        type:String,
        required:true
    },
    Prioridade:{
    type:String,
    required:true
    },
    Categoria:{
        type:String,
        required:true
    },        
    DeptoResponsavel:{
        type:String,
        required:true
    },
    Descricao:{
        type:String, 
        required:true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Incident', IncidentSchema);
