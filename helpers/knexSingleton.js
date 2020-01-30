import * as knex from 'knex';
import { prototype } from 'events';

class KnexSingleton {

    conn;
    static instance;

    constructor(host, user, port, password, database) {
        
        this.conn = knex({
            client: 'mysql2',
            version: '5.7',
            connection: {
                host : host,
                user : user,
                port : port,
                password : password,
                database : database
            },
            debug: true,
            pool: {
                min: 0,
                max: 2,
                idleTimeoutMillis: 5000
            }
        });
    }

    static getInstance(host, user, port, password, database) {

        if (!KnexSingleton.instance) {

            KnexSingleton.instance = new KnexSingleton(host, user, port, password, database);
        }
        return KnexSingleton.instance;
    }
}

export { KnexSingleton }