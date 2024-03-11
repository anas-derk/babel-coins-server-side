const { transferLimitsModel } = require("../models/all.models");

async function get_transfer_limits_by_currency_name_and_tranasfer_type(transferInfo) {
    try{
        const transaferLimitsDetails = await transferLimitsModel.findOne(transferInfo);
        if (transaferLimitsDetails) {
            return {
                msg: "Get Transfer Limits By Currency Name And Transfer Type Process Has Been Successfully !!",
                error: false,
                data: await transferLimitsModel.findOne(transferInfo)
            }
        }
        return {
            msg: "Sorry, Currency Name Or Network Name Or Transfer Type Is Not Exist !!",
            error: true,
            data: {}
        }
    }
    catch(err) {
        throw Error(err);
    }
}

module.exports = {
    get_transfer_limits_by_currency_name_and_tranasfer_type,
}