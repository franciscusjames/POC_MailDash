const KnexSingleton = require('./KnexSingleton');

class Persistence {
    connection;
    constructor () {
        this.connection = KnexSingleton.getInstance().conn;
    }

    insertEmail = async (email) => {
        await this.connection('emails')
            .insert(email);
    }

}

module.exports = Persistence;