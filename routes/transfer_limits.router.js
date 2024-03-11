const transferLimitsRouter = require("express").Router();

const transferLimitsController = require("../controllers/transfer_limits.controller");

transferLimitsRouter.get("/trasfer-limits-by-currency-name-and-transfer-type", transferLimitsController.get_transfer_limits_by_currency_name_and_tranasfer_type);

module.exports = transferLimitsRouter;