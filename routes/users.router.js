const usersRouter = require("express").Router();

usersRouter.get("/login", usersController.getUserLogin);

module.exports = usersRouter;