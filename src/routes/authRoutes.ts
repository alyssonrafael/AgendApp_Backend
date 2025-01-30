import { Router } from 'express';
import { loginEmpresa, loginUser, registerEmpresa, registerUser } from '../controllers/authController';
import passport from "../config/passport";
import { googleAuthCallback } from "../controllers/authController";

const router = Router();
// auth user
router.post('/register/user', registerUser);
router.post('/login/user', loginUser);
//auth empresa
router.post('/register/enterprise', registerEmpresa);
router.post('/login/enterprise', loginEmpresa);

// Iniciar login com Google
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
// Callback após login com Google
router.get("/google/callback", passport.authenticate("google", { session: false }), googleAuthCallback);


export default router;
