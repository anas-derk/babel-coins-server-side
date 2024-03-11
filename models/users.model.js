// Import Mongoose And User Model Object

const { userModel, supportedCurrenciesByNetworksModel } = require("../models/all.models");

// require bcryptjs module for password encrypting

const { hash, compare } = require("bcryptjs");

async function login(email, password) {
    try {
        // Check If Email Is Exist
        const user = await userModel.findOne({ email });
        if (user) {
            // Check From Password
            const isTruePassword = await compare(password, user.password);
            if (isTruePassword) {
                await userModel.updateOne({ email }, { dateOfLastLogin: Date.now() });
                return {
                    msg: "login successfully !!",
                    error: false,
                    data: {
                        _id: user._id,
                        isVerified: user.isVerified,
                    }
                };
            }
            return {
                msg: "Sorry, Email Or Password Incorrect !!",
                error: true,
                data: {},
            };
        }
        else {
            return {
                msg: "Sorry, Email Or Password Incorrect !!",
                error: true,
                data: {},
            };
        }
    }
    catch (err) {
        throw Error(err);
    }
}

async function getUserInfo(userId) {
    try{
        // Check If User Is Exist
        const user = await userModel.findById(userId);
        if (user) {
            return {
                msg: "Get User Info Process Has Been Successfully !!",
                error: false,
                data: {
                    _id: user._id,
                    email: user.email,
                    accountName: user.accountName,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    country: user.country,
                    isVerified: user.isVerified,
                    createdDate: user.createdDate,
                    dateOfLastLogin: user.dateOfLastLogin,
                },
            };
        }
        return {
            msg: "Sorry, The User Is Not Exist !!, Please Enter Another User Id ..",
            error: true,
            data: {},
        };
    }
    catch(err) {
        throw Error(err);
    }
}

async function getAllBalances(userId) {
    try {
        // Check If Email Is Exist
        const user = await userModel.findById(userId);
        if (user) {
            return {
                msg: `Get All Balances For User Id: ${userId} Process Has Been Successfully !!`,
                error: false,
                data: user.balances,
            };
        }
        return {
            msg: `Sorry User Id: ${userId} Not Found !!`,
            error: true,
            data: [],
        };
    }
    catch (err) {
        throw Error(err);
    }
}

async function getAddressesByCurrenecyName(userId, currencyName) {
    try{
        // Check If Email Is Exist
        const user = await userModel.findById(userId);
        if (user) {
            const networksThatSupportCurrencyName = await supportedCurrenciesByNetworksModel.findOne({ currencyName });
            let addressesByCurrencies = [];
            user.accounts.forEach((account) => {
                if(networksThatSupportCurrencyName.networks.includes(account.network)) {
                    addressesByCurrencies.push({
                        network: account.network,
                        address: account.address,
                    });
                }
            });
            return {
                msg: `Get All Addresses For User Id: ${userId} By Currency Name: ${currencyName} Process Has Been Successfully !!`,
                error: false,
                data: addressesByCurrencies,
            };
        }
        return {
            msg: `Sorry User Id: ${userId} Not Found !!`,
            error: true,
            data: [],
        };
    }
    catch(err) {
        throw Error(err);
    }
}

async function createNewUser(email) {
    try {
        // Check If Email Is Exist
        const user = await userModel.findOne({ email });
        if (user) {
            return {
                msg: "Sorry, Can't Create User Because it is Exist !!",
                error: true,
                data: {},
            };
        }
        // Create New Document From User Schema
        const CodeGenerator = require('node-code-generator');
        const generator = new CodeGenerator();
        const generatedPassword = generator.generateCodes("**##*#*#")[0];
        const generatedSecretCode = generator.generateCodes("######")[0];
        const accountName = `B${await userModel.countDocuments({})}`;
        const TronWeb = require("tronweb");
        const tronWeb = new TronWeb({
            fullHost: process.env.TRON_NODE_BASE_API_URL,
            headers: { 'TRON-PRO-API-KEY': process.env.TRON_NODE_API_KEY },
        });
        const tronAccount = await tronWeb.createAccount();
        const { Web3 } = require("web3");
        const web3ForEthereum = new Web3(process.env.ETHEREUM_NODE_BASE_API_URL);
        const ethereumAccount = web3ForEthereum.eth.accounts.create();
        const web3ForPolygon = new Web3(process.env.POLYGON_NODE_BASE_API_URL);
        const polygonAccount = web3ForPolygon.eth.accounts.privateKeyToAccount(ethereumAccount.privateKey);
        const web3ForBSC = new Web3(process.env.BINANCE_SMART_CHAIN_NODE_BASE_API_URL);
        const bscAccount = web3ForBSC.eth.accounts.privateKeyToAccount(ethereumAccount.privateKey);
        const cryptoJS = require("crypto-js");
        const encryptedPrivateKeyForEthereum = cryptoJS.AES.encrypt(ethereumAccount.privateKey, process.env.secretKey).toString();
        const { createNewSubscriptionInTatumNotificationsService } = require("../global/functions");
        const newUser = new userModel({
            email,
            password: await hash(generatedPassword, 10),
            secretCode: await hash(generatedSecretCode, 10),
            accountName,
            accounts: [
                {
                    network: "TRON",
                    address: tronAccount.address.base58,
                    privateKey:  cryptoJS.AES.encrypt(tronAccount.privateKey, process.env.secretKey).toString(),
                },
                {
                    network: "ETHEREUM",
                    address: ethereumAccount.address,
                    privateKey: encryptedPrivateKeyForEthereum,
                },
                {
                    network: "POLYGON",
                    address: polygonAccount.address,
                    privateKey: encryptedPrivateKeyForEthereum,
                },
                {
                    network: "BSC",
                    address: bscAccount.address,
                    privateKey: encryptedPrivateKeyForEthereum,
                },
            ],
            balances: [
                {
                    currencyName: "TRX",
                    network: "TRON",
                    symbol: "TRX",
                },
                {
                    currencyName: "USDT",
                    network: "TRON,ETHEREUM,POLYGON,BSC",
                    symbol: "USDT",
                },
                {
                    currencyName: "ETHER",
                    network: "ETHEREUM",
                    symbol: "ETH",
                },
                {
                    currencyName: "MATIC",
                    network: "POLYGON",
                    symbol: "MATIC",
                },
                {
                    currencyName: "BNB",
                    network: "BSC",
                    symbol: "BNB",
                },
            ],
            isVerified: true,
        });
        // Save The New User As Document In User Collection
        const newUserData = await newUser.save();
        await userModel.updateOne({ _id: newUserData._id },
            {
                subscriptionIds: [
                    {
                        subscriptionIdForFungibleTokensIncoming: await createNewSubscriptionInTatumNotificationsService("INCOMING_FUNGIBLE_TX", tronAccount.address.base58, "TRON", newUserData._id),
                        subscriptionIdForNativeIncoming: await createNewSubscriptionInTatumNotificationsService("INCOMING_NATIVE_TX", tronAccount.address.base58, "TRON", newUserData._id),
                    },
                    {
                        subscriptionIdForFungibleTokensIncoming: await createNewSubscriptionInTatumNotificationsService("INCOMING_FUNGIBLE_TX", ethereumAccount.address, "ETH", newUserData._id),
                        subscriptionIdForNativeIncoming: await createNewSubscriptionInTatumNotificationsService("INCOMING_NATIVE_TX", ethereumAccount.address, "ETH", newUserData._id),
                    },
                    {
                        subscriptionIdForFungibleTokensIncoming: await createNewSubscriptionInTatumNotificationsService("INCOMING_FUNGIBLE_TX", ethereumAccount.address, "MATIC", newUserData._id),
                        subscriptionIdForNativeIncoming: await createNewSubscriptionInTatumNotificationsService("INCOMING_NATIVE_TX", ethereumAccount.address, "MATIC", newUserData._id),
                    },
                    {
                        subscriptionIdForFungibleTokensIncoming: await createNewSubscriptionInTatumNotificationsService("INCOMING_FUNGIBLE_TX", ethereumAccount.address, "BSC", newUserData._id),
                        subscriptionIdForNativeIncoming: await createNewSubscriptionInTatumNotificationsService("INCOMING_NATIVE_TX", ethereumAccount.address, "BSC", newUserData._id),
                    },
                ],
            }
        );
        return {
            msg: "Ok !!, Create New User Has Been Successfuly !!", error: false, data: {
                _id: newUserData._id,
                email,
                password: generatedPassword,
                secretCode: generatedSecretCode,
                accountName,
            }
        };
    }
    catch (err) {
        throw Error(err);
    }
}

async function updateUserBalanceOnSendMoney(userId, balances, balanceItemIndex, network, currency, amount, commission){
    try{
        if (balances[balanceItemIndex].balance < amount + commission) {
            return {
                msg: "Sorry, There Is Not Enough Balance To Complete The Transaction !!",
                error: true,
                data: {},
            };
        }    
        balances[balanceItemIndex].balance = balances[balanceItemIndex].balance - (amount + commission);
        await userModel.updateOne({ _id: userId }, { balances });
        return {
            msg: `Updating User Balance For ${currency} In ${network} Network Has Been Successfully !!`,
            error: false,
            data: {},
        };
    }
    catch(err) {
        throw Error(err);
    }
}

async function sendMoney(userId, transactionData) {
    try {
        // Check If Email Is Exist
        const user = await userModel.findOne({ _id: userId });
        if (user) {
            const { get_fee_by_currency_name_and_tranasfer_type } = require("../models/transfer_fees.model");
            const result = await get_fee_by_currency_name_and_tranasfer_type(
                transactionData
            );
            if(!result.error) {
                switch (transactionData.network) {
                    case "TRON": {
                        switch(transactionData.currency) {
                            case "TRX": {
                                return await updateUserBalanceOnSendMoney(
                                    userId,
                                    user.balances,
                                    0,
                                    transactionData.network,
                                    transactionData.currency,
                                    transactionData.amount,
                                    result.data.fee,
                                );
                            }
                            case "USDT": {
                                return await updateUserBalanceOnSendMoney(
                                    userId,
                                    user.balances,
                                    1,
                                    transactionData.network,
                                    transactionData.currency,
                                    transactionData.amount,
                                    result.data.fee,
                                );
                            }
                        }
                    }
                    case "ETHEREUM": {
                        switch (transactionData.currency) {
                            case "ETHER": {
                                return await updateUserBalanceOnSendMoney(
                                    userId,
                                    user.balances,
                                    2,
                                    transactionData.network,
                                    transactionData.currency,
                                    transactionData.amount,
                                    result.data.fee,
                                );
                            }
                            case "USDT": {
                                return await updateUserBalanceOnSendMoney(
                                    userId,
                                    user.balances,
                                    3,
                                    transactionData.network,
                                    transactionData.currency,
                                    transactionData.amount,
                                    result.data.fee,
                                );
                            }
                        }
                    }
                    case "POLYGON": {
                        switch (transactionData.currency) {
                            case "MATIC": {
                                return await updateUserBalanceOnSendMoney(
                                    userId,
                                    user.balances,
                                    4,
                                    transactionData.network,
                                    transactionData.currency,
                                    transactionData.amount,
                                    result.data.fee,
                                );
                            }
                            case "USDT": {
                                return await updateUserBalanceOnSendMoney(
                                    userId,
                                    user.balances,
                                    5,
                                    transactionData.network,
                                    transactionData.currency,
                                    transactionData.amount,
                                    result.data.fee,
                                );
                            }
                        }
                    }
                    case "BSC": {
                        switch (transactionData.currency) {
                            case "BNB": {
                                return await updateUserBalanceOnSendMoney(
                                    userId,
                                    user.balances,
                                    6,
                                    transactionData.network,
                                    transactionData.currency,
                                    transactionData.amount,
                                    result.data.fee,
                                );
                            }
                            case "USDT": {
                                return await updateUserBalanceOnSendMoney(
                                    userId,
                                    user.balances,
                                    6,
                                    transactionData.network,
                                    transactionData.currency,
                                    transactionData.amount,
                                    result.data.fee,
                                );
                            }
                        }
                    }
                }
            }
            return result;
        }
        return {
            msg: "Sorry, This User Id Is Not Exist !!",
            error: true,
            data: {},
        };
    }
    catch (err) {
        throw Error(err);
    }
}

async function deposit(userId, network, currency, currencyIndex, newAmount, newTransactionId){
    try{
        const user = await userModel.findById(userId);
        if (user) {
            switch (network) {
                case "TRON": {
                    switch(currency) {
                        case "TRX": {
                            if (newAmount < 10) user.balances[currencyIndex].invalidDepositeBalance += newAmount;
                            else user.balances[currencyIndex].validDepositeBalance += newAmount;
                            await userModel.updateOne({ _id: userId }, {
                                balances: user.balances,
                                lastTransactionId: newTransactionId
                            });
                            const { createNewDeposit } = require("../models/deposits.model");
                            const result = await createNewDeposit({
                                debositType: "external",
                                depositCurrencyType: "crypto",
                                network,
                                currencyName: currency,
                                depositorId: userId,
                                amount: newAmount,
                            });
                            if (!result.error) {
                                return {
                                    msg: `${currency} Deposit Procsss On Network ${network} Has Been Successfully !!`,
                                    error: false,
                                    data: user.balances,
                                }
                            }
                            return result;
                        }
                        case "USDT": {
                            if (newAmount < 10) user.balances[currencyIndex].invalidDepositeBalance += newAmount;
                            else user.balances[currencyIndex].validDepositeBalance += newAmount;
                            await userModel.updateOne({ _id: userId }, {
                                balances: user.balances,
                                lastTransactionId: newTransactionId
                            });
                            const { createNewDeposit } = require("../models/deposits.model");
                            const result = await createNewDeposit({
                                debositType: "external",
                                depositCurrencyType: "crypto",
                                network,
                                currencyName: currency,
                                depositorId: userId,
                                amount: newAmount,
                            });
                            if (!result.error) {
                                return {
                                    msg: `${currency} Deposit Procsss On Network ${network} Has Been Successfully !!`,
                                    error: false,
                                    data: user.balances,
                                }
                            }
                            return result;
                        }
                    }
                }
            }
        }
        return {
            msg: "Sorry, This Usr Is Not Found !!",
            error: true,
            data: {},
        };
    }
    catch(err) {
        throw Error(err);
    }
}

async function updateUserInfo(userId, newUserInfo) {
    try{
        if (newUserInfo.password) {
            newUserInfo.password = await hash(newUserInfo.password, 10);
        }
        if(newUserInfo.secretCode) {
            newUserInfo.secretCode = await hash(newUserInfo.secretCode, 10);
        }
        const user = await userModel.findOneAndUpdate({ _id: userId }, newUserInfo);
        if (user) {
            return {
                msg: "Updating User Info Process Has Been Successfully !!",
                error: false,
                data: {},
            }
        }
        return {
            msg: "Sorry, The User Is Not Exist !!, Please Enter Another User Id ..",
            error: true,
            data: {},
        };
    }
    catch(err) {
        console.log(err);
        throw Error(err);
    }
}

module.exports = {
    login,
    getUserInfo,
    getAllBalances,
    getAddressesByCurrenecyName,
    createNewUser,
    sendMoney,
    deposit,
    updateUserInfo,
}