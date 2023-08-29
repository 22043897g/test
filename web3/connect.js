/**
 * Created with recorderModule
 * Author: ChrisChiu
 * Date: 2021/9/28
 * Desc:
 */

const Web3 = require("web3");
const config = require("../config");

const web3 = new Web3(new Web3.providers.HttpProvider(config.nodeHTTP));

module.exports = web3
