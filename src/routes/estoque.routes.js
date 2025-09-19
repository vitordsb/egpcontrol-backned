import { Router } from "express";
import estoqueController from "../controllers/estoque.controller.js";
import { authenticateToken } from "../utils/auth.js";

const router = Router();

router.get("/", estoqueController.getEstoque);
router.post("/", authenticateToken, estoqueController.addEstoque);
router.get("/detalhes", estoqueController.getDetalhesPorNome);
router.post("/retirar", authenticateToken, estoqueController.retirarEstoque);

export default router;
