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
    emailList.forEach(async email => {
        if (email.hasAttachments) {

            await email.attachments.forEach(async anexo => {
                if (anexo.fileName.includes('.pdf' || '.PDF')) {
                    try {
                        await fs.unlinkSync(`./Anexos/${email.assunto.replace(':', '')}/${anexo.fileName.replace('.pdf' || '.PDF', '.txt')}`);
                    } catch (err) {
                        console.error(`Erro ao deletar anexo '${anexo.fileName.replace('.pdf' || '.PDF', '.txt')}' : `, err);
                    }; console.log(`DELETOU '${anexo.fileName.replace('.pdf' || '.PDF', '.txt')}'`);
                    try {
                        await fs.unlinkSync(`./Anexos/${email.assunto.replace(':', '')}/${anexo.fileName}`);
                    } catch (err) {
                        console.error(`Erro ao deletar anexo '${anexo.fileName}' : `, err);
                    }; console.log(`DELETOU '${anexo.fileName}'`);
                } else {
                    try {
                        await fs.unlinkSync(`./Anexos/${email.assunto.replace(':', '')}/${anexo.fileName}`);
                    } catch (err) {
                        console.error(`Erro ao deletar anexo '${anexo.fileName}' : `, err);
                    }; console.log(`DELETOU '${anexo.fileName}'`);
                }
            });

            try {
                await fs.rmdirSync(`./Anexos/${email.assunto.replace(':', '')}`);
                console.log(`DELETANDO FOLDER '${email.assunto.replace(':', '')}'`);
            } catch (err) {
                console.error('Erro ao deletar diretório de anexos: ', err);
            }

        }
    });
}


module.exports = { parseAnexos, deleteAnexosFolders, pdfToText }