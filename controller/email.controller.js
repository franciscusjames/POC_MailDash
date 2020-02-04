const Email = require('../models/Email');
const Attachment = require('../models/Attachment');
const Persistence = require('../helpers/persistence');

exports.save = async (emails) => {    
    console.log('EMAILS: ', emails)

    const persistence = new Persistence();

    emails.map(async (item) => {
        let email = new Email(item.emailId, 
                              item.remetente, 
                              item.assunto, 
                              item.emailBody, 
                              item.receivedDateTime, 
                              item.hasAttachments, 
                              //item.attachments, 
                              item.isRead
        )
        // console.log('DB ITEM: ', item);
        // console.log('DB EMAIL: ', email);
        let res = await persistence.insertEmail(email);

        if (item.hasAttachments) {
            item.attachments.map(async (anexo) => {
                let attachment = new Attachment(anexo.fileName, anexo.fileContent);
                let att = await persistence.insertAnexo(attachment);
            })            
        }

    });
    
}