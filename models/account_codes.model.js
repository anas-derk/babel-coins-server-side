const { accountVerificationCodesModel } = require("../models/all.models")

async function addNewAccountVerificationCode(email, code) {
    try{
        const accountVerificationCode = await accountVerificationCodesModel.findOne({ email });
        if (accountVerificationCode) {
            await accountVerificationCodesModel.updateOne({ email }, { code });
            return {
                msg: "Code Sending Again Process Successfully !!",
                error: false,
                data: {},
            }
        }
        const newAccountCode = new accountVerificationCodesModel({
            email,
            code,
        });
        await newAccountCode.save();
        return {
            msg: "Creating New Account Code Process Has Been Successfully !!",
            error: false,
            data: {},
        }
    }
    catch(err) {
        throw Error(err);
    }
}

async function isAccountVerificationCodeValid(email, code) {
    try{
        const accountVerificationCode = await accountVerificationCodesModel.findOne({ email });
        if (accountVerificationCode) {
            if (accountVerificationCode.code === code) {
                return {
                    msg: "This Code For This Email Is Valid !!",
                    error: false,
                    data: {},
                }
            }
            return {
                msg: "This Code For This Email Is Not Valid !!",
                error: true,
                data: {},
            }
        }
        return {
            msg: "Sorry, This User Is Not Found !!",
            error: true,
            data: {},
        }
    }
    catch(err) {
        throw Error(err);
    }
}

module.exports = {
    addNewAccountVerificationCode,
    isAccountVerificationCodeValid,
}