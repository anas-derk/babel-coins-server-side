require("dotenv").config({ path: "../.env" });

const mongoose = require("mongoose");

// Create Minimum Deposit Limits Schema

const minimumDepositLimitsShema = mongoose.Schema({
    depositCurrencyType: {
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
    amount: {
        type: Number,
        required: true,
    },
});

// Create Minimum Deposit Limits From Minimum Deposit Limits Schema

const minimumDepositLimitsModel = mongoose.model("minimum_deposit_limits", minimumDepositLimitsShema);

const minimum_deposit_limits_list = [
    {
        depositCurrencyType: "fiat",
        currencyName: "United States dollar",
        symbol: "USD",
        amount: 10,
    },
    {
        depositCurrencyType: "fiat",
        currencyName: "Euro",
        symbol: "EUR",
        amount: 10,
    },
    {
        depositCurrencyType: "crypto",
        network: "TRON",
        currencyName: "TRX",
        symbol: "TRX",
        amount: 10,
    },
    {
        depositCurrencyType: "crypto",
        network: "ETHEREUM",
        currencyName: "ETHER",
        symbol: "ETH",
        amount: 0.002,
    },
    {
        depositCurrencyType: "crypto",
        network: "POLYGON",
        currencyName: "MATIC",
        symbol: "MATIC",
        amount: 5,
    },
    {
        depositCurrencyType: "crypto",
        network: "BSC",
        currencyName: "BNB",
        symbol: "BNB",
        amount: 0.009,
    },
    {
        depositCurrencyType: "crypto",
        network: "TRON,ETHEREUM,POLYGON,BSC",
        currencyName: "USDT",
        symbol: "USDT",
        amount: 10,
    },
];

async function create_minimum_deposit_limits_list() {
    try {
        await mongoose.connect(process.env.DB_URL);
        await minimumDepositLimitsModel.insertMany(minimum_deposit_limits_list);
        return "Create Minimum Deposit Limits List Process Has Been Successfully !!";
    } catch(err) {
        await mongoose.disconnect();
        throw Error(err);
    }
}

create_minimum_deposit_limits_list().then((result) => console.log(result));