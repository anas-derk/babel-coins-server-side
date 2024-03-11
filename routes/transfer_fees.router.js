const transferFeesRouter = require("express").Router();

const transferFeesController = require("../controllers/transfer_fees.controller");

transferFeesRouter.get("/fee-by-currency-name-and-transfer-type", transferFeesController.get_fee_by_currency_name_and_tranasfer_type);

module.exports = transferFeesRouter;