import { Router } from "express";
import {
  getEmpresa,
  updateEmpresa,
  uploadFotoEmpresa,
} from "../controllers/empresaController";
import { uploadFotoMiddleware } from "../middlewares/uploadFotoMiddleware";
import { autenticarToken } from "../middlewares/authMiddleware";
import { validarEntradaUpdateEmpresa } from "../middlewares/empresaMiddleware";

const router = Router();

router.get("/companyPerfil", autenticarToken, getEmpresa);
router.put("/update/company", autenticarToken, validarEntradaUpdateEmpresa, updateEmpresa);
// Rota para upload de fotos da empresa usando o midleware para uma unica foto
router.post("/company/upload-foto", autenticarToken, uploadFotoMiddleware, uploadFotoEmpresa);

export default router;
