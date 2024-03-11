// Import Deposits Model Object

const { depositsModel } = require("../models/all.models");

async function createNewDeposit(debositDetails) {
    try{
        const newDeposit = new depositsModel(debositDetails);
        await newDeposit.save();
        return {
            msg: "Creating New Deposit Process Has Been Successfully !!",
            error: false,
            data: {},
        };
    }
    catch(err) {
        throw Error(err);
    }
}

module.exports = {
    createNewDeposit,
}