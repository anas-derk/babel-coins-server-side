const { getResponseObject, checkIsExistValueForFieldsAndDataTypes } = require("../global/functions");

async function getMinimumDebositLimitsByCurrencyName(req, res) {
    try{
        const currencyName = req.query.currencyName;
        const checkResult = checkIsExistValueForFieldsAndDataTypes([
            { fieldName: "Currency Name", fieldValue: currencyName, dataType: "string", isRequiredValue: true },
        ]);
        if (checkResult.error) {
            await res.status(400).json(checkResult);
            return;
        }
        const { getMinimumDebositLimitsByCurrencyName } = require("../models/minimum_deposit_limits.model");
        await res.json(await getMinimumDebositLimitsByCurrencyName(currencyName));
    }
    catch(err) {
        await res.status(500).json(getResponseObject(err.message, true, {}));
    }
}

module.exports = {
    getMinimumDebositLimitsByCurrencyName,
}