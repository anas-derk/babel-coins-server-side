// Import Mongoose

const mongoose = require("mongoose");

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
            currencyName: {
                type: String,
                required: true,
            },
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
            balance: {
                type: Number,
                default: 0,
            },
        }
    ],
    isVerified: {
        type: String,
        default: false,
    },
    createdDate: {
        type: Date,
        default: Date.now(),
    }
});

// Create User Model From User Schema

const userModel = mongoose.model("user", userSchema);

module.exports = {
    mongoose,
    userModel,
}