const express = require('express');
const router = express.Router();
const authHelper = require('../helpers/auth');
const graph = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch');
const htmlToText = require('html-to-text');

let emailsTratados, client;

async function tratarEmails(emails) {
  emailsTratados = emails.map((item) => {
      return {emailId: item.id, 
              emailBody: item.body.content,
              remetente: item.from.emailAddress.address,
              assunto: item.subject,
              //isRead: item.isRead,
              sentDateTime: item.sentDateTime,
              hasAttachments: item.hasAttachments,
              attachments: []
      };
  });
  //console.log('emailsTratados: ', emailsTratados);   
}


async function formatarEmails(emails) {
  return emailsFormatados = emails.map((item) => {
      return {emailId: item.emailId, 
              emailBody: htmlToText.fromString(item.emailBody),
              remetente: item.remetente,
              assunto: item.assunto,
              //isRead: item.isRead,
              sentDateTime: item.sentDateTime,
              hasAttachments: item.hasAttachments,
              attachments: item.attachments
      };
  });  
}

async function getAnexos(emails) {
  let attachedEmailList = emails.map(async (item) => {      
      if (item.hasAttachments) {          
          try {            
            const res = await client
            .api(`/me/messages/${item.emailId}/attachments/`)
            .get();   

            let attach = res.value;

            attach.map((anexo) => {
                item.attachments.push({fileName:anexo.name, fileContent: anexo.contentBytes});                 
            });     
          } catch (err) {
            console.log('Erro: ', err);
          }                    
      };
  });
  return attachedEmailList;
}

/* GET /mail */
router.get('/', async function(req, res, next) {
    let parms = { title: 'Outbox', active: { outbox: true } };
  
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

      //CAIXA DE SAIDA
      try {
        // Get the 10 newest messages from outbox
        const result = await client
        .api('/me/mailfolders/sentitems/messages')
        .top(10)
        //.select('subject,from,receivedDateTime,isRead')
        .select('*')                               
        .orderby('sentDateTime DESC')
        .get();            
        parms.messages = result.value;            
        res.render('mailOut', parms);
        
        //FILTRA DADOS DO EMAIL QUE SERAO UTILIZADOS
        await tratarEmails(result.value); 

      } catch (err) {
        parms.message = 'Error retrieving messages';
        parms.error = { status: `${err.code}: ${err.message}` };
        parms.debug = JSON.stringify(err.body, null, 2);
        res.render('error', parms);
      }
      
      //FORMATA EMAILSBODY (HTML->TEXT) P/ GRAVAR NO BANCO
      let emailsFormatados = await formatarEmails(emailsTratados);
      //console.log('emailsFormatados: ', emailsFormatados);

      //PEGA ANEXOS DOS EMAILS, SE HOUVER
      //let attachedEmailList = await getAnexos(emailsFormatados); 
         
      //AGRUPAR EMAILS COM MESMO ASSUNTO, OU FILTRAR POR ASSUNTO E DEIXAR O ULTIMO?
      //let filteredEmails = await filtrarEmails();

      //GRAVA LISTA DE EMAILS NO BANCO
      //await postEmails(finalEmailList); 

    } else {
      // Redirect to home
      res.redirect('/');
    }
  });

module.exports = router;