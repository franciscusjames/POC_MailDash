const express = require('express');
const router = express.Router();
const authHelper = require('../helpers/auth');
const graph = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch');
const htmlToText = require('html-to-text');
const Incident = require('../models/incident');

let emailBody;
let remetente;

/* GET /mail */
router.get('/', async function(req, res, next) {
    let parms = { title: 'Inbox', active: { inbox: true } };
  
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
  
      try {
        // Get the 10 newest messages from inbox
        const result = await client
        .api('/me/mailfolders/inbox/messages')
        .top(10)
        //.select('subject,from,receivedDateTime,isRead')
        .select('*')                                //--MyCode--//
        .orderby('receivedDateTime DESC')
        .get();            
        parms.messages = result.value;            
        res.render('mail', parms);
        
        emailBody = result.value[0].body.content;   //--MyCode--//  
        remetente = result.value[0].from.emailAddress.address;   //--MyCode--//        
        //console.log('emailBody: ', emailBody);      //--MyCode--//
        //console.log('remetente: ', remetente);      //--MyCode--// 

      } catch (err) {
        parms.message = 'Error retrieving messages';
        parms.error = { status: `${err.code}: ${err.message}` };
        parms.debug = JSON.stringify(err.body, null, 2);
        res.render('error', parms);
      }
      //EMAIL BODY TO JSON      
      //parsedEmail = htmlToText.fromString(emailBody); 
      parsedEmail = JSON.parse('{' + htmlToText.fromString(emailBody) + '}');     
      parsedEmail.Remetente = remetente; 
      console.log('parsedEmail: ', parsedEmail);         
      //console.log(typeof(text));
      //GRAVA EMAIL_INCIDENT NO BANCO: PRIMEIRO EMAIL DA LISTA 
      

    } else {
      // Redirect to home
      res.redirect('/');
    }
  });

module.exports = router;