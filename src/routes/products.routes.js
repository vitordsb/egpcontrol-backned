import { Router } from "express";
import productsController from "../controllers/products.controller.js";
import { authenticateToken } from "../utils/auth.js";

const router = Router();

router.get("/:id/produtos", productsController.getProductsByPedidoId);

router.post(
  "/:id/produtos",
  authenticateToken,
  productsController.addProductToPedido,
);

router.delete(
  "/:id/produtos/:productId",
  authenticateToken,
  productsController.deleteProductToPedido,
);

export default router;
