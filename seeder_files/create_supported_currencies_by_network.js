require("dotenv").config({ path: "../.env" });

const mongoose = require("mongoose");

// Create Supported Currencies By Networks Schema

const supportedCurrenciesByNetworks = mongoose.Schema({
    networks: {
        type: Array,
        required: true,
    },
    currencyName: {
        type: String,
        required: true,
    },
    symbol: {
        type: String,
        required: true,
    },
});

// Create Supported Currencies By Networks Model From Supported Currencies By Networks Schema

const supportedCurrenciesByNetworksModel = mongoose.model("supported_currencies_by_networks", supportedCurrenciesByNetworks);

const supported_currencies_by_networks_list = [
    {
        currencyName: "USDT",
        symbol: "USDT",
        networks: ["TRON", "ETHEREUM", "POLYGON", "BSC"],
    },
    {
        currencyName: "TRX",
        symbol: "TRX",
        networks: ["TRON"],
    },
    {
        currencyName: "MATIC",
        symbol: "MATIC",
        networks: ["POLYGON"],
    },
    {
        currencyName: "ETHER",
        symbol: "ETH",
        networks: ["ETHEREUM"],
    },
    {
        currencyName: "BNB",
        symbol: "BNB",
        networks: ["BSC"],
    },
];

async function create_supported_currencies_by_networks_list() {
    try {
        await mongoose.connect(process.env.DB_URL);
        await supportedCurrenciesByNetworksModel.insertMany(supported_currencies_by_networks_list);
        return "Create Supported Currencies By Networks List Process Has Been Successfully !!";
    } catch(err) {
        await mongoose.disconnect();
        throw Error(err);
    }
}

create_supported_currencies_by_networks_list().then((result) => console.log(result));