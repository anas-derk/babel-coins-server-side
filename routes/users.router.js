const usersRouter = require("express").Router();

const usersController = require("../controllers/users.controller");

usersRouter.get("/login", usersController.getUserLogin);

usersRouter.get("/all-accounts/:userId", usersController.getAllAccounts);

usersRouter.post("/create-new-account", usersController.postCreateUserAccount);

usersRouter.post("/update-user-data", usersController.putUpdateUserData);

usersRouter.post("/send-money", usersController.postSendMoney);

module.exports = usersRouter;