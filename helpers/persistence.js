const KnexSingleton = require('./KnexSingleton');

class Persistence {
    connection;
    constructor () {
        this.connection = KnexSingleton.getInstance().conn;
    }

    emailData = (emailData) =>{
        return{
            "emailId":emailData.emailId,
            "tipoEmail": emailData.tipoEmail,
            "remetente":emailData.remetente,
            "assunto":emailData.assunto,
            "incidente":emailData.incidente,
            "autor":emailData.autor,
            "dataOcorrencia":emailData.dataOcorrencia,
            "setor":emailData.setor,
            "prioridade":emailData.prioridade,
            "categoria":emailData.categoria,
            "deptoResponsavel":emailData.deptoResponsavel,
            "descricao":emailData.descricao,
            "receivedDateTime":emailData.dataChegadaOuEnvio,
            "hasAttachments":emailData.hasAttachments,
            "isRead":emailData.isRead   
        }
    }

    insertEmail = async (email) => {
        await this.connection('emails')
            .insert(await this.emailData(email));
    }

    insertAnexo = async (attachments,emailId) => {
        await this.connection('attachments')
            .insert( await this.anexoData(attachments,emailId))
    }

    anexoData =  (attachments,emailId) => {
        return{
            "emailId":emailId,
            "fileName":attachments.fileName,
            "fileContent":JSON.stringify(attachments.fileContent) 
        }
    }
}

module.exports = Persistence;