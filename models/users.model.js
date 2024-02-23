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
            else return {
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

async function getAllAccountsForUser(userId) {
    try{
        // Connect To DB
        await mongoose.connect(process.env.DB_URL);
        // Check If Email Is Exist
        const user = await userModel.findById(userId);
        await mongoose.disconnect();
        if (user) {
            const { getBalance } = require("../global/functions");
            let allAccounts = [];
            for(let account of user.accounts) {
                allAccounts.push({
                    currencyName: account.currencyName,
                    network: account.network,
                    address: account.address,
                    balance: await getBalance(account.network, account.currencyName, account.address),
                });
            }
            return {
                msg: `Get All Account For User Id: ${userId} Process Has Been Successfully !!`,
                error: false,
                data: allAccounts,
            };
        } else {
            return {
                msg: `Sorry User Id: ${userId} Not Found !!`,
                error: true,
                data: [],
            };
        }
    }
    catch(err) {
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
                headers: { 'TRON-PRO-API-KEY': process.env.TRON_NODE_API_KEY},
            });
            const tronAccount = await tronWeb.createAccount();
            const { Web3 } = require("web3");
            const web3ForEthereum = new Web3(process.env.ETHEREUM_NODE_BASE_API_URL);
            const ethereumAccount = web3ForEthereum.eth.accounts.create();
            const web3ForPolygon = new Web3(process.env.POLYGON_NODE_BASE_API_URL);
            const polygonAccount = web3ForPolygon.eth.accounts.privateKeyToAccount(ethereumAccount.privateKey);
            const web3ForBSC = new Web3(process.env.BINANCE_SMART_CHAIN_NODE_BASE_API_URL);
            const bscAccount = web3ForBSC.eth.accounts.privateKeyToAccount(ethereumAccount.privateKey);
            const newUser = new userModel({
                email,
                password: await bcrypt.hash(generatedPassword, 10),
                secretCode: await bcrypt.hash(generatedSecretCode, 10),
                accountName,
                accounts: [
                    {
                        network: "TRON",
                        address: tronAccount.address.base58,
                        privateKey: tronAccount.privateKey,
                    },
                    {
                        network: "ETHEREUM",
                        address: ethereumAccount.address,
                        privateKey: ethereumAccount.privateKey,
                    },
                    {
                        network: "POLYGON",
                        address: polygonAccount.address,
                        privateKey: polygonAccount.privateKey,
                    },
                    {
                        network: "BSC",
                        address: bscAccount.address,
                        privateKey: bscAccount.privateKey,
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
            return { msg: "Ok !!, Create New User Is Successfuly !!", error: false, data: {
                _id: newUserData._id,
                email,
                password: generatedPassword,
                secretCode: generatedSecretCode,
                accountName,
            }};
        }
    }
    catch (err) {
        // Disconnect In DB
        await mongoose.disconnect();
        throw Error(err);
    }
}

async function sendMoney(transactionData){
    try{
        // Connect To DB
        await mongoose.connect(process.env.DB_URL);
        // Check If Email Is Exist
        const user = await userModel.findOne({ _id: transactionData._id });
        if (user) {
            switch(user.network) {

            }
        }
    }
    catch(err) {
        // Disconnect In DB
        await mongoose.disconnect();
        throw Error(err);
    }
}

module.exports = {
    login,
    getAllAccountsForUser,
    createNewUser,
    sendMoney,
}