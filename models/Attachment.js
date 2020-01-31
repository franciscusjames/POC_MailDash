import { isNullOrUndefined } from "util";

class Attachment {

    fileName;
    fileContent;

    constructor(fileName, fileContent) {
        this.fileName = fileName;
        this.fileContent = fileContent;

        this.validate();
    }

    validate() {
        if (isNullOrUndefined(this.fileName))    throw Error('fileName é obrigatório.')
        if (isNullOrUndefined(this.fileContent)) throw Error('fileContent é obrigatório.')
    }

}