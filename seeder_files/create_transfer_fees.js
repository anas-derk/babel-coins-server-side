require("dotenv").config({ path: "../.env" });

const mongoose = require("mongoose");

// Create Transfer Fees Schema

const transferFeesShema = mongoose.Schema({
    transferType: {
        type: String,
        required: true,
    },
    transferCurrencyType: {
        type: String,
        required: true,
    },
    network: String,
    currencyName: {
        type: String,
        required: true,
    },
    symbol: {
        type: String,
        required: true,
    },
    fee: {
        type: Number,
        required: true,
    },
});

// Create Fees Model From Fees Schema

const transferFeesModel = mongoose.model("transfer_fees", transferFeesShema);

const transfer_fees_list = [
    {
        transferType: "internal",
        transferCurrencyType: "fiat",
        currencyName: "United States dollar",
        symbol: "USD",
        fee: 0,
    },
    {
        transferType: "external",
        transferCurrencyType: "fiat",
        currencyName: "United States dollar",
        symbol: "USD",
        fee: 0,
    },
    {
        transferType: "internal",
        transferCurrencyType: "fiat",
        currencyName: "Euro",
        symbol: "EUR",
        fee: 0,
    },
    {
        transferType: "external",
        transferCurrencyType: "fiat",
        currencyName: "Euro",
        symbol: "EUR",
        fee: 0,
    },
    {
        transferType: "internal",
        transferCurrencyType: "crypto",
        network: "TRON",
        currencyName: "TRX",
        symbol: "TRX",
        fee: 0.8,
    },
    {
        transferType: "external",
        transferCurrencyType: "crypto",
        network: "TRON",
        currencyName: "TRX",
        symbol: "TRX",
        fee: 0.8,
    },
    {
        transferType: "internal",
        transferCurrencyType: "crypto",
        network: "TRON",
        currencyName: "USDT",
        symbol: "USDT",
        fee: 0,
    },
    {
        transferType: "external",
        transferCurrencyType: "crypto",
        network: "TRON",
        currencyName: "USDT",
        symbol: "USDT",
        fee: 4,
    },
    {
        transferType: "internal",
        transferCurrencyType: "crypto",
        network: "ETHEREUM",
        currencyName: "ETHER",
        symbol: "ETH",
        fee: 0.0029,
    },
    {
        transferType: "external",
        transferCurrencyType: "crypto",
        network: "ETHEREUM",
        currencyName: "ETHER",
        symbol: "ETH",
        fee: 0.0029,
    },
    {
        transferType: "internal",
        transferCurrencyType: "crypto",
        network: "ETHEREUM",
        currencyName: "USDT",
        symbol: "USDT",
        fee: 0,
    },
    {
        transferType: "external",
        transferCurrencyType: "crypto",
        network: "ETHEREUM",
        currencyName: "USDT",
        symbol: "USDT",
        fee: 4,
    },
    {
        transferType: "internal",
        transferCurrencyType: "crypto",
        network: "POLYGON",
        currencyName: "MATIC",
        symbol: "MATIC",
        fee: 0.1,
    },
    {
        transferType: "external",
        transferCurrencyType: "crypto",
        network: "POLYGON",
        currencyName: "MATIC",
        symbol: "MATIC",
        fee: 0.1,
    },
    {
        transferType: "internal",
        transferCurrencyType: "crypto",
        network: "POLYGON",
        currencyName: "USDT",
        symbol: "USDT",
        fee: 0,
    },
    {
        transferType: "external",
        transferCurrencyType: "crypto",
        network: "POLYGON",
        currencyName: "USDT",
        symbol: "USDT",
        fee: 4,
    },
    {
        transferType: "internal",
        transferCurrencyType: "crypto",
        network: "BSC",
        currencyName: "BNB",
        symbol: "BNB",
        fee: 0.0005,
    },
    {
        transferType: "external",
        transferCurrencyType: "crypto",
        network: "BSC",
        currencyName: "BNB",
        symbol: "BNB",
        fee: 0.0005,
    },
    {
        transferType: "internal",
        transferCurrencyType: "crypto",
        network: "BSC",
        currencyName: "USDT",
        symbol: "USDT",
        fee: 0,
    },
    {
        transferType: "external",
        transferCurrencyType: "crypto",
        network: "BSC",
        currencyName: "USDT",
        symbol: "USDT",
        fee: 4,
    },
];

async function create_transfer_fees_list() {
    try {
        await mongoose.connect(process.env.DB_URL);
        await transferFeesModel.insertMany(transfer_fees_list);
        return "Creating Transfer Fees List Process Has Been Successfully !!";
    } catch(err) {
        await mongoose.disconnect();
        throw Error(err);
    }
}

create_transfer_fees_list().then((result) => console.log(result));