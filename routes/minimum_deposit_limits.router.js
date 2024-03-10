const minimumDebositLimitsRouter = require("express").Router();

const minimumDebositLimitsController = require("../controllers/minimum_deposits_limit.controller");

minimumDebositLimitsRouter.get("/minimum-debosit-limits-by-currency-name", minimumDebositLimitsController.getMinimumDebositLimitsByCurrencyName);

module.exports = minimumDebositLimitsRouter;