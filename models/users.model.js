// Import Mongoose And User Model Object

const { mongoose, userModel } = require("../models/all.models");

// require bcryptjs module for password encrypting

const bcrypt = require("bcryptjs");

async function login(email, password) {
    try {
        // Connect To DB
        await mongoose.connect(process.env.DB_URL);
        // Check If Email Is Exist
        const user = await userModel.findOne({ email });
        if (user) {
            // Check From Password
            const isTruePassword = await bcrypt.compare(password, user.password);
            await mongoose.disconnect();
            if (isTruePassword) return {
                msg: "login successfully !!",
                error: false,
                data: {
                    _id: user._id,
                    isVerified: user.isVerified,
                }
            };
            return {
                msg: "Sorry, Email Or Password Incorrect !!",
                error: true,
                data: {},
            };
        }
        else {
            await mongoose.disconnect();
            return {
                msg: "Sorry, Email Or Password Incorrect !!",
                error: true,
                data: {},
            };
        }
    }
    catch (err) {
        await mongoose.disconnect();
        throw Error(err);
    }
}

async function getAllBalances(userId) {
    try {
        // Connect To DB
        await mongoose.connect(process.env.DB_URL);
        // Check If Email Is Exist
        const user = await userModel.findById(userId);
        await mongoose.disconnect();
        if (user) {
            const { getBalanceOnBlockChain } = require("../global/functions");
            let allBalances = [];
            for (let i = 0; i < user.accounts.length; i++) {
                allBalances.push({
                    currencyName: user.balances[i].currencyName,
                    network: user.accounts[i].network,
                    address: user.accounts[i].address,
                    balance: await getBalanceOnBlockChain(user.accounts[i].network, user.balances[i].currencyName, user.accounts[i].address),
                });
            }
            return {
                msg: `Get All Balances For User Id: ${userId} Process Has Been Successfully !!`,
                error: false,
                data: allBalances,
            };
        } else {
            return {
                msg: `Sorry User Id: ${userId} Not Found !!`,
                error: true,
                data: [],
            };
        }
    }
    catch (err) {
        await mongoose.disconnect();
        throw Error(err);
    }
}

// Define Create New User Function

async function createNewUser(email) {
    try {
        // Connect To DB
        await mongoose.connect(process.env.DB_URL);
        // Check If Email Is Exist
        const user = await userModel.findOne({ email });
        if (user) {
            await mongoose.disconnect();
            return {
                msg: "Sorry, Can't Create User Because it is Exist !!",
                error: true,
                data: {},
            };
        } else {
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
            const newUser = new userModel({
                email,
                password: await bcrypt.hash(generatedPassword, 10),
                secretCode: await bcrypt.hash(generatedSecretCode, 10),
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
                    },
                    {
                        currencyName: "USDT",
                        network: "TRON",
                    },
                    {
                        currencyName: "ETHER",
                        network: "ETHEREUM",
                    },
                    {
                        currencyName: "USDT",
                        network: "ETHEREUM",
                    },
                    {
                        currencyName: "MATIC",
                        network: "POLYGON",
                    },
                    {
                        currencyName: "USDT",
                        network: "POLYGON",
                    },
                    {
                        currencyName: "BTC",
                        network: "BSC",
                    },
                    {
                        currencyName: "USDT",
                        network: "BSC",
                    },
                ],
            });
            // Save The New User As Document In User Collection
            const newUserData = await newUser.save();
            // Disconnect In DB
            await mongoose.disconnect();
            return {
                msg: "Ok !!, Create New User Is Successfuly !!", error: false, data: {
                    _id: newUserData._id,
                    email,
                    password: generatedPassword,
                    secretCode: generatedSecretCode,
                    accountName,
                }
            };
        }
    }
    catch (err) {
        // Disconnect In DB
        await mongoose.disconnect();
        throw Error(err);
    }
}

async function updateUserBalance(userId, balances, balanceItemIndex, network, currency, amount, commission){
    try{
        if (balances[balanceItemIndex].balance < amount + commission) {
            await mongoose.disconnect();
            return {
                msg: "Sorry, There Is Not Enough Balance To Complete The Transaction !!",
                error: true,
                data: {},
            };
        }    
        balances[balanceItemIndex].balance = balances[balanceItemIndex].balance - (amount + commission);
        await userModel.updateOne({ _id: userId }, { balances });
        await mongoose.disconnect();
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
        // Connect To DB
        await mongoose.connect(process.env.DB_URL);
        // Check If Email Is Exist
        const user = await userModel.findOne({ _id: userId });
        if (user) {
            switch (transactionData.network) {
                case "TRON": {
                    switch(transactionData.currency) {
                        case "TRX": {
                            return await updateUserBalance(
                                userId,
                                user.balances,
                                0,
                                transactionData.network,
                                transactionData.currency,
                                transactionData.amount,
                                0.8,
                            );
                        }
                        case "USDT": {
                            return await updateUserBalance(
                                userId,
                                user.balances,
                                1,
                                transactionData.network,
                                transactionData.currency,
                                transactionData.amount,
                                5,
                            );
                        }
                    }
                }
                case "ETHEREUM": {
                    switch (transactionData.currency) {
                        case "ETHER": {
                            return await updateUserBalance(
                                userId,
                                user.balances,
                                2,
                                transactionData.network,
                                transactionData.currency,
                                transactionData.amount,
                                0.0015
                            );
                        }
                        case "USDT": {
                            return await updateUserBalance(
                                userId,
                                user.balances,
                                3,
                                transactionData.network,
                                transactionData.currency,
                                transactionData.amount,
                                5,
                            );
                        }
                    }
                }
                case "POLYGON": {
                    switch (transactionData.currency) {
                        case "MATIC": {
                            return await updateUserBalance(
                                userId,
                                user.balances,
                                4,
                                transactionData.network,
                                transactionData.currency,
                                transactionData.amount,
                                0.1,
                            );
                        }
                        case "USDT": {
                            return await updateUserBalance(
                                userId,
                                user.balances,
                                5,
                                transactionData.network,
                                transactionData.currency,
                                transactionData.amount,
                                0.8,
                            );
                        }
                    }
                }
                case "BSC": {
                    switch (transactionData.currency) {
                        case "BNB": {
                            return await updateUserBalance(
                                userId,
                                user.balances,
                                6,
                                transactionData.network,
                                transactionData.currency,
                                transactionData.amount,
                                0.0005,
                            );
                        }
                        case "USDT": {
                            return await updateUserBalance(
                                userId,
                                user.balances,
                                6,
                                transactionData.network,
                                transactionData.currency,
                                transactionData.amount,
                                0.3,
                            );
                        }
                    }
                }
            }
        }
        return {
            msg: "Sorry, This User Id Is Not Exist !!",
            error: true,
            data: {},
        };
    }
    catch (err) {
        // Disconnect In DB
        await mongoose.disconnect();
        throw Error(err);
    }
}

module.exports = {
    login,
    getAllBalances,
    createNewUser,
    sendMoney,
}