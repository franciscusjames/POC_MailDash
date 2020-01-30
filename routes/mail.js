const express = require('express');
const router = express.Router();
const authHelper = require('../helpers/auth');
const graph = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch');
const htmlToText = require('html-to-text');
const Incident = require('../models/incident');
const controller = require('../controller/incident.controller')

let emailsTratados, emailsFormatados, attachedEmailList, client;

async function tratarEmails(emails) {
  emailsTratados = emails.map( (item) => {
      return {emailId: item.id,
              remetente: item.from.emailAddress.address,
              assunto: item.subject,
              emailBody: item.body.content,              
              receivedDateTime: item.receivedDateTime,              
              attachments: [],
              hasAttachments: item.hasAttachments,              
              isRead: item.isRead
      };
  });  
}

async function formatarEmails(emails) {
  emailsFormatados = emails.map((item) => {
      let textBody = htmlToText.fromString(item.emailBody)      
      console.log('textBody: ',textBody )      
      return {emailId: item.emailId,
              remetente: item.remetente,
              assunto: item.assunto,
              emailBody: JSON.parse('{' + textBody + '}'),
              receivedDateTime: item.receivedDateTime,              
              hasAttachments: item.hasAttachments,
              attachments: item.attachments,                            
              isRead: item.isRead,
      };
  });    
}

async function getAnexos(emails) {
  attachedEmailList = await emails.map(async (item) => {      
      if (item.hasAttachments) {          
          try {            
            const res = await client
            .api(`/me/messages/${item.emailId}/attachments/`)
            .get();   

            let attach = res.value;

            attach.map((anexo) => {
                item.attachments.push({fileName:anexo.name, fileContent: anexo.contentBytes});                 
            });   
            return item;

          } catch (err) {
            console.log('Erro: ', err);
          }                    
      } else {
        return item;
      }
  });    
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
        .top(3)
        //.select('subject,from,receivedDateTime,isRead')
        .select('*')                               
        .orderby('receivedDateTime DESC')
        .get();            
        parms.messages = result.value;            
        res.render('mail', parms);
                
        //FILTRA DADOS DO EMAIL QUE SERAO UTILIZADOS
        await tratarEmails(result.value);  
        //console.log('emailsTratados: ', emailsTratados);        
        
      } catch (err) {
        parms.message = 'Error retrieving messages';
        parms.error = { status: `${err.code}: ${err.message}` };
        parms.debug = JSON.stringify(err.body, null, 2);
        res.render('error', parms);
      }

      //FORMATA EMAILSBODY (HTML->TEXT) P/ GRAVAR NO BANCO
      await formatarEmails(emailsTratados);
      console.log('emailsFormatados: ', emailsFormatados);

      //PEGA ANEXOS DOS EMAILS, SE HOUVER
      await getAnexos(emailsFormatados); 
      //console.log('attachedEmailList: ', attachedEmailList[0]);   

      //AGRUPAR EMAILS COM MESMO ASSUNTO
      //let groupedEmails = await agruparEmails(attachedEmailList);

      //GRAVA LISTA DE EMAILS NO BANCO      
      //await controller.create(attachedEmailList)      

    } else {
      // Redirect to home
      res.redirect('/');
    }
});

module.exports = router;
