const { getReponseObject } = require("../global/functions");

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
            return;
        }
        await res.status(400).json(getReponseObject("Error, Please Enter Email And Password Or Rest Input !!", true, {}));
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
        await res.status(500).json(getReponseObject("Internal Server Error", true, {}));
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
            }
            else {
                // Return Error Msg If Email Is Not Valid
                await res.status(400).json(getReponseObject("Error, This Is Not Email Valid !!", true, {}));
            }
        } else {
            await res.status(400).json(getReponseObject("Error, Please Send The Email !!", true, {}));
        }
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
                                0,
                                Number(req.body.amount),
                                req.body.txId,
                            )
                        );
                        return;
                    }
                    await res.status(400).json(getReponseObject("Please Send Valid Asset Name !!", true, {}));
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
        await res.status(500).json(getReponseObject(err.message, true, {}));
    }
}

module.exports = {
    getUserLogin,
    getAllBalances,
    postCreateUserAccount,
    putUpdateUserData,
    postSendMoney,
    postReceiveMoneyOnWallet,
}