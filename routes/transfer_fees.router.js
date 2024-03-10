const transferFeesRouter = require("express").Router();

const transferFeesController = require("../controllers/transfer_fees.controller");

transferFeesRouter.get("/fee-by-currency-and-network-name", transferFeesController.getFeeByCurrencyAndNetworkName);

module.exports = transferFeesRouter;