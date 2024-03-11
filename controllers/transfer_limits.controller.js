const { getResponseObject, checkIsExistValueForFieldsAndDataTypes } = require("../global/functions");

async function getTransferLimitsByTransferInfo(req, res) {
    try{
        const   transferType = req.query.transferType,
                transferCurrencyType = req.query.transferCurrencyType,
                currencyName = req.query.currencyName,
                network = req.query.network;
        const checkResult = checkIsExistValueForFieldsAndDataTypes([
            { fieldName: "Transfer Type", fieldValue: transferType, dataType: "string", isRequiredValue: true },
            { fieldName: "Transfer Currency Type", fieldValue: transferCurrencyType, dataType: "string", isRequiredValue: true },
            { fieldName: "Currency Name", fieldValue: currencyName, dataType: "string", isRequiredValue: true },
        ]);
        if (checkResult.error) {
            await res.status(400).json(checkResult);
            return;
        }
        if(transferType !== "internal" && transferType !== "external") {
            await res.status(400).json(getResponseObject("Invalid Request, Please Send Valid Transfer Type !!", true, {}));
            return;
        }
        if(transferCurrencyType !== "fiat" && transferCurrencyType !== "crypto") {
            await res.status(400).json(getResponseObject("Invalid Request, Please Send Valid Transfer Currency Type !!", true, {}));
            return;
        }
        if(transferCurrencyType === "crypto" && !network){
            await res.status(400).json(getResponseObject("Invalid Request, Please Send Network Name !!", true, {}));
            return;
        }
        const { getTransferLimitsByTransferInfo } = require("../models/transfer_limits.model.js");
        await res.json(await getTransferLimitsByTransferInfo(
            transferCurrencyType === "crypto" ?
                { transferType, transferCurrencyType, currencyName, network } : { transferType, transferCurrencyType, currencyName }
        ));
    }
    catch(err) {
        await res.status(500).json(getResponseObject(err.message, true, {}));
    }
}

module.exports = {
    getTransferLimitsByTransferInfo,
}