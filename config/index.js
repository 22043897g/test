/**
 * Created with recorderModule
 * Author: ChrisChiu
 * Date: 2021/9/28
 * Desc:
 */
require('dotenv').config();
const mpconfig = require("./mp");
const path = require('path')

module.exports = {
    db: {
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_DBNAME,
        server: process.env.DATABASE_SERVER,
        options: {
            trustServerCertificate: true,
            port: process.env.DATABASE_PORT,
        }
    },
    tableName: process.env.DATABASE_TABLE,
    nodeHTTP: process.env.EVM_ENDPOINT,
    recorderAccount: {
        address: process.env.RECORDER
    },
    tngateway: {
        access_token_url: process.env.TNGATEWAY_ACCESS_TOKEN_URL,
        clientId: process.env.TNGATEWAY_CLIENT_ID,
        clientSecret: process.env.TNGATEWAY_CLIENT_SECRET,
        scope: process.env.TNGATEWAY_SCOPE,
        url: process.env.TNGATEWAY_API_URL
    },
    rootPath: path.join(__dirname, '../'),
    measurementPointAndWells: mpconfig,
    owner: process.env.OWNER,
    sender: process.env.SENDER,
    beforeDawn: '0 0 0 * * ?',       //每天凌晨执行一次
    noon: '0 0 12 * * ?',            //每天中午12点执行一次
}
