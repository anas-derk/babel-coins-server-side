// Import Mongoose And User Model Object

const { mongoose, userModel } = require("../models/all.models");

// require bcryptjs module for password encrypting

const bcrypt = require("bcryptjs");

// Define Create New User Function

async function createNewUser(email) {
    try {
        // Connect To DB
        await mongoose.connect(process.env.DB_URL);
        // Check If Email Is Exist
        const user = await userModel.findOne({ email });
        if (user) {
            await mongoose.disconnect();
            return "Sorry, Can't Create User Because it is Exist !!";
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
            return { msg: "Ok !!, Create New User Is Successfuly !!", data: {
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
    createNewUser,
}