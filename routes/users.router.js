const usersRouter = require("express").Router();

const usersController = require("../controllers/users.controller");

const userMiddleWares = require("../middlewares/global.middlewares");

usersRouter.get("/login", usersController.getUserLogin);

usersRouter.get("/user-info", userMiddleWares.validateJWT, usersController.getUserInfo);

usersRouter.get("/all-balances", userMiddleWares.validateJWT, usersController.getAllBalances);

usersRouter.get("/addresses-by-currency-name", userMiddleWares.validateJWT, usersController.getAddressesByCurrenecyName);

usersRouter.post("/create-new-account", usersController.postCreateUserAccount);

usersRouter.post("/send-account-verification-code", usersController.postAccountVerificationCode);

usersRouter.post("/send-money", userMiddleWares.validateJWT, usersController.postSendMoney);

usersRouter.post("/receive-money-on-wallet", usersController.postReceiveMoneyOnWallet);

usersRouter.put("/update-user-info", userMiddleWares.validateJWT, usersController.putUpdateUserInfo);

module.exports = usersRouter;