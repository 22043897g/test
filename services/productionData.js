/**
 * Created with recorderModule
 * Author: ChrisChiu
 * Date: 2021/10/27
 * Desc:
 */

const config = require("../config");
let db = require("../db/connect");
const moment = require("moment");
const fs = require("fs");
const path = require("path");
const web3 = require("../web3/connect");
const tngateway = require("../utils/tngateway");

const sql_getProductionData = async (sensor, location_id, date) => {
    const startTimeStr = date;
    const endTimeStr = moment(date).add(1, "days").format("YYYY-MM-DD");
    const query = `SELECT TOP 1 location,location_id,sensor,amount,starttime FROM ${config.tableName} WHERE sensor = '${sensor}' AND location_id = '${location_id}' AND starttime between '${startTimeStr}' and '${endTimeStr}' ORDER BY starttime DESC`;
    console.log(query)
    db = await db.connect();
    const dbResult = await db.query(query);
    return dbResult;
}

//Upper chain
const onChain_addProductData = async (name, ...params) => new Promise(async (resolve, reject) => {

    let d = await tngateway.getData('get', `${config.tngateway.url}/contracts/abi`, { name });
    if (d.code === 0) d = d.result;
    else return reject('get abi failed.')

    const account = web3.eth.accounts.privateKeyToAccount(config.sender);   //sender Account's private key
    const contract = new web3.eth.Contract(d.abi, d.address);
    contract.handleRevert = true;

    console.log(`[Upper chain]:${params[0]} ${params}`);//合约函数调用参数
    //console.log("test2",params);   //合约函数调用参数
    const tx_builder = await contract.methods.setProductionData(params[0], params);
    const encoded_tx = tx_builder.encodeABI();

    const transactionObject = {
        gas: 5000000,
        data: encoded_tx,
        from: account.address,
        to: d.address
    };

    try {
        const signTx = await web3.eth.accounts.signTransaction(transactionObject, account.privateKey);
        //transaction
        const result = await web3.eth.sendSignedTransaction(signTx.rawTransaction);
        console.log(`status:${result.status}`);
        return resolve(result.status)
    } catch (e) {
        console.dir(e);
        return resolve(false)
    }


})



module.exports = {
    sql: { getProductionData: sql_getProductionData },
    onChain: { addProductData: onChain_addProductData }
}
