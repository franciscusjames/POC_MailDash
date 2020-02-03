const KnexSingleton = require('./KnexSingleton');

class Persistence {
    connection;
    constructor () {
        this.connection = KnexSingleton.getInstance().conn;
    }

    emailData = (emailData) =>{
        return{
            "emailId":emailData.emailId,
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
            "receivedDateTime":emailData.receivedDateTime,
            "hasAttachments":emailData.hasAttachments,
            "isRead":emailData.isRead   
        }
    }

    insertEmail = async (email) => {
        await this.connection('emails')
            .insert(await this.emailData(email));
    }

}

module.exports = Persistence;