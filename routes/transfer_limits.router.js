const transferLimitsRouter = require("express").Router();

const transferLimitsController = require("../controllers/transfer_limits.controller");

transferLimitsRouter.get("/trasfer-limits-by-transfer-info", transferLimitsController.getTransferLimitsByTransferInfo);

module.exports = transferLimitsRouter;