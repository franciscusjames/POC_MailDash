const express = require('express');
const router = express.Router();
const authHelper = require('../helpers/auth');
const graph = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch');
const htmlToText = require('html-to-text');
const Incident = require('../models/incident');

let emailBody, remetente, assunto, isRead, sentDateTime;

/* GET /mail */
router.get('/', async function(req, res, next) {
    let parms = { title: 'Outbox', active: { outbox: true } };
  
    const accessToken = await authHelper.getAccessToken(req.cookies, res);
    const userName = req.cookies.graph_user_name;
  
    if (accessToken && userName) {
      parms.user = userName;
  
      // Initialize Graph client
      const client = graph.Client.init({
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
        //console.log('INFO>>> ', result.value[1])
        //PEGA DADOS DO EMAIL PARA GRAVAR NO BANCO
        emailBody = result.value[1].body.content;   
        remetente = result.value[1].from.emailAddress.address;          
        assunto   = result.value[1].subject;  
        isRead    = result.value[1].isRead;
        sentDateTime = result.value[1].sentDateTime;
        // console.log('emailBody: ', emailBody);     
        // console.log('remetente: ', remetente);      
        // console.log('assunto: ', assunto);
        // console.log('isRead: ', isRead);
        // console.log('receivedDateTime: ', receivedDateTime);

      } catch (err) {
        parms.message = 'Error retrieving messages';
        parms.error = { status: `${err.code}: ${err.message}` };
        parms.debug = JSON.stringify(err.body, null, 2);
        res.render('error', parms);
      }
       //EMAIL BODY TO JSON 
       let textBody = htmlToText.fromString(emailBody);    
       console.log('textBody: ', textBody);       
       let parsedEmail = {};  
       parsedEmail.remetente = remetente; 
       parsedEmail.sentDateTime = sentDateTime;
       parsedEmail.assunto = assunto;   
       parsedEmail.body = textBody;
       //parsedEmail = JSON.parse('{' + htmlToText.fromString(emailBody) + '}');                
       console.log('parsedEmail: ', parsedEmail);               
       //GRAVA REGISTROS NO BANCO -> ('isRead' == false)

    } else {
      // Redirect to home
      res.redirect('/');
    }
  });

module.exports = router;