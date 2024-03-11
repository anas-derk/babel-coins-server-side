const { transferFeesModel } = require("../models/all.models");

async function get_fee_by_currency_name_and_tranasfer_type(transferInfo) {
    try{
        const transferFeeDetails = await transferFeesModel.findOne(transferInfo);
        if (transferFeeDetails) {
            return {
                msg: "Get Transfer Fee By Currency Name And Transfer Type Process Has Been Successfully !!",
                error: false,
                data: await transferFeesModel.findOne(transferInfo),
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
    get_fee_by_currency_name_and_tranasfer_type,
}