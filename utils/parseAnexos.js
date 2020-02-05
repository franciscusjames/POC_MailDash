const PDFParser = require("pdf2json");
const excelToJson = require('convert-excel-to-json');
const fs = require('fs-extra');

async function parseAnexos(emails) {    
    let parsedAnexos = await emails.filter(async (item) => {           
        if (!item.hasAttachments) {          
			return item;
		} else {
            await Promise.resolve(item.attachments.filter(async (anexo) => {                
                if (anexo.fileName.includes('.pdf' || '.PDF')) {                  
                    let filePath = `./Anexos/${item.assunto}/${anexo.fileName}`;
                    let pdfParser = new PDFParser(this,1);
	  				    
                    pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError) );	

					pdfParser.on("pdfParser_dataReady", async pdfData => {              					  
                        let output = JSON.parse('{' + pdfParser.getRawTextContent().split('-')[0] + '}');					  
                        
                        anexo.fileContent = output;
                            
                        console.log('FILECONTENT: ', anexo)

                        fs.unlinkSync(filePath, (err) => {
                            if (err) { console.error(`Erro ao deletar anexo '${anexo.fileName}' : `, err); return; }
                        });
                        //return await anexo;
                    });						
                    
                    await pdfParser.loadPDF(filePath);
                }                
   

                if (anexo.fileName.includes('.xls' || '.xlsx')) { 
                    let filePath = `./Anexos/${item.assunto}/${anexo.fileName}`;
                    
					const result = excelToJson({ 
						sourceFile: filePath
                    });
                    
                    anexo.fileContent = result.Plan1;					
                    
                    fs.unlinkSync(filePath, (err) => {
                        if (err) { console.error(`Erro ao deletar anexo '${anexo.fileName}' : `, err); return; }
                    });
                    //return await anexo;                    
                }  

			}));	                    
        }
    });  
    console.log('parsedAnexos: ', parsedAnexos[0].attachments)
    return Promise.all(parsedAnexos); 
}


async function deleteDir(emailList) {
    emailList.forEach( async email => {
        
        await fs.rmdir(`./Anexos/${email.assunto}`, (err) => {
            if (err) { console.error('Erro ao deletar diretório de anexos: ', err); return; }
        });
        
    });
}


module.exports = {parseAnexos,deleteDir}