const express = require('express');
const router = express.Router();
const authHelper = require('../helpers/auth');
const graph = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch');
const htmlToText = require('html-to-text');
const Incident = require('../models/incident');
const controller = require('../controller/incident.controller')

let emailsTratados, client;

async function tratarEmails(emails) {
  emailsTratados = emails.map((item) => {
      return {remetente: item.from.emailAddress.address,
              assunto: item.subject,
              emailBody: item.body.content,              
              receivedDateTime: item.receivedDateTime,              
              attachments: [],
              hasAttachments: item.hasAttachments,
              emailId: item.id
              //isRead: item.isRead,
      };
  });
  //console.log('emailsTratados: ', emailsTratados);   
}

async function formatarEmails(emails) {
  return emailsFormatados = emails.map((item) => {
      return {remetente: item.remetente,
              assunto: item.assunto,
              emailBody: htmlToText.fromString(item.emailBody),              
              receivedDateTime: item.receivedDateTime,              
              attachments: item.attachments
              //hasAttachments: item.hasAttachments,
              //emailId: item.emailId,
              //isRead: item.isRead,
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

// async function agruparEmails(emails) {
//   return emailsAgrupados = emails.map((item) => {
//       //se item.assunto includes outro assunto parecido
//       if (item.assunto) {

//       }
//   });  
// }

/* GET /mail */
router.get('/', async function(req, res, next) {
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
        .api('/me/mailfolders/inbox/messages')
        .top(10)
        //.select('subject,from,receivedDateTime,isRead')
        .select('*')                               
        .orderby('receivedDateTime DESC')
        .get();            
        parms.messages = result.value;            
        res.render('mail', parms);
                
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
      let attachedEmailList = await getAnexos(emailsFormatados); 
         
      //AGRUPAR EMAILS COM MESMO ASSUNTO
      //let groupedEmails = await agruparEmails(attachedEmailList);

      //GRAVA LISTA DE EMAILS NO BANCO      
      await controller.create(attachedEmailList)      

    } else {
      // Redirect to home
      res.redirect('/');
    }
});

module.exports = router;
