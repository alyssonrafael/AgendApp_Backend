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

export const validarEntradaUpdateServico = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { nome, descricao, duracao, custo } = req.body;

  // Validação do nome do serviço
  if (nome !== undefined) {
    if (typeof nome !== "string") {
      res.status(400).json({ error: "Service name must be a string" });
      return;
    }
    if (nome.trim() === "") {
      res.status(400).json({ error: "Service name cannot be empty" });
      return;
    }
  }

  // Validação da descrição do serviço
  if (descricao !== undefined) {
    if (typeof descricao !== "string") {
      res.status(400).json({ error: "Description must be a string" });
      return;
    }
    if (descricao.trim() === "") {
      res.status(400).json({ error: "Description cannot be empty" });
      return;
    }
  }

  // Validação da duração do serviço
  if (duracao !== undefined) {
    if (typeof duracao !== "number") {
      res
        .status(400)
        .json({ error: "Service duration must be a valid number" });
      return;
    }
    if (duracao < 1) {
      res
        .status(400)
        .json({ error: "The service must last longer than 1 minute" });
      return;
    }
  }

  // Validação do custo do serviço
  if (custo !== undefined) {
    if (typeof custo !== "number") {
      res.status(400).json({ error: "Service cost must be a valid number" });
      return;
    }
    if (custo <= 0) {
      res.status(400).json({
        error: "The service must have a cost greater than or equal to 0",
      });
      return;
    }
  }

   // Passa para o próximo middleware (controlador)
  next();
};
