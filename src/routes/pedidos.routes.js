import { Router } from "express";
import pedidosController from "../controllers/pedidos.controller.js";
import { authenticateToken } from "../utils/auth.js";

const router = Router();

router.get("/", pedidosController.getPedidos);
router.post("/", authenticateToken, pedidosController.createPedido);
router.put("/:id", authenticateToken, pedidosController.updatePedido);
router.patch("/:id/status", pedidosController.updatePedidoStatus);
router.delete("/:id", authenticateToken, pedidosController.deletePedido);

export default router;
