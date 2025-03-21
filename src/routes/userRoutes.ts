import { Router } from "express";
import { getUser, updateUser } from "../controllers/userController"
import { validarEntradaUpdateUser } from "../middlewares/userMiddleware";
import { autenticarToken } from "../middlewares/authMiddleware";

const router = Router();

router.put("/update/user", autenticarToken, validarEntradaUpdateUser, updateUser)
router.get("/userPerfil", autenticarToken, getUser)

export default router;