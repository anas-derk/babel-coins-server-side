async function getUserLogin(req, res) {
    try{
        const   email = req.query.email,
                password = req.query.password;
        // Start Handle Email Value To Check It Before Save In DB
        const { isEmail } = require("../global/functions");
        // Check If Email And Password Are Exist
        if (email.length > 0 && password.length > 0) {
            // Check If Email Valid
            if (isEmail(email)) {
                const { login } = require("../models/users.model");
                const result = await login(email.toLowerCase(), password);
                await res.json(result);
            } else {
                // Return Error Msg If Email Is Not Valid
                await res.status(400).json("Error, This Is Not Email Valid !!");
            }
        } else {
            await res.status(400).json("Error, Please Enter Email And Password Or Rest Input !!");
        }
    }
    catch(err) {
        await res.status(500).json(err);
    }
}

async function getAllAccounts(req, res) {
    try{
        const userId = req.params.userId;
        if (!userId) await res.status(400).json("Please Send User Id !!");
        else {
            const { getAllAccountsForUser } = require("../models/users.model");
            await res.json(await getAllAccountsForUser(userId));
        }
    }
    catch(err) {
        await res.status(500).json(err);
    }
}

async function postCreateUserAccount(req, res) {
    try{
        const email = req.body.email;
        // Start Handle Email Value To Check It Before Save In DB
        const { isEmail } = require("../global/functions");
        // Check If Email, Password And Country Are Exist
        if (email.length > 0) {
            // Check If Email Valid
            if (isEmail(email)) {
                const { createNewUser } = require("../models/users.model");
                const result = await createNewUser(email.toLowerCase());
                await res.json(result);
            }
            else {
                // Return Error Msg If Email Is Not Valid
                await res.status(400).json("Error, This Is Not Email Valid !!");
            }
        } else {
            await res.status(400).json("Error, Please Send The Email !!");
        }
    }
    catch(err) {
        await res.status(500).json(err);
    }
}

async function putUpdateUserData(req, res) {
    try{
        const { updateUserData } = require("../models/users.model");
    }
    catch(err) {
        await res.status(500).json(err);
    }
}

async function postSendMoney(req, res) {
    try{
        const transactionData = req.body;
        const userId = req.params.userId;
        if (!userId){
            await res.status(400).json("Please Send User Id !!");
            return;
        }
        if (!transactionData.network) {
            await res.status(400).json("Please Send Network Name !!");
            return;
        }
        if (!transactionData.currency) {
            await res.status(400).json("Please Send Currency Name !!");
            return;
        }
        if (!transactionData.receipentAddress) {
            await res.status(400).json("Please Send Receipent Address !!");
            return;
        }
        if (!transactionData.amount) {
            await res.status(400).json("Please Send Amount !!");
            return;
        }
        switch(transactionData.network) {
            case "TRON": {
                switch (transactionData.currency) {
                    case "TRX": {
                        if (transactionData.amount < 30) {
                            await res.status(400).json("Please Send Amount Greater Than Or Equual 30 TRX !!");
                            return;
                        }
                        break;
                    }
                    case "USDT": {
                        if (transactionData.amount < 10) {
                            await res.status(400).json("Please Send Amount Greater Than Or Equual 10 USDT !!");
                            return;
                        }
                        break;
                    }
                    default: {
                        await res.status(400).json(`Please Send Valid Currency Name For ${transactionData.network} Network !!`);
                        return;
                    }
                }
                break;
            }
            case "ETHEREUM": {
                switch (transactionData.currency) {
                    case "ETHER": {
                        if (transactionData.amount < 0.02) {
                            await res.status(400).json("Please Send Amount Greater Than Or Equual 0.02 ETHER !!");
                            return;
                        }
                        break;
                    }
                    case "USDT": {
                        if (transactionData.amount < 5) {
                            await res.status(400).json("Please Send Amount Greater Than Or Equual 5 USDT !!");
                            return;
                        }
                        break;
                    }
                    default: {
                        await res.status(400).json(`Please Send Valid Currency Name For ${transactionData.network} Network !!`);
                        return;
                    }
                }
                break;
            }
            case "POLYGON": {
                switch (transactionData.currency) {
                    case "MATIC": {
                        if (transactionData.amount < 0.11) {
                            await res.status(400).json("Please Send Amount Greater Than Or Equual 0.11 MATIC !!");
                            return;
                        }
                        break;
                    }
                    case "USDT": {
                        if (transactionData.amount < 10) {
                            await res.status(400).json("Please Send Amount Greater Than Or Equual 10 USDT !!");
                            return;
                        }
                        break;
                    }
                    default: {
                        await res.status(400).json(`Please Send Valid Currency Name For ${transactionData.network} Network !!`);
                        return;
                    }
                }
                break;
            }
            case "BSC": {
                switch (transactionData.currency) {
                    case "BNB": {
                        if (transactionData.amount < 0.01) {
                            await res.status(400).json("Please Send Amount Greater Than Or Equual 0.01 BNB !!");
                            return;
                        }
                        break;
                    }
                    case "USDT": {
                        if (transactionData.amount < 0.3) {
                            await res.status(400).json("Please Send Amount Greater Than Or Equual 0.3 USDT !!");
                            return;
                        }
                        break;
                    }
                    default: {
                        await res.status(400).json(`Please Send Valid Currency Name For ${transactionData.network} Network !!`);
                        return;
                    }
                }
                break;
            }
            default: {
                await res.status(400).json("Please Send Valid Network Name !!");
                return;
            }
        }
        const { sendMoney } = require("../models/users.model");
        const result = await sendMoney(userId, transactionData);
        await res.json(result);
    }
    catch(err) {
        await res.status(500).json(err);
    }
}

module.exports = {
    getUserLogin,
    getAllAccounts,
    postCreateUserAccount,
    putUpdateUserData,
    postSendMoney,
}