const PDFParser = require("pdf2json");
const excelToJson = require('convert-excel-to-json');

async function parseAnexos(emails) { 
    let parsedAnexos = await emails.filter(async (item) => {      
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
					  console.log('anexoPDF: ', anexo);				
					  
					//   fs.unlink(`./Anexos/${item.assunto}/${anexo.fileName}`, (err) => {
					// 	if (err) { console.error(err); return; }
					//   })

					  return await anexo;
					});									  				  				    
                }
      
                if (anexo.fileName.includes('.xls' || '.xlsx')) {                    					
					const result = excelToJson({ 
						sourceFile: `./Anexos/${item.assunto}/${anexo.fileName}`
					});

					anexo.fileContent = result.Plan1;
					
					// fs.unlink(`./Anexos/${item.assunto}/${anexo.fileName}`, (err) => {
					// 	if (err) { console.error(err); return; }
					// })

					console.log('anexoXLS: ', anexo);					
					return await anexo;
				}  
			});	                    
        }
    });   
    console.log('parsedAnexos: ', parsedAnexos);
    return parsedAnexos; 
}

module.exports = {parseAnexos}