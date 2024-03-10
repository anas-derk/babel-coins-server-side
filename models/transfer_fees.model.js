const { transferFeesModel } = require("../models/all.models");

async function getFeeByCurrencyAndNetworkName(currencyName, network) {
    try{
        const transactionFeeDetails = await transferFeesModel.findOne({ currencyName, network });
        if (transactionFeeDetails) {
            return {
                msg: "Get Transaction Fee By Currency And Network Name Process Has Been Successfully !!",
                error: false,
                data: await transferFeesModel.findOne({ currencyName, network })
            }
        }
        return {
            msg: "Sorry, Currency Name Or Network Name Is Not Exist !!",
            error: true,
            data: {}
        }
    }
    catch(err) {
        throw Error(err);
    }
}

module.exports = {
    getFeeByCurrencyAndNetworkName,
}