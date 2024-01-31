async function getUserLogin(req, res) {
    try{

    }
    catch(err) {
        await res.status(500).json(err);
    }
}

async function postCreateUserAccount(req, res) {
    try{
        const email = req.body.email;
        // Start Handle Email Value To Check It Before Save In DB
        const { isEmail } = require("../global/functions");
        // Check If Email, Password And Country Are Exist
        if (email.length > 0) {
            // Check If Email Valid
            if (isEmail(email)) {
                const { createNewUser } = require("../models/users.model");
                const result = await createNewUser(email.toLowerCase());
                await res.json(result);
            }
            else {
                // Return Error Msg If Email Is Not Valid
                await res.status(400).json("Error, This Is Not Email Valid !!");
            }
        } else {
            await res.status(400).json("Error, Please Send The Email !!");
        }
    }
    catch(err) {
        console.log(err);
        await res.status(500).json(err);
    }
}

module.exports = {
    getUserLogin,
    postCreateUserAccount,
}