/**
 * Created with recorderModule
 * Author: ChrisChiu
 * Date: 2021/9/28
 * Desc:
 */

const sql = require('mssql');
const config = require("../config").db;

module.exports = {
    connect: async () => {
        try {
            if(config.options.port) config.options.port = +config.options.port;
            const connect = await sql.connect(config);
            console.log("mssql connect success.");
            return connect;
        } catch (e) {
            console.error(e);
            console.error(`mssql connect failed`);
        }
    }
};


