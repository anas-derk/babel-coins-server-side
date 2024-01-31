const usersRouter = require("express").Router();

const usersController = require("../controllers/users.controller");

usersRouter.get("/login", usersController.getUserLogin);

usersRouter.post("/create-new-account", usersController.postCreateUserAccount);

module.exports = usersRouter;