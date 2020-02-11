const express = require('express');
const router = express.Router();
const authHelper = require('../helpers/auth');
const graph = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch');
const htmlToText = require('html-to-text');
const controller = require('../controller/email.controller');
const { parseAnexos, deleteAnexosFolders, pdfToText } = require('../utils/parseAnexos')
const fs = require('fs-extra');


let client, emailsTratados;
let dateTimeParm = '2020-02-03T17:30:00Z';

async function tratarEmails(emails) {
  emailsTratados = emails.map((item) => {
    return {
      emailId: item.id,
      tipoEmail: 'Inbox',
      remetente: item.from.emailAddress.address,
      assunto: item.subject,
      emailBody: item.body.content,
      dataChegadaOuEnvio: item.receivedDateTime,
      attachments: [],
      hasAttachments: item.hasAttachments,
      isRead: item.isRead
    };
  });
}

async function formatarEmails(emails) {
  let formatList = emails.map((item) => {
    let textBody = htmlToText.fromString(item.emailBody)
    //console.log('textBody: ',textBody ) 	  
    let clearTextBody = textBody.split('--' || '__')[0];
    //console.log('clearTextBody: ',clearTextBody ) 
    return {
      emailId: item.emailId,
      tipoEmail: item.tipoEmail,
      remetente: item.remetente,
      assunto: item.assunto,
      emailBody: JSON.parse('{' + clearTextBody + '}'),
      dataChegadaOuEnvio: item.dataChegadaOuEnvio,
      hasAttachments: item.hasAttachments,
      attachments: item.attachments,
      isRead: item.isRead,
    };
  });
  return formatList;
}

async function getAnexos(emails) {
  let anexos = emails.map(async (item) => {
    if (item.hasAttachments) {
      try {
        const dir = `./Anexos/${item.assunto.replace(':', '')}`;
        fs.ensureDirSync(dir);

        const res = await client
          .api(`/me/messages/${item.emailId}/attachments/`)
          .get();

        let attach = res.value;
        attach.map((anexo) => {
          fs.writeFileSync(`${dir}/${anexo.name}`, anexo.contentBytes, { encoding: 'base64' })
          item.attachments.push({ fileName: anexo.name });
        });
        return item;

      } catch (err) {
        console.log('Erro: ', err);
      }

    } else {
      return item;
    }
  });
  return Promise.all(anexos);
}


/* GET /mail */
router.get('/', async function (req, res, next) {
  let parms = { title: 'Inbox', active: { inbox: true } };

  const accessToken = await authHelper.getAccessToken(req.cookies, res);
  const userName = req.cookies.graph_user_name;

  if (accessToken && userName) {
    parms.user = userName;

    // Initialize Graph client
    client = graph.Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      }
    });

    //CAIXA DE ENTRADA
    try {
      // Get the 10 newest messages from inbox
      const result = await client
        .api(`/me/mailfolders/inbox/messages`)
        .top(5)
        //.select('subject,from,receivedDateTime,isRead')
        .select('*')
        .orderby('receivedDateTime DESC')
        //.filter(`receivedDateTime ge ${dateTimeParm}`) //traz a partir dessa data/hora
        .get();
      parms.messages = result.value;
      res.render('mail', parms);
      //console.log('result.value: ', result.value[4]);

      //FILTRA DADOS DO EMAIL QUE SERAO UTILIZADOS
      await tratarEmails([result.value[4]]);
      //console.log('emailsTratados: ', emailsTratados);        

    } catch (err) {
      parms.message = 'Error retrieving messages';
      parms.error = { status: `${err.code}: ${err.message}` };
      parms.debug = JSON.stringify(err.body, null, 2);
      res.render('error', parms);
    }

    //FORMATA EMAILSBODY (HTML->TEXT->JSON) P/ GRAVAR NO BANCO
    let emailsFormatados = await formatarEmails(emailsTratados);
    //console.log('emailsFormatados: ', emailsFormatados);

    //PEGA ANEXOS DOS EMAILS, SE HOUVER
    let attachedEmailList = await getAnexos(emailsFormatados);
    //console.log('attachedEmailList: ', attachedEmailList);   

    //TRANSFORMA O CONTEUDO DOS ANEXOS EM JSON/TXT
    let parsedEmailList = await parseAnexos(attachedEmailList);
    //console.log('parsedEmailList: ', parsedEmailList);

    //TRANSFORMA O CONTEUDO TXT(SE HOUVER) EM JSON
    let finalEmailList = await pdfToText(parsedEmailList);
    console.log('finalEmailList: ', finalEmailList[0].attachments);

    //DELETA OS DIRETÓRIOS DOS ANEXOS
    await deleteAnexosFolders(finalEmailList);

    //GRAVA LISTA DE EMAILS NO BANCO      
    //await controller.save(finalEmailList)      

  } else {
    // Redirect to home
    res.redirect('/');
  }
});

module.exports = router;
