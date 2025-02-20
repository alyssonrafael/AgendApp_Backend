import { Router } from "express";
import {
  getEmpresa,
  updateEmpresa,
  uploadFotoEmpresa,
} from "../controllers/empresaController";
import { uploadFotoMiddleware } from "../middlewares/uploadFotoMiddleware";

const router = Router();

router.get("/companyPerfil", getEmpresa);
router.put("/update/company", updateEmpresa);
// Rota para upload de fotos da empresa usando o midleware para uma unica foto
router.post("/company/upload-foto", uploadFotoMiddleware, uploadFotoEmpresa);

export default router;
