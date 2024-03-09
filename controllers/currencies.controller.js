const { getResponseObject } = require("../global/functions");

async function getAllSupportedCurrenciesByNetworks(req, res) {
    try{
        const { getAllSupportedCurrenciesByNetworks } = require("../models/currencies.model.js");
        await res.json(await getAllSupportedCurrenciesByNetworks());
    }
    catch(err) {
        await res.status(500).json(getResponseObject(err.message, true, {}));
    }
}

module.exports = {
    getAllSupportedCurrenciesByNetworks,
}