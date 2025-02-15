import { Router } from "express";
import { updateUser } from "../controllers/userController"

const router = Router();

router.put("/update/user", updateUser)

export default router;