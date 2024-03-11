const { getResponseObject, checkIsExistValueForFieldsAndDataTypes } = require("../global/functions");

async function get_transfer_limits_by_currency_name_and_tranasfer_type(req, res) {
    try{
        const   currencyName = req.query.currencyName,
                transferType = req.query.transferType,
                network = req.query.network;
        const checkResult = checkIsExistValueForFieldsAndDataTypes([
            { fieldName: "Currency Name", fieldValue: currencyName, dataType: "string", isRequiredValue: true },
            { fieldName: "Transfer Type", fieldValue: transferType, dataType: "string", isRequiredValue: true },
        ]);
        if (checkResult.error) {
            await res.status(400).json(checkResult);
            return;
        }
        if(transferType !== "fiat" && transferType !== "crypto") {
            await res.status(400).json(getResponseObject("Invalid Request, Please Send Valid Transfer Type !!", true, {}));
            return;
        }
        if(transferType === "crypto" && !network){
            await res.status(400).json(getResponseObject("Invalid Request, Please Send Network Name !!", true, {}));
            return;
        }
        const { get_transfer_limits_by_currency_name_and_tranasfer_type } = require("../models/transfer_limits.model.js");
        await res.json(await get_transfer_limits_by_currency_name_and_tranasfer_type(
            transferType === "crypto" ? { currencyName, transferType, network } : { currencyName, transferType }
        ));
    }
    catch(err) {
        await res.status(500).json(getResponseObject(err.message, true, {}));
    }
}

module.exports = {
    get_transfer_limits_by_currency_name_and_tranasfer_type,
}