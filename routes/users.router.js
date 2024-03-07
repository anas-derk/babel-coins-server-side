const usersRouter = require("express").Router();

const usersController = require("../controllers/users.controller");

usersRouter.get("/login", usersController.getUserLogin);

usersRouter.get("/is-logged", usersController.getIfUserIsLogged);

usersRouter.get("/all-balances", usersController.getAllBalances);

usersRouter.get("/addresses-by-currency-name", usersController.getAddressesByCurrenecyName);

usersRouter.post("/create-new-account", usersController.postCreateUserAccount);

usersRouter.post("/update-user-data", usersController.putUpdateUserData);

usersRouter.post("/send-account-verification-code", usersController.postAccountVerificationCode);

usersRouter.post("/send-money", usersController.postSendMoney);

usersRouter.post("/receive-money-on-wallet", usersController.postReceiveMoneyOnWallet);

module.exports = usersRouter;