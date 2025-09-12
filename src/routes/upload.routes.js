import { Router } from "express";
import multer from "multer";
import xmlController from "../controllers/upload.controller.js";

const router = Router();
const upload = multer({ dest: "uploads/" });

router.post(
  "/upload-xml",
  upload.single("file"),
  xmlController.uploadXmlPedido,
);

export default router;
