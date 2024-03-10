const { transferLimitsModel } = require("../models/all.models");

async function getTransferLimitsByCurrencyAndNetworkName(currencyName, network) {
    try{
        const transaferLimitsDetails = await transferLimitsModel.findOne({ currencyName, network });
        if (transaferLimitsDetails) {
            return {
                msg: "Get Transfer Limits By Currency And Network Name Process Has Been Successfully !!",
                error: false,
                data: await transferLimitsModel.findOne({ currencyName, network })
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
    getTransferLimitsByCurrencyAndNetworkName,
}