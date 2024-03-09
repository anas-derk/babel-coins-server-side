const currenciesRouter = require("express").Router();

const currenciesController = require("../controllers/currencies.controller");

currenciesRouter.get("/all-supported-currencies-by-networks", currenciesController.getAllSupportedCurrenciesByNetworks);

module.exports = currenciesRouter;