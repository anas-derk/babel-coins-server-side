// Import Mongoose

const { mongoose } = require("../server");

// Create User Schema

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    secretCode: {
        type: String,
        required: true,
    },
    accountName: {
        type: String,
        default: "",
    },
    firstName: {
        type: String,
        default: "",
    },
    lastName: {
        type: String,
        default: "",
    },
    country: {
        type: String,
        default: "Syria",
    },
    accounts: [
        {
            network: {
                type: String,
                required: true,
            },
            address: {
                type: String,
                required: true,
            },
            privateKey: {
                type: String,
                required: true,
            },
        }
    ],
    balances: [
        {
            currencyName: {
                type: String,
                required: true,
            },
            network: {
                type: String,
                required: true,
            },
            symbol: {
                type: String,
                required: true,
            },
            validDepositeBalance: {
                type: Number,
                default: 0,
            },
            invalidDepositeBalance: {
                type: Number,
                default: 0,
            }
        }
    ],
    subscriptionIds: [
        {
            subscriptionIdForFungibleTokensIncoming: {
                type: String,
                default: "",
            },
            subscriptionIdForNativeIncoming: {
                type: String,
                default: "",
            },
        }
    ],
    isVerified: {
        type: Boolean,
        default: false,
    },
    createdDate: {
        type: Date,
        default: Date.now(),
    },
    dateOfLastLogin: {
        type: Date,
        default: Date.now(),
    },
    lastTransactionId: {
        type: String,
        default: "",
    }
});

// Create User Model From User Schema

const userModel = mongoose.model("user", userSchema);

// Create Account Verification Codes Schema

const accountVerificationCodesShema = mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
});

// Create Account Verification Codes Model From Account Codes Schema

const accountVerificationCodesModel = mongoose.model("account_verification_codes", accountVerificationCodesShema);

// Create Minimum Deposit Limits Schema

const minimumDepositLimitsShema = mongoose.Schema({
    depositType: {
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

module.exports = {
    mongoose,
    userModel,
    accountVerificationCodesModel,
    minimumDepositLimitsModel,
    supportedCurrenciesByNetworksModel,
}