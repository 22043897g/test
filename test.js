const productionData = require("./services/productionData");
const conf = require("./config");
const moment = require("moment");
const fs = require('fs');
const tngateway = require("./utils/tngateway");
const config = require("./config");
const web3 = require("./web3/connect");

const _getLeanWells = () => {
    const arr = [];
    for (let i = 0; i < conf.measurementPointAndWells.length; i++) {
        let v = conf.measurementPointAndWells[i];
        if (v.wells && v.wells.length > 0) {
            for (let j = 0; j < v.wells.length; j++) {
                arr.push(v.wells[j])
            }
        } else {
            arr.push(v);
        }
    }
    return arr;
}

const _getMp = (location_id) => {
    let rmp;
    for (let i = 0; i < conf.measurementPointAndWells.length; i++) {
        let v = conf.measurementPointAndWells[i];
        if (v.wells && v.wells.length > 0) {
            let mp = v;
            let exist = false;
            for (let j = 0; j < v.wells.length; j++) {
                if (v.wells[j].location_id === location_id) {
                    exist = true;
                }
            }
            if (exist) {
                rmp = mp;
            }
        }
    }
    return rmp;

}

const autoGetProduct = async (leanwells) => {
    let sendObj;
    let {oc_date} = getDate()

    for (const key in leanwells) {
        let v = leanwells[key];
        console.log(v)
        if(v.uniqueIdOIL != null){
            sendObj = await oilFun(v)
            if (sendObj) {
                console.log(`location_id: ${v.location_id} oilFun:${JSON.stringify(sendObj)}`);
                try {
                    await productionData.onChain.addProductData('OilData', sendObj.uniqueId, sendObj.reserve1, sendObj.owner, sendObj.amount, sendObj.reserve2, oc_date, sendObj.month, sendObj.reserve2);
                } catch (e) {
                    console.error(e);
                    continue
                }
            }
        }

        if(v.uniqueIdGAS != null){
            sendObj = await gasFun(v)
            if (sendObj) {
                console.log(`location_id: ${v.location_id} gasFun:${JSON.stringify(sendObj)}`);
                try {
                    await productionData.onChain.addProductData('GasData', sendObj.uniqueId, sendObj.reserve1, sendObj.owner, sendObj.amount, sendObj.reserve2, oc_date, sendObj.month, sendObj.reserve2);
                } catch (e) {
                    console.error(e);
                    continue
                }
            }
        }

    }
}

//Obtain oil production
async function oilFun(v) {
    let sendObj = null
    let {month, date, oc_date} = getDate()

    let result = await get0il(v.location_id, v.sensor.OIL, date)
    console.log(`Result of finding OIL:${JSON.stringify(result)}`);

    if (!result.recordset || result.recordset.length === 0) {
        console.log(`Binomial well`);
        sendObj = await getEmulsion(v)
    } else {
        if (Math.floor(result.recordset[0].amount) == 0) {
            appendToJsonFile(v)
        } else {
            console.log(`Direct return of ordinary wells`);
            sendObj = {
                uniqueId: v.uniqueIdOIL,
                reserve1: 0,
                owner: conf.recorderAccount.address,
                amount: Math.floor(result.recordset[0].amount * 10000),
                reserve2: 0,
                oc_date,
                month,
                reserve3: 0,
            }
        }
    }
    return sendObj
}

//Query Current Oil Volume
async function get0il(lid, sensor, date) {
    return await productionData.sql.getProductionData(sensor, lid, date);
}

//Oil production of a well
async function getEmulsion(v) {
    let sendObj = null
    let {month, date, oc_date} = getDate()

    let mp = _getMp(v.location_id);
    let data = await productionData.sql.getProductionData(v.sensor.OIL, v.location_id, date);
    console.log(`Result of querying for Embusion:${JSON.stringify(data)}`);

    if (!data || !data.recordset[0]) return sendObj

    let mpOilAmount = await productionData.sql.getProductionData(mp.sensor.OIL, mp.location_id, date);
    if (!mpOilAmount || !mpOilAmount.recordset[0]) return sendObj
    let mpWaterAmount = await productionData.sql.getProductionData(mp.sensor.WATER, mp.location_id, date);
    if (!mpWaterAmount || !mpOilAmount.recordset[0]) return sendObj

    let wellOilAmount = (data.recordset[0].amount / (mpOilAmount.recordset[0].amount + mpWaterAmount.recordset[0].amount) * mpOilAmount.recordset[0].amount) * 10000;
    console.log(`A:${data.recordset[0].amount} B:${mpOilAmount.recordset[0].amount} C:${mpWaterAmount.recordset[0].amount} Binomial well calculation results:${Math.floor(+wellOilAmount)}`);
    if (Math.floor(+wellOilAmount) != 0) {
        sendObj = {
            uniqueId: v.uniqueIdOIL,   //之前是conf.uniqueId
            reserve1: 0,
            owner: conf.recorderAccount.address,
            amount: Math.floor(+wellOilAmount),
            reserve2: 0,
            oc_date,
            month,
            reserve3: 0,
        }
    } else {
        appendToJsonFile(v)
    }

    return sendObj
}

//Obtain gas production
async function gasFun(v) {
    let sendObj = null
    let {month, date, oc_date} = getDate()

    let data2 = await productionData.sql.getProductionData(v.sensor.GAS, v.location_id, date);
    if (data2.recordset.length > 0 && Math.floor(data2.recordset[0].amount) != 0) {
        sendObj = {
            uniqueId: v.uniqueIdGAS,
            reserve1: 0,
            owner: conf.recorderAccount.address,
            amount: Math.floor(data2.recordset[0].amount * 10000),
            reserve2: 0,
            oc_date,
            month,
            reserve3: 0,
        }
    } else {
        appendToJsonFile(v)
    }
    return sendObj
}

//Acquisition Time
function getDate() {
    let month = moment().subtract(1, "days").format("YYMM");
    const day = moment().subtract(1, "days").format("DD");
    if (+day < 21) month = moment().subtract(1, "days").subtract(1, "month").format("YYMM");

    let date = moment().subtract(1, "days").format("YYYY-MM-DD");
    let oc_date = moment().subtract(1, "days").format("YYMMDD");
    // let month ='2304'
    // let date = '2023-04-18'
    // let oc_date = '230418'

    return {
        month, date, oc_date
    }
}


//Set the location with a yield of 0_ Write ID to file
function appendToJsonFile(appendString) {
    let filename = `${conf.rootPath}public/location_id.json`
    fs.readFile(filename, 'utf8', function (err, data) {
        if (err) throw err;
        let json = JSON.parse(data);
        json.push(appendString);
        fs.writeFileSync(filename, JSON.stringify(json))
    });
}

const getDataTest = async (name) => {
    let d = await tngateway.getData('get', `${config.tngateway.url}/contracts/abi`, { name });
    if (d.code === 0) d = d.result;
    else return reject('get abi failed.')

    const contract2 = new web3.eth.Contract(d.abi, d.address);
    contract2.handleRevert = true;
    if(name === 'GasData'){
        const result = await contract2.methods.getProductionData("0x544e69723937647569544a694f5469596a65416b570000000000000000000000",2308).call();
        console.log("GasData:",result);
    }
    if(name === 'OilData'){
        const result = await contract2.methods.getProductionData("0x6a593973356e634d6e6c536a644e4c4d3076304f570000000000000000000000",2308).call();
        console.log("OilData:",result);
    }
}

(async () => {
    const leanwells = _getLeanWells();
    console.log(leanwells)
    await autoGetProduct(leanwells)
    await getDataTest('GasData')
})()
