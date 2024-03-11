const { transferFeesModel } = require("../models/all.models");

async function getfeeByTransferInfo(transferInfo) {
    try{
        const transferFeeDetails = await transferFeesModel.findOne(transferInfo);
        if (transferFeeDetails) {
            return {
                msg: "Get Transfer Fee By Transfer Info Process Has Been Successfully !!",
                error: false,
                data: transferFeeDetails,
            }
        }
        return {
            msg: "Sorry, Transfer Fee Is Not Exist !!",
            error: true,
            data: {}
        }
    }
    catch(err) {
        throw Error(err);
    }
}

module.exports = {
    getfeeByTransferInfo,
}