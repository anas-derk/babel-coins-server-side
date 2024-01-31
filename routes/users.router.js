const usersRouter = require("express").Router();

const usersController = require("../controllers/users.controller");

usersRouter.get("/login", usersController.getUserLogin);

usersRouter.post("/sign-up", usersController.postUserSignUp);

module.exports = usersRouter;