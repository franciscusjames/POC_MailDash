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
                    let pdfParser = new PDFParser(this, 1);

                    pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));

                    await pdfParser.on("pdfParser_dataReady", async pdfData => {
                        await fs.writeFileSync(`./Anexos/${item.assunto.replace(':', '')}/${anexo.fileName.replace('.pdf' || '.PDF', '.txt')}`,
                            pdfParser.getRawTextContent().split('-')[0]);
                    });

                    await pdfParser.loadPDF(filePath);

                    // anexo.fileContent = JSON.parse('{' + fs.readFileSync(`./Anexos/${item.assunto.replace(':', '')}/${anexo.fileName.replace('.pdf' || '.PDF', '.txt')}`) + '}');
                    // console.log('fileContent: ', anexo);

                }


                if (anexo.fileName.includes('.xls' || '.xlsx')) {
                    let filePath = `./Anexos/${item.assunto.replace(':', '')}/${anexo.fileName}`;

                    const result = excelToJson({
                        sourceFile: filePath
                    });

                    anexo.fileContent = result.Plan1;
                }

            });
        }
    });
    return Promise.all(parsedAnexos);
}


async function pdfToText(emailList) {
    let finalEmailList = await emailList.filter(async email => {
        if (email.hasAttachments) {

            await email.attachments.filter(async anexo => {
                if (anexo.fileName.includes('.pdf' || '.PDF')) {
                    anexo.fileContent = JSON.parse('{' + fs.readFileSync(`./Anexos/${email.assunto.replace(':', '')}/${anexo.fileName.replace('.pdf' || '.PDF', '.txt')}`) + '}');
                    //console.log('fileContent: ', anexo);
                }
            })
        }
    });
    return Promise.all(finalEmailList);
}


async function deleteAnexosFolders(emailList) {
    console.log('emailsList:',emailList)
    await emailList.forEach(async email => {
        if (email.hasAttachments) {

            await email.attachments.filter(async anexo => {
                
                if (anexo.fileName.includes('.pdf' || '.PDF')) {
                    console.log('entrou para exclusão do pdf')
                    console.log(email.assunto)
                    console.log(anexo.fileName)
                    await fs.unlinkSync(process.cwd()+`/Anexos/${email.assunto.replace(':', '')}/${anexo.fileName.replace('.pdf' || '.PDF', '.txt')}`, (err) => {
                        if (err) { console.error(`Erro ao deletar anexo '${anexo.fileName.replace('.pdf' || '.PDF', '.txt')}' : `, err); return; }
                    }); console.log(`DELETOU '${anexo.fileName.replace('.pdf' || '.PDF', '.txt')}'`)
                    await fs.unlinkSync(process.cwd()+`/Anexos/${email.assunto.replace(':', '')}/${anexo.fileName}`, (err) => {
                        if (err) { console.error(`Erro ao deletar anexo '${anexo.fileName}' : `, err); return; }
                    }); console.log(`DELETOU '${anexo.fileName}'`)
                } else {
                    console.log('entrou para exclusão do excel')
                    await fs.unlinkSync(process.cwd()+`/Anexos/${email.assunto.replace(':', '')}/${anexo.fileName}`, (err) => {
                        if (err) { console.error(`Erro ao deletar anexo '${anexo.fileName}' : `, err); return; }
                    }); console.log(`DELETOU '${anexo.fileName}'`)
                }
            });


            await fs.rmdir(process.cwd()+`/Anexos/${email.assunto.replace(':', '')}`, (err) => {
                console.log(`DELETANDO FOLDER '${email.assunto.replace(':', '')}'`)
                if (err) { console.error('Erro ao deletar diretório de anexos: ', err); return; }
            });
        }
    });
}


module.exports = { parseAnexos, deleteAnexosFolders, pdfToText }