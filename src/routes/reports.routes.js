import { Router } from "express";
import reportsController from "../controllers/reports.controller.js";

const router = Router();

router.get("/relatorio-compras", reportsController.getRelatorioCompras);

export default router;
