const PDFParser = require("pdf2json");
const excelToJson = require('convert-excel-to-json');
const fs = require('fs-extra');

async function parseAnexos(emails) {
    console.log(emails) 
    let parsedAnexos = await emails.filter(async (item) => {
        console.log(item)      
        if (!item.hasAttachments) {          
			return item;
		} else {
            await item.attachments.filter(async (anexo) => {                
                if (anexo.fileName.includes('.pdf' || '.PDF')) {                  
                    let pdfParser = new PDFParser(this,1);
	  
				    pdfParser.loadPDF(`./Anexos/${item.assunto}/${anexo.fileName}`);

                    pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError) );
					
					pdfParser.on("pdfParser_dataReady", async pdfData => {              					  
                      let output = JSON.parse('{' + pdfParser.getRawTextContent().split('-')[0] + '}');					  
					  anexo.fileContent = output;
					  return await anexo;
					});									  				  				    
                }
                
   

                if (anexo.fileName.includes('.xls' || '.xlsx')) {                    					
					const result = excelToJson({ 
						sourceFile: `./Anexos/${item.assunto}/${anexo.fileName}`
					});
					anexo.fileContent = result.Plan1;					
					return await anexo;
                }  

			});	                    
        }
    });  

    return parsedAnexos; 
}

async function deleteDir(assunto) {
    fs.unlink(`./Anexos/${assunto}`, (err) => {
        if (err) { console.error(err); return; }
    }) 
}
module.exports = {parseAnexos,deleteDir}