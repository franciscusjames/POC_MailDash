const mongoose = require('mongoose');

const IncidentSchema = new mongoose.Schema({  
    Incidente:        String,
    Autor:            String,
    DataOcorrencia:   String,
    Setor:            String,
    Prioridade:       String,
    Categoria:        String,        
    DeptoResponsavel: String,
    Descricao:        String
}, {
    timestamps: true
});

module.exports = mongoose.model('Incident', IncidentSchema);
