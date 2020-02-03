const express = require('express');
const router = express.Router();
const authHelper = require('../helpers/auth');
const graph = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch');
const htmlToText = require('html-to-text');
const controller = require('../controller/email.controller');
const fs = require('fs-extra');
const PDFParser = require("pdf2json");

let client, emailsTratados;
let dateTimeParm = '2020-02-03T17:30:00Z';

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
  let formatList = emails.map((item) => {
      let textBody = htmlToText.fromString(item.emailBody)  
      //remover email antigo, tratamento será de um a um
      //console.log('textBody: ',textBody )      
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
  return formatList;
}

async function getAnexos(emails) {
  let anexos =  emails.map(async (item) => {   
      if (item.hasAttachments) {          
          try { 
            const dir = `./Anexos/${item.assunto}`;
            fs.ensureDirSync(dir);
            
            const res = await client
            .api(`/me/messages/${item.emailId}/attachments/`)
            .get();   

            let attach = res.value;
            attach.map((anexo) => {
                fs.writeFileSync(`${dir}/${anexo.name}`, anexo.contentBytes, {encoding: 'base64'})
                //item.attachments.push({fileName:anexo.name, fileContent: anexo.contentBytes});                  
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

async function parseAnexos(emails) { 
  let parsedAnexos = await emails.map(async (item) => {      
      if (item.hasAttachments) {
          let isPdF = item.attachments[0].fileName.includes('.pdf');
          let isExcel = item.attachments[0].fileName.includes('.xls' || '.xlsx');
          console.log('isPDF: ', isPdF)
          if (isPdF) {
            console.log('entrou PDF!')
            let pdfParser = new PDFParser();
            let fileContent = item.attachments[0].fileContent;

            //fs.writeFileSync(`${item.attachments[0].fileName}`, item.attachments[0].fileContent, {encoding: 'base64'})
            //console.log('PDF: ', pdf)

            pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError) );
            pdfParser.on("pdfParser_dataReady", pdfData => {              
                let output = res.json('{' + pdfParser.getRawTextContent() + '}');
                console.log('PDF2JSON_OUTPUT: ', output);
            });

            pdfParser.loadPDF(`./Anexos/${item.assunto}/${item.attachments}`);
            return item;
          }

          if (isExcel) {
            console.log('CAIU NO XLS...');
            return item;
           }                      

      } else {
        return item;
      }
  });   
  return Promise.all(parsedAnexos); 
}


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
        .api(`/me/mailfolders/inbox/messages`)
        .top(1)
        //.select('subject,from,receivedDateTime,isRead')
        .select('*')                                       
        .orderby('receivedDateTime DESC')
        //.filter(`receivedDateTime ge ${dateTimeParm}`) //traz a partir dessa data/hora
        .get();            
        parms.messages = result.value;            
        res.render('mail', parms);                        
        //console.log('result.value: ', result.value);

        //FILTRA DADOS DO EMAIL QUE SERAO UTILIZADOS
        await tratarEmails(result.value);  
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
      let attachedEmailList =  await getAnexos(emailsFormatados); 
      //console.log('attachedEmailList: ', attachedEmailList);   

      //PEGA ANEXOS DOS EMAILS, SE HOUVER
      //let finalEmailList = await parseAnexos(attachedEmailList); 
      //console.log('finalEmailList: ', finalEmailList);   

      //GRAVA LISTA DE EMAILS NO BANCO      
      //await controller.save(finalEmailList)      

    } else {
      // Redirect to home
      res.redirect('/');
    }
});

module.exports = router;
