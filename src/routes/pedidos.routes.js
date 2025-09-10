const express = require("express");
const router = express.Router();
const pedidosController = require("../controllers/pedidos.controller");
const { authenticateToken } = require("../utils/auth");

router.get("/", pedidosController.getPedidos);
router.post("/", authenticateToken, pedidosController.createPedido);
router.put("/:id", authenticateToken, pedidosController.updatePedido);
router.patch("/:id/status", pedidosController.updatePedidoStatus);

module.exports = router;


