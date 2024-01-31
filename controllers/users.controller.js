async function getUserLogin(req, res) {
    try{

    }
    catch(err) {
        await res.status(500).json(err);
    }
}

async function postUserSignup(req, res) {
    try{

    }
    catch(err) {
        await res.status(500).json(err);
    }
}

module.exports = {
    getUserLogin,
    postUserSignup,
}