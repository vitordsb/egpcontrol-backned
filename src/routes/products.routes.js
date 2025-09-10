const express = require("express");
const router = express.Router();
const productsController = require("../controllers/products.controller");
const { authenticateToken } = require("../utils/auth");

router.get("/:id/produtos", productsController.getProductsByPedidoId);
router.post(
  "/:id/produtos",
  authenticateToken,
  productsController.addProductToPedido,
);
router.delete(
  "/:id/produtos/:productId",
  authenticateToken,
  productsController.removeProductFromPedido,
);

module.exports = router;
