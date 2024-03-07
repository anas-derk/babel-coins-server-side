const { getReponseObject } = require("../global/functions");

async function getUserLogin(req, res) {
    try{
        const   email = req.query.email,
                password = req.query.password;
        const { isEmail } = require("../global/functions");
        if (!email) {
            await res.status(400).json(getReponseObject("Please Send The Email !!", true, {}));
            return;
        }
        if (!password) {
            await res.status(400).json(getReponseObject("Please Send The Password !!", true, {}));
            return;
        }
        if (isEmail(email)) {
            const { login } = require("../models/users.model");
            const result = await login(email.toLowerCase(), password);
            if (!result.error) {
                const { sign } = require("jsonwebtoken");
                const token = sign(result.data, process.env.secretKey, {
                    expiresIn: "1h",
                });
                await res.json({
                    msg: result.msg,
                    error: result.error,
                    data: {
                        token,
                    },
                });
                return;
            }
            await res.json(result);
            return;
        }
        // Return Error Msg If Email Is Not Valid
        await res.status(400).json(getReponseObject("Error, This Is Not Email Valid !!", true, {}));
    }
    catch(err) {
        await res.status(500).json(getReponseObject(err.message, true, {}));
    }
}

async function getIfUserIsLogged(req, res) {
    try{
        const token = req.headers.authorization;
        if (!token) {
            await res.status(400).json(getReponseObject("Please Send JWT For User !!", true, {}));
            return;
        }
        const { verify } = require("jsonwebtoken");
        verify(token, process.env.secretKey);
        await res.json(getReponseObject("User Is Logged !!", false, {}));
    }
    catch(err) {
        await res.status(500).json(getReponseObject(err.message, true, {}));
    }
}

async function getAllBalances(req, res) {
    try{
        const token = req.headers.authorization;
        if (!token) {
            await res.status(400).json(getReponseObject("Please Send JWT For User !!", true, {}));
            return;
        }
        const { verify } = require("jsonwebtoken");
        const result = verify(token, process.env.secretKey);
        const { getAllBalances } = require("../models/users.model");
        await res.json(await getAllBalances(result._id));
    }
    catch(err) {
        if (err.message === "jwt expired") {
            await res.status(400).json(getReponseObject(`Sorry, JWT Expired, Please Re-Login !!`, true, {}));
        }
        await res.status(500).json(getReponseObject(err.message, true, {}));
    }
}

async function getAddressesByCurrenecyName(req, res) {
    try{
        const token = req.headers.authorization;
        const currencyName = req.query.currencyName;
        if (!token) {
            await res.status(400).json(getReponseObject("Please Send JWT For User !!", true, {}));
            return;
        }
        if (!currencyName) {
            await res.status(400).json(getReponseObject("Please Send Currency Name !!", true, {}));
            return;
        }
        const { verify } = require("jsonwebtoken");
        const result = verify(token, process.env.secretKey);
        const { getAddressesByCurrenecyName } = require("../models/users.model");
        await res.json(await getAddressesByCurrenecyName(result._id, currencyName));
    }
    catch(err) {
        await res.status(500).json(getReponseObject(err.message, true, {}));
    }
}

async function postCreateUserAccount(req, res) {
    try{
        const email = req.body.email;
        const code = req.query.code;
        if (!email) {
            await res.status(400).json(getReponseObject("Please Send The Email !!", true, {}));
            return;
        }
        if (!code) {
            await res.status(400).json(getReponseObject("Please Send The Code !!", true, {}));
            return;
        }
        if (code.length < 4) {
            await res.status(400).json(getReponseObject("Please Send The Code Character Count !!", true, {}));
            return;
        }
        const { isEmail } = require("../global/functions");
        if (isEmail(email)) {
            const { isAccountVerificationCodeValid } = require("../models/account_codes.model");
            let result = await isAccountVerificationCodeValid(email, code);
            if (!result.error) {
                const { createNewUser } = require("../models/users.model");
                result = await createNewUser(email.toLowerCase());
                if (!result.error) {
                    const { sign } = require("jsonwebtoken");
                    const token = sign({
                        _id: result.data._id,
                        isVerified: false,
                    }, process.env.secretKey, {
                        expiresIn: "1h",
                    });
                    await res.json({ ...result, data: { ...result.data, token }});
                    return;
                }
                await res.json(result);
                return;
            }
            await res.json(result);
            return;
        }
        await res.status(400).json(getReponseObject("Error, This Is Not Email Valid !!", true, {}));
    }
    catch(err) {
        await res.status(500).json(getReponseObject(err.message, true, {}));
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

async function postAccountVerificationCode(req, res) {
    try{
        const { getReponseObject } = require("../global/functions");
        const userEmail = req.query.email;
        const { isEmail } = require("../global/functions");
        if (!userEmail) {
            await res.status(400).json(getReponseObject("Sorry, Please Send The Email !!", true, {}));
            return;
        }
        if (!isEmail(userEmail)) {
            await res.status(400).json(getReponseObject("Sorry, Please Send Valid Email !!", true, {}));
            return;
        }
        const { sendCodeToUserEmail } = require("../global/functions");
        const result = await sendCodeToUserEmail(userEmail);
        if (!result.error) {
            const { addNewAccountVerificationCode } = require("../models/account_codes.model"); 
            await res.json(await addNewAccountVerificationCode(userEmail, result.data));
        }
    }
    catch(err) {
        await res.status(500).json(getReponseObject(err.message, true, {}));
    }
}

async function postSendMoney(req, res) {
    try{
        const transactionData = req.body;
        const token = req.headers.authorization;
        if (!token) {
            await res.status(403).json({
                msg: "Please Send JWT For User !!",
                error: true,
                data: {},
            });
            return;
        }
        const { verify } = require("jsonwebtoken");
        const result = verify(token, process.env.secretKey);
        if (!transactionData.network) {
            await res.status(400).json(getReponseObject("Please Send Network Name !!", true, {}));
            return;
        }
        if (!transactionData.currency) {
            await res.status(400).json(getReponseObject("Please Send Currency Name !!", true, {}));
            return;
        }
        if (!transactionData.receipentAddress) {
            await res.status(400).json(getReponseObject("Please Send Receipent Address !!", true, {}));
            return;
        }
        if (!transactionData.amount) {
            await res.status(400).json(getReponseObject("Please Send Amount !!", true, {}));
            return;
        }
        switch(transactionData.network) {
            case "TRON": {
                const TronWeb = require("tronweb");
                if (!TronWeb.isAddress(transactionData.receipentAddress)) {
                    await res.status(400).json(getReponseObject("Please Send Valid Receipent Address !!", true, {}));
                    return;
                }
                switch (transactionData.currency) {
                    case "TRX": {
                        if (transactionData.amount < 30) {
                            await res.status(400).json(getReponseObject("Please Send Amount Greater Than Or Equual 30 TRX !!", true, {}));
                            return;
                        }
                        const { sendMoney } = require("../models/users.model");
                        const result1 = await sendMoney(result._id, transactionData);
                        await res.json(result1);
                        if (!result1.error) {
                            const { sendMoneyOnBlockChain } = require("../global/functions");
                            const transactionHash = await sendMoneyOnBlockChain(
                                transactionData.network,
                                "trx",
                                process.env.BABEL_CENTRAL_WALLET_ON_TRON,
                                transactionData.receipentAddress,
                                transactionData.amount,
                                process.env.PRIVATE_KEY_FOR_BABEL_CENTRAL_WALLET_ON_TRON,
                            );
                            console.log(transactionHash);
                        }
                        break;
                    }
                    case "USDT": {
                        if (transactionData.amount < 10) {
                            await res.status(400).json(getReponseObject("Please Send Amount Greater Than Or Equual 10 USDT !!", true, {}));
                            return;
                        }
                        const { sendMoney } = require("../models/users.model");
                        const result1 = await sendMoney(result._id, transactionData);
                        await res.json(result1);
                        if (!result1.error) {
                            const { sendMoneyOnBlockChain } = require("../global/functions");
                            const transactionHash = await sendMoneyOnBlockChain(
                                transactionData.network,
                                "usdt",
                                process.env.BABEL_CENTRAL_WALLET_ON_TRON,
                                transactionData.receipentAddress,
                                transactionData.amount,
                                process.env.PRIVATE_KEY_FOR_BABEL_CENTRAL_WALLET_ON_TRON,
                            );
                            console.log(transactionHash);
                        }
                        break;
                    }
                }
                break;
            }
            case "ETHEREUM": {
                const web3 = require("web3");
                if(!web3.utils.isAddress(transactionData.receipentAddress)) {
                    await res.status(400).json(getReponseObject("Please Send Valid Receipent Address !!", true, {}));
                    return;
                }
                switch (transactionData.currency) {
                    case "ETHER": {
                        if (transactionData.amount < 0.02) {
                            await res.status(400).json(getReponseObject("Please Send Amount Greater Than Or Equual 0.02 ETHER !!", true, {}));
                            return;
                        }
                        const { sendMoney } = require("../models/users.model");
                        const result1 = await sendMoney(result._id, transactionData);
                        await res.json(result1);
                        if (!result1.error) {
                            const { sendMoneyOnBlockChain } = require("../global/functions");
                            const transactionHash = await sendMoneyOnBlockChain(
                                transactionData.network,
                                "ether",
                                process.env.BABEL_CENTRAL_WALLET_ON_ETHEREUM,
                                transactionData.receipentAddress,
                                transactionData.amount,
                                process.env.PRIVATE_KEY_FOR_BABEL_CENTRAL_WALLET_ON_ETHEREUM,
                            );
                            console.log(transactionHash);
                        }
                        break;
                    }
                    case "USDT": {
                        if (transactionData.amount < 5) {
                            await res.status(400).json(getReponseObject("Please Send Amount Greater Than Or Equual 5 USDT !!", true, {}));
                            return;
                        }
                        const { sendMoney } = require("../models/users.model");
                        const result1 = await sendMoney(result._id, transactionData);
                        await res.json(result1);
                        if (!result1.error) {
                            const { sendMoneyOnBlockChain } = require("../global/functions");
                            const transactionHash = await sendMoneyOnBlockChain(
                                transactionData.network,
                                "usdt",
                                process.env.BABEL_CENTRAL_WALLET_ON_ETHEREUM,
                                transactionData.receipentAddress,
                                transactionData.amount,
                                process.env.PRIVATE_KEY_FOR_BABEL_CENTRAL_WALLET_ON_ETHEREUM,
                            );
                            console.log(transactionHash);
                        }
                        break;
                    }
                    default: {
                        await res.status(400).json(getReponseObject(`Please Send Valid Currency Name For ${transactionData.network} Network !!`, true, {}));
                        return;
                    }
                }
                break;
            }
            default: {
                await res.status(400).json(getReponseObject("Please Send Valid Network Name !!", true, {}));
                return;
            }
        }
    }
    catch(err) {
        if (!err.message.includes("insufficient funds")) {
            await res.status(500).json(getReponseObject(err.message, true, {}));
            return;
        }
        await res.status(500).json(getReponseObject(err.message, true, {}));
    }
}

async function postReceiveMoneyOnWallet(req, res) {
    try{
        const receiveDetails = req.query;
        if (!receiveDetails.address) {
            await res.status(400).json(getReponseObject("Please Send Receipent Address !!", true, {}));
            return;
        }
        if (!receiveDetails.chain) {
            await res.status(400).json(getReponseObject("Please Send Currency Name !!", true, {}));
            return;
        }
        if (!receiveDetails.userId) {
            await res.status(400).json(getReponseObject("Please Send User Id !!", true, {}));
            return;
        }
        switch(receiveDetails.chain) {
            case "TRON": {
                const TronWeb = require("tronweb");
                if (!TronWeb.isAddress(receiveDetails.address)) {
                    await res.status(400).json(getReponseObject("Please Send Valid Receipent Address !!", true, {}));
                    return;
                }
                if (req.body.subscriptionType === "INCOMING_NATIVE_TX") {
                    const { updateUserBalance } = require("../models/users.model");
                    await res.json(
                        await updateUserBalance(
                            receiveDetails.userId,
                            receiveDetails.chain,
                            "TRX",
                            0,
                            Number(req.body.amount),
                            req.body.txId,
                        )
                    );
                    return;
                }
                if (req.body.subscriptionType === "INCOMING_FUNGIBLE_TX") {
                    if (req.body.contractAddress === "USDT_TRON") {
                        const { updateUserBalance } = require("../models/users.model");
                        await res.json(
                            await updateUserBalance(
                                receiveDetails.userId,
                                receiveDetails.chain,
                                "USDT",
                                1,
                                Number(req.body.amount),
                                req.body.txId,
                            )
                        );
                        return;
                    }
                    await res.status(200).json(getReponseObject("Please Send Valid Asset Name !!", true, {}));
                    return;
                }
                await res.status(400).json(getReponseObject("Please Send Valid Network Name !!", true, {}));
                break;
            }
            case "ETH": {
                const web3 = require("web3");
                if(!web3.utils.isAddress(receiveDetails.address)) {
                    await res.status(400).json(getReponseObject("Please Send Valid Receipent Address !!", true, {}));
                    return;
                }
                break;
            }
            case "MATIC": {
                const web3 = require("web3");
                if(!web3.utils.isAddress(receiveDetails.address)) {
                    await res.status(400).json(getReponseObject("Please Send Valid Receipent Address !!", true, {}));
                    return;
                }
                break;
            }
            case "BSC": {
                const web3 = require("web3");
                if(!web3.utils.isAddress(receiveDetails.address)) {
                    await res.status(400).json(getReponseObject("Please Send Valid Receipent Address !!", true, {}));
                    return;
                }
                break;
            }
            default: {
                await res.status(400).json(getReponseObject("Please Send Valid Network Name !!", true, {}));
            }
        }
    }
    catch(err) {
        console.log(err);
        await res.status(500).json(getReponseObject(err.message, true, {}));
    }
}

module.exports = {
    getIfUserIsLogged,
    getUserLogin,
    getAllBalances,
    getAddressesByCurrenecyName,
    postCreateUserAccount,
    putUpdateUserData,
    postSendMoney,
    postReceiveMoneyOnWallet,
    postAccountVerificationCode,
}