const { transferLimitsModel } = require("../models/all.models");

async function getTransferLimitsByTransferInfo(transferInfo) {
    try{
        const transaferLimitsDetails = await transferLimitsModel.findOne(transferInfo);
        if (transaferLimitsDetails) {
            return {
                msg: "Get Transfer Limits By Transfer Info Process Has Been Successfully !!",
                error: false,
                data: await transferLimitsModel.findOne(transferInfo)
            }
        }
        return {
            msg: "Sorry, Transfer Limits Is Not Exist !!",
            error: true,
            data: {}
        }
    }
    catch(err) {
        throw Error(err);
    }
}

module.exports = {
    getTransferLimitsByTransferInfo,
}