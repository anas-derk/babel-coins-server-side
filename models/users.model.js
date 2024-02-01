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
        console.log(err);
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
            const newUser = new userModel({
                email,
                password: await bcrypt.hash(generatedPassword, 10),
                secretCode: await bcrypt.hash(generatedSecretCode, 10),
                accountName,
                accounts: [
                    {
                        currencyName: "TRX",
                        network: "TRON",
                        address: tronAccount.address.base58,
                        privateKey: tronAccount.privateKey,
                    },
                    {
                        currencyName: "USDT",
                        network: "TRON",
                        address: tronAccount.address.base58,
                        privateKey: tronAccount.privateKey,
                    },
                ],
            });
            // Save The New User As Document In User Collection
            await newUser.save();
            // Disconnect In DB
            await mongoose.disconnect();
            return { msg: "Ok !!, Create New User Is Successfuly !!", error: false, data: {
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

module.exports = {
    login,
    getAllAccountsForUser,
    createNewUser,
}