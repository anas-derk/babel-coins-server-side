// Import Tranafers Model Object

const { transfersModel } = require("../models/all.models");

async function createNewTransfer(transferDetails) {
    try{
        const newTransfer = new transfersModel(transferDetails);
        const transfer = await newTransfer.save();
        return {
            msg: "Creating New Transfer Process Has Been Successfully !!",
            error: false,
            data: transfer,
        };
    }
    catch(err) {
        throw Error(err);
    }
}

module.exports = {
    createNewTransfer,
}