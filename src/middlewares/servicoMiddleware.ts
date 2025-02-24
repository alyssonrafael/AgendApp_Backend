import { Request, Response, NextFunction } from "express";

export const validarEntradaServico = (req: Request, res: Response, next: NextFunction) => {
  const { nome, descricao, duracao, custo } = req.body;

  // Validações de entrada
  if (!nome || typeof nome !== "string") {
     res.status(400).json({ error: "The service name is required and must be a string." });
     return
  }

  if (descricao && typeof descricao !== "string") {
    res.status(400).json({ error: "The description, if provided, must be a string." });
    return
  }

  if (duracao === undefined || typeof duracao !== "number" || duracao <= 0) {
     res.status(400).json({ error: "Service duration is mandatory and must be a positive number." });
    return
  }

  if (custo === undefined || typeof custo !== "number" || custo <= 0) {
     res.status(400).json({ error: "The service cost is mandatory and must be a positive number." });
     return
  }

  // Passa para o próximo middleware (controlador)
  next();
};
