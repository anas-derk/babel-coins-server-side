const { supportedCurrenciesByNetworksModel } = require("../models/all.models");

async function getAllSupportedCurrenciesByNetworks() {
    try{
        return {
            msg: "Get All Supported Currencies By Networks Process Has Been Successfully !!",
            error: false,
            data: await supportedCurrenciesByNetworksModel.find({})
        }
    }
    catch(err) {
        throw Error(err);
    }
}

module.exports = {
    getAllSupportedCurrenciesByNetworks,
}