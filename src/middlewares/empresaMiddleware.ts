import { Request, Response, NextFunction } from "express";

export const validarEntradaUpdateEmpresa = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    nomeEmpresa,
    description,
    password,
    newPassword,
    phoneNumber,
    address,
  } = req.body;

  // Validação do nome da empresa
  if (nomeEmpresa !== undefined && nomeEmpresa.trim() === "") {
    res.status(400).json({ error: "Company name cannot be empty" });
    return;
  }

  // Validação do número de telefone
  if (phoneNumber !== undefined && phoneNumber.trim() === "") {
    res.status(400).json({ error: "Phone number cannot be empty" });
    return;
  }

  // Validação do endereço
  if (address !== undefined) {
    if (address.trim() === "") {
      res.status(400).json({ error: "Address cannot be empty" });
      return;
    }
    if (address.length > 100) {
      res.status(400).json({ error: "Address cannot exceed 100 characters" });
      return;
    }
  }

  // Validação da descrição
  if (description !== undefined) {
    if (description.trim() === "") {
      res.status(400).json({ error: "Description cannot be empty" });
      return;
    }
    if (description.length > 500) {
      res.status(400).json({ error: "Description cannot exceed 500 characters" });
      return;
    }
  }

  // Validação da senha
  if ((password && !newPassword) || (!password && newPassword)) {
    res.status(400).json({
      error: "Both password and newPassword are required to change the password",
    });
    return;
  }

  if (password && newPassword) {
    if (password.trim() === "" || newPassword.trim() === "") {
      res.status(400).json({ error: "Password cannot be empty or only spaces" });
      return;
    }
  }

  // Se todas as validações passarem, chama o próximo middleware
  next();
};