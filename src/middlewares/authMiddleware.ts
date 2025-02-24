import { Request, Response, NextFunction } from "express";
import { decodeToken } from "../services/authService";

export const autenticarToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
     res.status(401).json({ error: "Token not provided." });
     return
  }

  const decoded = decodeToken(token);

  if (!decoded || typeof decoded !== "object" || !("id" in decoded)) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }

  // Se precisar acessar o conteúdo do payload nas rotas que vao usar o midlleware
  (req as any).usuario = decoded;

  next();
};
