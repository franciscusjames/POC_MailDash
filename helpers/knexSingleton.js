const knex = require('knex');

class KnexSingleton {

    conn;
    static instance;

    constructor() {
        
        this.conn = knex({
            client: 'mysql2',
            version: '5.7',
            connection: {
                host : 'poc-database.ckuyozcu3sos.us-east-1.rds.amazonaws.com',
                user : 'admin',
                port : 3306,
                password : 'password01',
                database : 'poc_example'
            },
            debug: true,
            pool: {
                min: 0,
                max: 2,
                idleTimeoutMillis: 5000
            }
        });
    }

    static getInstance() {

        if (!KnexSingleton.instance) {

            KnexSingleton.instance = new KnexSingleton();
        }
        return KnexSingleton.instance;
    }
}

module.exports = KnexSingleton;
