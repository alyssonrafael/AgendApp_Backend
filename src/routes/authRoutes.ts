import { Router } from "express";
import {
  forgotPassword,
  loginEmpresa,
  loginUser,
  registerEmpresa,
  registerUser,
  resetPassword,
} from "../controllers/authController";
import passport from "../config/passport";
import { googleAuthCallback } from "../controllers/authController";

const router = Router();
// auth user
router.post("/register/user", registerUser);
router.post("/login/user", loginUser);
//auth empresa
router.post("/register/company", registerEmpresa);
router.post("/login/company", loginEmpresa);

// Iniciar login com Google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
// Callback após login com Google
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  googleAuthCallback
);

// recuperaaçao de senha
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
