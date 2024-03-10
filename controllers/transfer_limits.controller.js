const { getResponseObject, checkIsExistValueForFieldsAndDataTypes } = require("../global/functions");

async function getTransferLimitsByCurrencyAndNetworkName(req, res) {
    try{
        const   currencyName = req.query.currencyName,
                network = req.query.network;
        const checkResult = checkIsExistValueForFieldsAndDataTypes([
            { fieldName: "Currency Name", fieldValue: currencyName, dataType: "string", isRequiredValue: true },
            { fieldName: "Network Name", fieldValue: network, dataType: "string", isRequiredValue: true },
        ]);
        if (checkResult.error) {
            await res.status(400).json(checkResult);
            return;
        }
        const { getTransferLimitsByCurrencyAndNetworkName } = require("../models/transfer_limits.model.js");
        await res.json(await getTransferLimitsByCurrencyAndNetworkName(currencyName, network));
    }
    catch(err) {
        await res.status(500).json(getResponseObject(err.message, true, {}));
    }
}

module.exports = {
    getTransferLimitsByCurrencyAndNetworkName,
}