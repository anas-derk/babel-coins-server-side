const transferLimitsRouter = require("express").Router();

const transferLimitsController = require("../controllers/transfer_limits.controller");

transferLimitsRouter.get("/trasfer-limits-by-currency-and-network-name", transferLimitsController.getTransferLimitsByCurrencyAndNetworkName);

module.exports = transferLimitsRouter;