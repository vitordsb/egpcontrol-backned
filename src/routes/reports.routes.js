const express = require("express");
const router = express.Router();
const reportsController = require("../controllers/reports.controller");

router.get("/relatorio-compras", reportsController.getRelatorioCompras);

module.exports = router;


