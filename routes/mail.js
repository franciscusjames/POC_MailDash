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
    let parms = { title: 'Inbox', active: { inbox: true } };
    //let parmsOut = { title: 'Outbox', active: { outbox: true } };
  
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

//CAIXA DE ENTRADA
      try {
        // Get the 3 newest messages from inbox
        const result = await client
        .api('/me/mailfolders/inbox/messages')
        .top(10)
        //.select('subject,from,receivedDateTime,isRead')
        .select('*')                               
        .orderby('receivedDateTime DESC')
        .get();            
        parms.messages = result.value;            
        res.render('mail', parms);
        
        //PEGA DADOS DO EMAIL PARA GRAVAR NO BANCO
        // emailBodyIn = result.value[0].body.content;   
        // remetenteIn = result.value[0].from.emailAddress.address;          
        // assuntoIn   = result.value[0].subject;  
        // isRead    = result.value[0].isRead;
        // console.log('emailBodyIn: ', emailBodyIn);     
        // console.log('remetenteIn: ', remetenteIn);      
        // console.log('assuntoIn: ', assuntoIn);
        // //console.log('isRead: ', isRead);

      } catch (err) {
        parms.message = 'Error retrieving messages';
        parms.error = { status: `${err.code}: ${err.message}` };
        parms.debug = JSON.stringify(err.body, null, 2);
        res.render('error', parms);
      }
      // //EMAIL BODY TO JSON      
      // parsedEmailIn = htmlToText.fromString(emailBodyIn); 
      // //parsedEmail = JSON.parse('{' + htmlToText.fromString(emailBody) + '}');     
      // parsedEmailIn.Remetente = remetenteIn; 
      // parsedEmailIn.Assunto = assuntoIn;       
      // console.log('parsedEmailIn: ', parsedEmailIn);               
      // //GRAVA REGISTROS NO BANCO -> ('isRead' == false)

    } else {
      // Redirect to home
      res.redirect('/');
    }
  });

module.exports = router;