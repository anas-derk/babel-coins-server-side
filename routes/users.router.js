const usersRouter = require("express").Router();

const usersController = require("../controllers/users.controller");

usersRouter.get("/login", usersController.getUserLogin);

usersRouter.post("/create-new-account", usersController.postCreateUserAccount);

usersRouter.post("/update-user-data", usersController.putUpdateUserData);

module.exports = usersRouter;