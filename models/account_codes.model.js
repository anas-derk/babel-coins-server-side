const { accountVerificationCodesModel } = require("../models/all.models");

async function addNewAccountVerificationCode(email, code) {
    try{
        const accountVerificationCode = await accountVerificationCodesModel.findOne({ email });
        if (accountVerificationCode) {
            const creatingDate = new Date(Date.now());
            await accountVerificationCodesModel.updateOne({ email },
                {
                    code,
                    requestTimeCount: accountVerificationCode.requestTimeCount + 1,
                    createdDate: creatingDate,
                    expirationDate: new Date(creatingDate.getTime() + 24 * 60 * 60 * 1000),
                }
            );
            return {
                msg: "Code Sending Again Process Successfully !!",
                error: false,
                data: {},
            }
        }
        const creatingDate = new Date(Date.now());
        const newAccountCode = new accountVerificationCodesModel({
            email,
            code,
            createdDate: creatingDate,
            expirationDate: new Date(creatingDate.getTime() + 24 * 60 * 60 * 1000),
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

async function isBlockingFromReceiveTheCodeAndReceiveBlockingExpirationDate(email) {
    try{
        const accountVerificationCode = await accountVerificationCodesModel.findOne({ email });
        if (accountVerificationCode) {
            if (accountVerificationCode.isBlockingFromReceiveTheCode) {
                return {
                    msg: "Sorry, This Email Has Been Blocked From Receiving Code Messages For 24 Hours Due To Exceeding The Maximum Number Of Resend Attempts !!",
                    error: true,
                    data: {
                        receiveBlockingExpirationDate: accountVerificationCode.receiveBlockingExpirationDate,
                    },
                }
            }
        }
        return {
            msg: "Sorry, There Is No Code For This Email !!",
            error: false,
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
    isBlockingFromReceiveTheCodeAndReceiveBlockingExpirationDate,
}