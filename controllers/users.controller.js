const { getResponseObject, checkIsExistValueForFieldsAndDataTypes } = require("../global/functions");

async function getUserLogin(req, res) {
    try{
        const   email = req.query.email,
                password = req.query.password;
        const checkResult = checkIsExistValueForFieldsAndDataTypes([
            { fieldName: "Email", fieldValue: email, dataType: "string", isRequiredValue: true },
            { fieldName: "Password", fieldValue: password, dataType: "string", isRequiredValue: true },
        ]);
        if (checkResult.error) {
            await res.status(400).json(checkResult);
            return;
        }
        const { isEmail } = require("../global/functions");
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
        await res.status(400).json(getResponseObject("Error, This Is Not Email Valid !!", true, {}));
    }
    catch(err) {
        console.log(err);
        await res.status(500).json(getResponseObject(err.message, true, {}));
    }
}

async function getUserInfo(req, res) {
    try{
        const { getUserInfo } = require("../models/users.model");
        await res.json(await getUserInfo(req.data._id));
    }
    catch(err) {
        await res.status(500).json(getResponseObject(err.message, true, {}));
    }
}

async function getAllBalances(req, res) {
    try{
        const { getAllBalances } = require("../models/users.model");
        await res.json(await getAllBalances(req.data._id));
    }
    catch(err) {
        await res.status(500).json(getResponseObject(err.message, true, {}));
    }
}

async function getAddressesByCurrenecyName(req, res) {
    try{
        const currencyName = req.query.currencyName;
        const checkResult = checkIsExistValueForFieldsAndDataTypes([
            { fieldName: "Currency Name", fieldValue: currencyName, dataType: "string", isRequiredValue: true },
        ]);
        if (checkResult.error) {
            await res.status(400).json(checkResult);
            return;
        }
        const { getAddressesByCurrenecyName } = require("../models/users.model");
        await res.json(await getAddressesByCurrenecyName(req.data._id, currencyName));
    }
    catch(err) {
        await res.status(500).json(getResponseObject(err.message, true, {}));
    }
}

async function postCreateUserAccount(req, res) {
    try{
        const email = req.body.email;
        const code = req.query.code;
        const checkResult = checkIsExistValueForFieldsAndDataTypes([
            { fieldName: "Email", fieldValue: email, dataType: "string", isRequiredValue: true },
            { fieldName: "Code", fieldValue: code, dataType: "string", isRequiredValue: true },
        ]);
        if (checkResult.error) {
            await res.status(400).json(checkResult);
            return;
        }
        if (code.length < 4) {
            await res.status(400).json(getResponseObject("Please Send The Code Character Count !!", true, {}));
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
        await res.status(400).json(getResponseObject("Error, This Is Not Email Valid !!", true, {}));
    }
    catch(err) {
        console.log(err);
        await res.status(500).json(getResponseObject(err.message, true, {}));
    }
}

async function postAccountVerificationCode(req, res) {
    try{
        const email = req.query.email;
        const checkResult = checkIsExistValueForFieldsAndDataTypes([
            { fieldName: "Email", fieldValue: email, dataType: "string", isRequiredValue: true },
        ]);
        if (checkResult.error) {
            await res.status(400).json(checkResult);
            return;
        }
        const { isEmail } = require("../global/functions");
        if (!isEmail(email)) {
            await res.status(400).json(getResponseObject("Sorry, Please Send Valid Email !!", true, {}));
            return;
        }
        const { isBlockingFromReceiveTheCodeAndReceiveBlockingExpirationDate } = require("../models/account_codes.model");
        let result = await isBlockingFromReceiveTheCodeAndReceiveBlockingExpirationDate(email);
        if (result.error) {
            await res.json(result);
            return;
        }
        const { sendCodeToUserEmail } = require("../global/functions");
        result = await sendCodeToUserEmail(email);
        if (!result.error) {
            const { addNewAccountVerificationCode } = require("../models/account_codes.model"); 
            await res.json(await addNewAccountVerificationCode(email, result.data));
        }
    }
    catch(err) {
        await res.status(500).json(getResponseObject(err.message, true, {}));
    }
}

async function postSendMoney(req, res) {
    try{
        const transactionData = req.body;
        const checkResult = checkIsExistValueForFieldsAndDataTypes([
            { fieldName: "Transfer Type", fieldValue: transactionData.transferType, dataType: "string", isRequiredValue: true },
            { fieldName: "Transfer Currency Type", fieldValue: transactionData.transferCurrencyType, dataType: "string", isRequiredValue: true },
            { fieldName: "Currency Name", fieldValue: transactionData.currencyName, dataType: "string", isRequiredValue: true },
            { fieldName: "Amount", fieldValue: transactionData.amount, dataType: "number", isRequiredValue: true },
        ]);
        if (checkResult.error) {
            await res.status(400).json(checkResult);
            return;
        }
        if (transactionData.transferType !== "internal" && transactionData.transferType !== "external") {
            await res.status(400).json(getResponseObject("Please Send Valid Transfer Type !!", true, {}));
            return;
        }
        if (transactionData.transferCurrencyType !== "fiat" && transactionData.transferCurrencyType !== "crypto") {
            await res.status(400).json(getResponseObject("Please Send Valid Transfer Currency Type !!", true, {}));
            return;
        }
        if(transactionData.transferCurrencyType === "crypto" && !transactionData.network){
            await res.status(400).json(getResponseObject("Invalid Request, Please Send Network Name !!", true, {}));
            return;
        }
        if (transactionData.transferCurrencyType === "crypto") {
            switch(transactionData.network) {
                case "TRON": {
                    const TronWeb = require("tronweb");
                    if (!TronWeb.isAddress(transactionData.receipentAddress)) {
                        await res.status(400).json(getResponseObject("Please Send Valid Receipent Address !!", true, {}));
                        return;
                    }
                    switch (transactionData.currencyName) {
                        case "TRX": {
                            const { sendMoney } = require("../models/users.model");
                            const result = await sendMoney(req.data._id, transactionData);
                            console.log(result)
                            if (!result.error) {
                                if (transactionData.transferType === "internal") {
                                    const { createNewTransfer } = require("../models/transfers.model");
                                    const result = await createNewTransfer({
                                        transferType: "internal",
                                        transferCurrencyType: "crypto",
                                        currencyName: transactionData.currencyName,
                                        senderId: req.data._id,
                                        receiverId: transactionData.receiverId,
                                        amount: transactionData.amount,
                                    });
                                    await res.json(result);
                                    return;
                                }
                                if (transactionData.transferType === "external") {
                                    console.log("ex")
                                    // const { sendMoneyOnBlockChain } = require("../global/functions");
                                    // const transactionId = await sendMoneyOnBlockChain(
                                    //     transactionData.network,
                                    //     "trx",
                                    //     process.env.BABEL_CENTRAL_WALLET_ON_TRON,
                                    //     transactionData.receipentAddress,
                                    //     transactionData.amount,
                                    //     process.env.PRIVATE_KEY_FOR_BABEL_CENTRAL_WALLET_ON_TRON,
                                    // );
                                    // const { createNewTransfer } = require("../models/transfers.model");
                                    // const result = await createNewTransfer({
                                    //     transferType: "external",
                                    //     transferCurrencyType: "crypto",
                                    //     network,
                                    //     currencyName: transactionData.currencyName,
                                    //     senderId: req.data._id,
                                    //     receiverAddress: transactionData.receipentAddress,
                                    //     amount: transactionData.amount,
                                    //     transactionId,
                                    // });
                                    // await res.json(result);
                                    return;
                                }
                            }
                            break;
                        }
                        case "USDT": {
                            const { sendMoney } = require("../models/users.model");
                            const result = await sendMoney(req.data._id, transactionData);
                            if (!result.error) {
                                if (transactionData.transferType === "internal") {
                                    const { createNewTransfer } = require("../models/transfers.model");
                                    const result = await createNewTransfer({
                                        transferType: "internal",
                                        transferCurrencyType: "crypto",
                                        currencyName: transactionData.currencyName,
                                        senderId: req.data._id,
                                        receiverId: transactionData.receiverId,
                                        amount: transactionData.amount,
                                    });
                                    await res.json(result);
                                    return;
                                }
                                if (transactionData.transferType === "external") {
                                    const { sendMoneyOnBlockChain } = require("../global/functions");
                                    const transactionId = await sendMoneyOnBlockChain(
                                        transactionData.network,
                                        "usdt",
                                        process.env.BABEL_CENTRAL_WALLET_ON_TRON,
                                        transactionData.receipentAddress,
                                        transactionData.amount,
                                        process.env.PRIVATE_KEY_FOR_BABEL_CENTRAL_WALLET_ON_TRON,
                                    );
                                    const { createNewTransfer } = require("../models/transfers.model");
                                    const result = await createNewTransfer({
                                        transferType: "external",
                                        transferCurrencyType: "crypto",
                                        network,
                                        currencyName: transactionData.currencyName,
                                        senderId: req.data._id,
                                        receiverAddress: transactionData.receipentAddress,
                                        amount: transactionData.amount,
                                        transactionId,
                                    });
                                    await res.json(result);
                                    return;
                                }
                            }
                            break;
                        }
                        default: {
                            await res.status(400).json(getResponseObject("Please Send Valid Currency Name !!", true, {}));
                            return;
                        }
                    }
                    break;
                }
                case "ETHEREUM": {
                    const web3 = require("web3");
                    if(!web3.utils.isAddress(transactionData.receipentAddress)) {
                        await res.status(400).json(getResponseObject("Please Send Valid Receipent Address !!", true, {}));
                        return;
                    }
                    switch (transactionData.currencyName) {
                        case "ETHER": {
                            if (transactionData.amount < 0.02) {
                                await res.status(400).json(getResponseObject("Please Send Amount Greater Than Or Equual 0.02 ETHER !!", true, {}));
                                return;
                            }
                            const { sendMoney } = require("../models/users.model");
                            const result1 = await sendMoney(req.data._id, transactionData);
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
                                await res.status(400).json(getResponseObject("Please Send Amount Greater Than Or Equual 5 USDT !!", true, {}));
                                return;
                            }
                            const { sendMoney } = require("../models/users.model");
                            const result1 = await sendMoney(req.data._id, transactionData);
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
                            await res.status(400).json(getResponseObject(`Please Send Valid Currency Name For ${transactionData.network} Network !!`, true, {}));
                            return;
                        }
                    }
                    break;
                }
                default: {
                    await res.status(400).json(getResponseObject("Please Send Valid Network Name !!", true, {}));
                    return;
                }
            }
        }
    }
    catch(err) {
        if (!err.message.includes("insufficient funds")) {
            await res.status(500).json(getResponseObject(err.message, true, {}));
            return;
        }
        await res.status(500).json(getResponseObject(err.message, true, {}));
    }
}

async function postReceiveMoneyOnWallet(req, res) {
    try{
        const receiveDetails = req.query;
        const checkResult = checkIsExistValueForFieldsAndDataTypes([
            { fieldName: "Receipent Address", fieldValue: receiveDetails.address, dataType: "string", isRequiredValue: true },
            { fieldName: "Network Name", fieldValue: receiveDetails.chain, dataType: "string", isRequiredValue: true },
            { fieldName: "User Id", fieldValue: receiveDetails.userId, dataType: "string", isRequiredValue: true },
        ]);
        if (checkResult.error) {
            await res.status(400).json(checkResult);
            return;
        }
        const depositDetails = req.body;
        switch(receiveDetails.chain) {
            case "TRON": {
                const TronWeb = require("tronweb");
                if (!TronWeb.isAddress(receiveDetails.address)) {
                    await res.status(400).json(getResponseObject("Please Send Valid Receipent Address !!", true, {}));
                    return;
                }
                if (depositDetails.subscriptionType === "INCOMING_NATIVE_TX") {
                    const { deposit } = require("../models/users.model");
                    await res.json(
                        await deposit(
                            receiveDetails.userId,
                            receiveDetails.chain,
                            "TRX",
                            0,
                            Number(depositDetails.amount),
                            depositDetails.txId,
                        )
                    );
                    return;
                }
                if (depositDetails.subscriptionType === "INCOMING_FUNGIBLE_TX") {
                    if (!depositDetails.contractAddress) {
                        await res.status(400).json(getResponseObject("Please Send Contract Address !!", true, {}));
                        return;
                    }
                    if (depositDetails.contractAddress === "USDT_TRON") {
                        const { deposit } = require("../models/users.model");
                        await res.json(
                            await deposit(
                                receiveDetails.userId,
                                receiveDetails.chain,
                                "USDT",
                                1,
                                Number(depositDetails.amount),
                                depositDetails.txId,
                            )
                        );
                        return;
                    }
                    await res.status(200).json(getResponseObject("Please Send Valid Asset Name !!", true, {}));
                    return;
                }
                await res.status(400).json(getResponseObject("Please Send Valid Network Name !!", true, {}));
                break;
            }
            case "ETH": {
                const web3 = require("web3");
                if(!web3.utils.isAddress(receiveDetails.address)) {
                    await res.status(400).json(getResponseObject("Please Send Valid Receipent Address !!", true, {}));
                    return;
                }
                break;
            }
            case "MATIC": {
                const web3 = require("web3");
                if(!web3.utils.isAddress(receiveDetails.address)) {
                    await res.status(400).json(getResponseObject("Please Send Valid Receipent Address !!", true, {}));
                    return;
                }
                break;
            }
            case "BSC": {
                const web3 = require("web3");
                if(!web3.utils.isAddress(receiveDetails.address)) {
                    await res.status(400).json(getResponseObject("Please Send Valid Receipent Address !!", true, {}));
                    return;
                }
                break;
            }
            default: {
                await res.status(400).json(getResponseObject("Please Send Valid Network Name !!", true, {}));
            }
        }
    }
    catch(err) {
        await res.status(500).json(getResponseObject(err.message, true, {}));
    }
}

async function putUpdateUserInfo(req, res) {
    try{
        const { updateUserInfo } = require("../models/users.model");
        await res.json(await updateUserInfo(req.data._id, req.body));
    }
    catch(err) {
        await res.status(500).json(getResponseObject(err.message, true, {}));
    }
}

module.exports = {
    getUserInfo,
    getUserLogin,
    getAllBalances,
    getAddressesByCurrenecyName,
    postCreateUserAccount,
    postSendMoney,
    postReceiveMoneyOnWallet,
    postAccountVerificationCode,
    putUpdateUserInfo,
}