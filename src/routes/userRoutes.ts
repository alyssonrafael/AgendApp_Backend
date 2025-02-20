import { Router } from "express";
import { getUser, updateUser } from "../controllers/userController"

const router = Router();

router.put("/update/user", updateUser)
router.get("/userPerfil", getUser)

export default router;