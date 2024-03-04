function isEmail(email) {
    return email.match(/[^\s@]+@[^\s@]+\.[^\s@]+/);
}

function transporterObj() {
    const nodemailer = require('nodemailer');
    // إنشاء ناقل بيانات لسيرفر SMTP مع إعداده 
    const transporter = nodemailer.createTransport({
        host: "smtp.titan.email",
        port: 465,
        secure: true,
        requireTLS: true,
        auth: {
            user: "info@asfourintlco.com",
            pass: "Asfour@intlco3853",
        }
    });
    return transporter;
}

const { join } = require("path");
const { readFileSync } = require("fs");
const { compile } = require("ejs");

function sendCodeToUserEmail(email) {
    const CodeGenerator = require('node-code-generator');
    const generator = new CodeGenerator();
    const generatedCode = generator.generateCodes("####")[0];
    const templateContent =  readFileSync(join(__dirname, "..", "assets", "email_template.ejs"), "utf-8");
    const compiledTemplate = compile(templateContent);
    const htmlContentAfterCompilingEjsTemplateFile = compiledTemplate({ generatedCode });
    // إعداد الرسالة قبل إرسالها
    const mailConfigurations = {
        from: "info@asfourintlco.com",
        to: email,
        subject: "Account Verification Code On Asfour International Store",
        html: htmlContentAfterCompilingEjsTemplateFile,
    };
    return new Promise((resolve, reject) => {
        // إرسال رسالة الكود إلى الإيميل
        transporterObj().sendMail(mailConfigurations, function (error, info) {
            // في حالة حدث خطأ في الإرسال أرجع خطأ
            if (error) reject(error);
            // في حالة لم يحدث خطأ أعد الكود المولد
            resolve(generatedCode);
        });
    });
}

async function getBalanceOnBlockChain(network, currency, accountAddress) {
    try {
        let balance = 0;
        if (network === "TRON") {
            const TronWeb = require("tronweb");
            const tronWeb = new TronWeb({
                fullHost: process.env.TRON_NODE_BASE_API_URL,
                headers: { 'TRON-PRO-API-KEY': process.env.TRON_NODE_API_KEY},
                privateKey: "U2FsdGVkX1+1Mwk+Z1WajOhZVUbJnJNHVZHsyiVW5pUv5fjTTj7AZOuLlyJgafbq3YbMysrErZaGz/7NSw/TKSRBemxIDJjzwQhIS6QwpALvY/ZndVE0GYXS2hmP+Y9P",
            });
            switch (currency) {
                case "TRX": {
                    const result = await tronWeb.trx.getBalance(accountAddress);
                    balance = await tronWeb.fromSun(result.toString(10));
                    break;
                }
                case "USDT": {
                    const abi = [{ "outputs": [{ "type": "uint256" }], "constant": true, "inputs": [{ "name": "who", "type": "address" }], "name": "balanceOf", "stateMutability": "View", "type": "Function" }, { "outputs": [{ "type": "bool" }], "inputs": [{ "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transfer", "stateMutability": "Nonpayable", "type": "Function" }];
                    const contract = await tronWeb.contract(abi, "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t");
                    const result = await contract.balanceOf(accountAddress).call();
                    balance = await tronWeb.fromSun(result.toString(10));
                    break;
                }
            }
            return balance;
        }
        return balance;
    }
    catch (err) {
        throw Error(err);
    }
}

async function sendMoneyOnBlockChain(network, currency, senderAddress, receipentAddress, amount, senderPrivateKey){
    try{
        if (network === "ETHEREUM" || network === "POLYGON" || network === "BSC") {
            const { Web3 } = require("web3");
            const web3 = new Web3(`${process.env.ETHEREUM_NODE_BASE_API_URL}/${process.env.ETHEREUM_NODE_API_KEY}`);
            const gasPriceInWei = await web3.eth.getGasPrice();
            switch(currency) {
                case "ether": {
                    const signedTx = await web3.eth.accounts.signTransaction({
                        from: senderAddress,
                        to: receipentAddress,
                        value: web3.utils.toWei(amount, currency),
                        gasPrice: gasPriceInWei,
                        gasLimit: 21000
                    }, senderPrivateKey);
                    return await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
                }
                case "usdt": {
                    const { USDT_CONTRACT_ADDRESS_ON_ETHEREUM, USDT_CONTRACT_ABI_ON_ETHEREUM } = require("./data");
                    const usdtContractOnEthereeum = new web3.eth.Contract(USDT_CONTRACT_ABI_ON_ETHEREUM, USDT_CONTRACT_ADDRESS_ON_ETHEREUM);
                    const signedTx = await web3.eth.accounts.signTransaction({
                        from: senderAddress,
                        to: receipentAddress,
                        gasPrice: gasPriceInWei,
                        gasLimit: 21000,
                    }, senderPrivateKey);
                    return await usdtContractOnEthereeum.methods
                                .transfer(receipentAddress, amount * 10 ** 6)
                                .send(signedTx);
                }
            }
        }
        if (network === "TRON") {
            const TronWeb = require("tronweb");
            const tronWeb = new TronWeb({
                fullHost: process.env.TRON_NODE_BASE_API_URL,
                headers: { 'TRON-PRO-API-KEY': process.env.TRON_NODE_API_KEY },
                privateKey: "U2FsdGVkX1+1Mwk+Z1WajOhZVUbJnJNHVZHsyiVW5pUv5fjTTj7AZOuLlyJgafbq3YbMysrErZaGz/7NSw/TKSRBemxIDJjzwQhIS6QwpALvY/ZndVE0GYXS2hmP+Y9P",
            });
            switch(currency){
                case "trx": {
                    const unsignedTransaction = await tronWeb.transactionBuilder.sendTrx(receipentAddress, tronWeb.toSun(amount), senderAddress);
                    const signedTx = await tronWeb.trx.sign(unsignedTransaction, senderPrivateKey);
                    return await tronWeb.trx.sendRawTransaction(signedTx);
                }
                case "usdt": {
                    const { USDT_CONTRACT_ADDRESS_ON_TRON } = require("./data");
                    const unsignedTransaction = await tronWeb.transactionBuilder.triggerSmartContract(
                        USDT_CONTRACT_ADDRESS_ON_TRON,
                        "transfer(address,uint256)",
                        {},
                        [{ type:"address", value: receipentAddress }, { type: "uint256", value: amount * 10 ** 6 }],
                        senderAddress,
                    );
                    const signedTx = await tronWeb.trx.sign(unsignedTransaction.transaction, senderPrivateKey);
                    return await tronWeb.trx.sendRawTransaction(signedTx);
                }
            }
        }
        return "Sorry, Invalid Network Name !!";
    }
    catch(err){
        throw Error(err);
    }
}

async function createNewSubscriptionInTatumNotificationsService(eventType, address, chain, userId) {
    try{
        const { post } = require("axios");
        const res = await post(`${process.env.TATUM_BASE_API_URL}/subscription?type=mainnet`, {
            type: eventType,
            attr: {
                address,
                chain,
                url: `https://api.babelcoins.com/users/receive-money-on-wallet?address=${address}&chain=${chain}&userId=${userId}`
            },
        }, {
            headers: {
                "Content-Type": "application/json",
                "x-api-key": process.env.TATUM_API_KEY
            }
        });
        return await res.data.id;
    }
    catch(err) {
        throw Error(err);
    }
}

function getReponseObject(msg, isError, data) {
    return {
        msg,
        error: isError,
        data,
    }
}

module.exports = {
    isEmail,
    sendCodeToUserEmail,
    getBalanceOnBlockChain,
    sendMoneyOnBlockChain,
    createNewSubscriptionInTatumNotificationsService,
    getReponseObject,
}