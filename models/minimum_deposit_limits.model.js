// Import Minimum Deposit Limits Model Object

const { minimumDepositLimitsModel } = require("../models/all.models");

async function getMinimumDebositLimitsByCurrencyName(currencyName) {
    try{
        const minimumDebositLimitsByCurrencyName = await minimumDepositLimitsModel.find({ currencyName });
        if (minimumDebositLimitsByCurrencyName.length > 0) {
            return {
                msg: `Get Minimum Debosit Limits By Currency Name: ${currencyName} Process Has Been Successfully !!`,
                error: false,
                data: minimumDebositLimitsByCurrencyName,
            };
        }
        return {
            msg: "Sorry This Currecny Name Is Not Exist !!",
            error: true,
            data: [],
        };
    }
    catch(err) {
        throw Error(err);
    }
}

module.exports = {
    getMinimumDebositLimitsByCurrencyName,
}