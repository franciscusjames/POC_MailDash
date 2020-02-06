const Email = require('../models/Email');
const Attachment = require('../models/Attachment');
const Persistence = require('../helpers/persistence');

exports.save = async (emails) => {        
    const persistence = new Persistence();

    emails.map(async (item) => {
        let email = new Email(item.emailId, 
                              item.tipoEmail,
                              item.remetente, 
                              item.assunto, 
                              item.emailBody, 
                              item.dataChegadaOuEnvio, 
                              item.hasAttachments, 
                              item.attachments, 
                              item.isRead
        );

        await persistence.insertEmail(email);

        if (item.hasAttachments) {
            item.attachments.map(async (anexo) => {
                let attachment = new Attachment(anexo.fileName, anexo.fileContent);
                await persistence.insertAnexo(attachment,item.emailId);
            })            
        }

    });
    
}