const PDFParser = require("pdf2json");
const excelToJson = require('convert-excel-to-json');
const fs = require('fs-extra');


async function parseAnexos(emails) {    
    let parsedAnexos = await emails.filter(async (item) => {           
        if (!item.hasAttachments) {          
			return item;
		} else {
            await item.attachments.filter(async (anexo) => {                
                if (anexo.fileName.includes('.pdf' || '.PDF')) {                  
                    let filePath = `./Anexos/${item.assunto.replace(':', '')}/${anexo.fileName}`;
                    let pdfParser = new PDFParser(this,1);
                    
                    pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError) );	

					await pdfParser.on("pdfParser_dataReady", async pdfData => {              					                          
                        fs.writeFileSync(`./Anexos/${item.assunto.replace(':', '')}/${anexo.fileName.replace('.pdf' || '.PDF', '.txt')}`, 
                                         pdfParser.getRawTextContent().split('-')[0]);

                        // fs.unlinkSync(filePath, (err) => {
                        //     if (err) { console.error(`Erro ao deletar anexo '${anexo.fileName}' : `, err); return; }
                        // });                        
                    });						                                        

                    await pdfParser.loadPDF(filePath);
                    
                    anexo.fileContent = JSON.parse('{' + fs.readFileSync(`./Anexos/${item.assunto.replace(':', '')}/${anexo.fileName.replace('.pdf' || '.PDF', '.txt')}`) + '}');
                    console.log('fileContent: ', anexo);
                } 
   

                if (anexo.fileName.includes('.xls' || '.xlsx')) { 
                    let filePath = `./Anexos/${item.assunto.replace(':', '')}/${anexo.fileName}`;
                    
					const result = excelToJson({ 
						sourceFile: filePath
                    });
                    
                    anexo.fileContent = result.Plan1;					
                    
                    // fs.unlinkSync(filePath, (err) => {
                    //     if (err) { console.error(`Erro ao deletar anexo '${anexo.fileName}' : `, err); return; }
                    // });                    
                }  

			});	                    
        }
    });      
    return Promise.all(parsedAnexos); 
}


async function deleteAnexosFolders(emailList) {
    emailList.forEach( async email => {        
        if (email.hasAttachments) {

            await email.attachments.forEach(async anexo => {
                if (anexo.fileName.includes('.pdf' || '.PDF')) {
                    await fs.unlinkSync(`./Anexos/${email.assunto.replace(':', '')}/${anexo.fileName.replace('.pdf' || '.PDF', '.txt')}`, (err) => {
                        if (err) { console.error(`Erro ao deletar anexo '${anexo.fileName.replace('.pdf' || '.PDF', '.txt')}' : `, err); return ;}                        
                    });     console.log('DELETOU TXT')
                    await fs.unlinkSync(`./Anexos/${email.assunto.replace(':', '')}/${anexo.fileName}`, (err) => {
                        if (err) { console.error(`Erro ao deletar anexo '${anexo.fileName}' : `, err); return; }                    
                    });     console.log('DELETOU PDF')
                } else {
                    await fs.unlinkSync(`./Anexos/${email.assunto.replace(':', '')}/${anexo.fileName}`, (err) => {
                        if (err) { console.error(`Erro ao deletar anexo '${anexo.fileName}' : `, err); return; }                    
                    });     console.log('DELETOU XLS')
                }
            });
            

            await fs.rmdir(`./Anexos/${email.assunto.replace(':', '')}`, (err) => {
                console.log('DELETANDO FOLDER')
                if (err) { console.error('Erro ao deletar diretório de anexos: ', err); return; }
            });
        }                
    });
}


module.exports = {parseAnexos, deleteAnexosFolders}