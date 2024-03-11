const transferFeesRouter = require("express").Router();

const transferFeesController = require("../controllers/transfer_fees.controller");

transferFeesRouter.get("/fee-by-transfer-info", transferFeesController.getfeeByTransferInfo);

module.exports = transferFeesRouter;