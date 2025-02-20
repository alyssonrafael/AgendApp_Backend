import { Request, Response } from "express";
import prisma from "../prisma";
import { hashPassword, comparePassword } from "../services/authService";
import { decodeToken } from "../services/authService";
import path from "path";
import fs from "fs";

export const updateEmpresa = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { nomeEmpresa, description, password, newPassword } = req.body;
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    res.status(401).json({ error: "Token is required" });
    return;
  }

  try {
    const decoded = decodeToken(token);

    if (!decoded || typeof decoded !== "object" || !("id" in decoded)) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    const empresaId = (decoded as { id: string }).id;

    const existingEmpresa = await prisma.empresa.findUnique({
      where: { id: empresaId },
    });

    if (!existingEmpresa) {
      res.status(404).json({ error: "Company not found" });
      return;
    }

    // Verifica se os campos de texto não são apenas espaços vazios
    if (nomeEmpresa !== undefined) {
      if (nomeEmpresa.trim() === "") {
        res.status(400).json({ error: "Company name cannot be empty" });
        return;
      }

      // Verifica se já existe uma empresa com esse nome
      const empresaExistente = await prisma.empresa.findUnique({
        where: { nomeEmpresa },
      });

      if (empresaExistente && empresaExistente.id !== empresaId) {
        res.status(409).json({ error: "Company name is already in use" });
        return;
      }
    }

    if (description !== undefined) {
      if (description.trim() === "") {
        res.status(400).json({ error: "Description cannot be empty" });
        return;
      }

      if (description.length > 500) {
        res
          .status(400)
          .json({ error: "Description cannot exceed 500 characters" });
        return;
      }
    }

    // Atualiza os campos enviados
    const updateData: Record<string, any> = {};
    if (nomeEmpresa) updateData.nomeEmpresa = nomeEmpresa;
    if (description) updateData.description = description;

    // Verifica se a senha pode ser alterada
    if ((password && !newPassword) || (!password && newPassword)) {
      res.status(400).json({
        error:
          "Both password and newPassword are required to change the password",
      });
      return;
    }

    if (password && newPassword) {
      if (!existingEmpresa.password) {
        res
          .status(400)
          .json({ error: "Password change is not allowed for this company" });
        return;
      }

      if (password.trim() === "" || newPassword.trim() === "") {
        res
          .status(400)
          .json({ error: "Password cannot be empty or only spaces" });
        return;
      }

      const isPasswordValid = await comparePassword(
        password,
        existingEmpresa.password
      );
      if (!isPasswordValid) {
        res.status(401).json({ error: "Current password is incorrect" });
        return;
      }

      const hashedPassword = await hashPassword(newPassword);
      updateData.password = hashedPassword;
    }

    await prisma.empresa.update({
      where: { id: empresaId },
      data: updateData,
    });

    res.status(200).json({ message: "Company updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error updating company" });
  }
};


export const uploadFotoEmpresa = async (
  req: Request,
  res: Response
): Promise<void> => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    res.status(401).json({ error: "Token is required" });
    return;
  }

  try {
    const decoded = decodeToken(token);
    if (!decoded || typeof decoded !== "object" || !("id" in decoded)) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    const empresaId = (decoded as { id: string }).id;

    // Verifica se um arquivo foi enviado
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    // Verifica se a empresa existe
    const empresa = await prisma.empresa.findUnique({
      where: { id: empresaId },
    });

    if (!empresa) {
      res.status(404).json({ error: "Company not found" });
      return;
    }

    // Remove a imagem antiga, se houver
    if (empresa.image) {
      const oldImagePath = path.join(__dirname, "../uploads", empresa.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Atualiza a empresa com a nova imagem
    await prisma.empresa.update({
      where: { id: empresaId },
      data: { image: req.file.filename },
    });

    res
      .status(200)
      .json({
        message: "Image uploaded successfully",
        image: req.file.filename,
      });
  } catch (err) {
    res.status(500).json({ error: "Error uploading image" });
  }
};

export const getEmpresa = async (
  req: Request,
  res: Response
): Promise<void> => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    res.status(401).json({ error: "Token is required" });
    return;
  }

  try {
    const decoded = decodeToken(token);
    if (!decoded || typeof decoded !== "object" || !("id" in decoded)) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    const empresaId = (decoded as { id: string }).id;

    const empresa = await prisma.empresa.findUnique({
      where: { id: empresaId },
      select: {
        name:true,
        nomeEmpresa: true,
        email: true,
        createdAt: true,
        description:true,
        image:true
      },
    });

    if (!empresa) {
      res.status(404).json({ error: "empresa not found" });
      return;
    }

    res.status(200).json(empresa);
  } catch (error) {
    console.error("Error fetching empresa:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
