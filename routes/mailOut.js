const express = require('express');
const router = express.Router();
const authHelper = require('../helpers/auth');
const graph = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch');
const htmlToText = require('html-to-text');
const Incident = require('../models/incident');

let emailBodyIn, emailBodyOut;
let remetenteIn, remetenteOut;
let assuntoIn, assuntoOut;
let isRead;

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
        //.orderby('receivedDateTime DESC')
        .get();            
        parms.messages = result.value;            
        res.render('mailOut', parms);
        
        //PEGA DADOS DO EMAIL PARA GRAVAR NO BANCO
        // emailBodyOut = result.value[0].body.content;   
        // remetenteOut = result.value[0].from.emailAddress.address;          
        // assuntoOut   = result.value[0].subject;  
        // //isRead    = result.value[0].isRead;
        // console.log('emailBodyOut: ', emailBodyOut);     
        // console.log('remetenteOut: ', remetenteOut);      
        // console.log('assuntoOut: ', assuntoOut);
        // //console.log('isRead: ', isRead);

      } catch (err) {
        parms.message = 'Error retrieving messages';
        parms.error = { status: `${err.code}: ${err.message}` };
        parms.debug = JSON.stringify(err.body, null, 2);
        res.render('error', parms);
      }
      //EMAIL BODY TO JSON      
    //   parsedEmailOut = htmlToText.fromString(emailBodyOut); 
    //   //parsedEmail = JSON.parse('{' + htmlToText.fromString(emailBody) + '}');     
    //   parsedEmailOut.Remetente = remetenteOut; 
    //   parsedEmailOut.Assunto = assuntoOut;       
    //   console.log('parsedEmailOut: ', parsedEmailOut);               
    //   //GRAVA REGISTROS NO BANCO -> ('isRead' == false)

    //   let msgIn = htmlToText.fromString(parms.messages); 
    //   let msgOut = htmlToText.fromString(parms.messagesOut); 
    //   console.log('parms.messages: ', parms.messages[1,2]); 
    //   console.log('parms.messagesOut: ', parms.messagesOut[1,2]); 

    } else {
      // Redirect to home
      res.redirect('/');
    }
  });

module.exports = router;