const { isNullOrUndefined } = require("util");

class Email {

    emailId;
    tipoEmail;
    remetente;
    assunto;
    //emailBody
    incidente;
    autor;
    dataOcorrencia;
    setor;
    prioridade;
    categoria;
    deptoResponsavel;
    descricao;
    divergencia;
    finalizado;
    dataChegadaOuEnvio;
    hasAttachments;
    isRead;


    constructor(emailId, tipoEmail, remetente, assunto, emailBody, dataChegadaOuEnvio, hasAttachments, isRead) {
        this.emailId = emailId;
        this.tipoEmail = tipoEmail;
        this.remetente = remetente;
        this.assunto = assunto;
        this.incidente = emailBody.Incidente;
        this.autor = emailBody.Autor;
        this.dataOcorrencia = emailBody.DataOcorrencia;
        this.setor = emailBody.Setor;
        this.prioridade = emailBody.Prioridade;
        this.categoria = emailBody.Categoria;
        this.deptoResponsavel = emailBody.DeptoResponsavel;
        this.descricao = emailBody.Descricao;
        this.divergencia = emailBody.Divergencia;
        this.finalizado = emailBody.Finalizado;
        this.dataChegadaOuEnvio = dataChegadaOuEnvio;
        this.hasAttachments = hasAttachments;
        this.isRead = isRead;

        this.validate();
    }

    validate() {
        if (isNullOrUndefined(this.emailId)) throw Error('emailId é obrigatório.')
        if (isNullOrUndefined(this.tipoEmail)) throw Error('tipoEmail é obrigatório.')
        if (isNullOrUndefined(this.remetente)) throw Error('remetente é obrigatório.')
        if (isNullOrUndefined(this.assunto)) throw Error('assunto é obrigatório.')
        if (isNullOrUndefined(this.incidente)) throw Error('emailBody.Incidente é obrigatório.')
        if (isNullOrUndefined(this.autor)) throw Error('emailBody.Autor é obrigatório.')
        if (isNullOrUndefined(this.dataOcorrencia)) throw Error('emailBody.DataOcorrncia é obrigatório.')
        if (isNullOrUndefined(this.setor)) throw Error('emailBody.Setor é obrigatório.')
        if (isNullOrUndefined(this.prioridade)) throw Error('emailBody.Prioridade é obrigatório.')
        if (isNullOrUndefined(this.categoria)) throw Error('emailBody.Categoria é obrigatório.')
        if (isNullOrUndefined(this.deptoResponsavel)) throw Error('emailBody.DeptoResponsavel é obrigatório.')
        if (isNullOrUndefined(this.descricao)) throw Error('emailBody.Descricao é obrigatório.')
        if (isNullOrUndefined(this.divergencia)) throw Error('emailBody.Divergencia é obrigatório.')
        if (isNullOrUndefined(this.finalizado)) throw Error('emailBody.Finalizado é obrigatório.')
        if (isNullOrUndefined(this.dataChegadaOuEnvio)) throw Error('dataChegadaOuEnvio é obrigatório.')
        if (isNullOrUndefined(this.hasAttachments)) throw Error('hasAttachments é obrigatório.')
        if (isNullOrUndefined(this.isRead)) throw Error('isRead é obrigatório.')
    }

}

module.exports = Email
