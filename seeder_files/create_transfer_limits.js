require("dotenv").config({ path: "../.env" });

const mongoose = require("mongoose");

// Create Transfer Limits Schema

const transferLimitsShema = mongoose.Schema({
    transferType: {
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
    minInOneTime: {
        type: Number,
        required: true,
    },
    maxInOneTime: {
        type: Number,
        required: true,
    },
    maxIn24Hours: {
        type: Number,
        required: true,
    },
});

// Create Transfer Limits Model From Transfer Limits Schema

const transferLimitsModel = mongoose.model("transfer_limits", transferLimitsShema);

const transfer_limits_list = [
    {
        transferType: "fiat",
        currencyName: "United States dollar",
        symbol: "USD",
        minInOneTime: 5,
        maxInOneTime: 1000,
        maxIn24Hours: 10000,
    },
    {
        transferType: "fiat",
        currencyName: "Euro",
        symbol: "EUR",
        minInOneTime: 5,
        maxInOneTime: 1000,
        maxIn24Hours: 10000,
    },
    {
        transferType: "crypto",
        network: "TRON",
        currencyName: "TRX",
        symbol: "TRX",
        minInOneTime: 20,
        maxInOneTime: 1000,
        maxIn24Hours: 10000,
    },
    {
        transferType: "crypto",
        network: "TRON",
        currencyName: "USDT",
        symbol: "USDT",
        minInOneTime: 5,
        maxInOneTime: 1000,
        maxIn24Hours: 10000,
    },
    {
        transferType: "crypto",
        network: "ETHEREUM",
        currencyName: "ETHER",
        symbol: "ETH",
        minInOneTime: 0.01,
        maxInOneTime: 1,
        maxIn24Hours: 4,
    },
    {
        transferType: "crypto",
        network: "ETHEREUM",
        currencyName: "USDT",
        symbol: "USDT",
        minInOneTime: 5,
        maxInOneTime: 1000,
        maxIn24Hours: 10000,
    },
    {
        transferType: "crypto",
        network: "POLYGON",
        currencyName: "MATIC",
        symbol: "MATIC",
        minInOneTime: 0.11,
        maxInOneTime: 1000,
        maxIn24Hours: 10000,
    },
    {
        transferType: "crypto",
        network: "POLYGON",
        currencyName: "USDT",
        symbol: "USDT",
        minInOneTime: 5,
        maxInOneTime: 1000,
        maxIn24Hours: 10000,
    },
    {
        transferType: "crypto",
        network: "BSC",
        currencyName: "BNB",
        symbol: "BNB",
        minInOneTime: 0.01,
        maxInOneTime: 1000,
        maxIn24Hours: 10000,
    },
    {
        transferType: "crypto",
        network: "BSC",
        currencyName: "USDT",
        symbol: "USDT",
        minInOneTime: 5,
        maxInOneTime: 1000,
        maxIn24Hours: 10000,
    },
];

async function create_transfer_limits_list() {
    try {
        await mongoose.connect(process.env.DB_URL);
        await transferLimitsModel.insertMany(transfer_limits_list);
        return "Creating Transfer Limits List Process Has Been Successfully !!";
    } catch(err) {
        await mongoose.disconnect();
        throw Error(err);
    }
}

create_transfer_limits_list().then((result) => console.log(result));