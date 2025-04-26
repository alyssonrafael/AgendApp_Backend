import { Request, Response } from "express";
import prisma from "../prisma";
import { hashPassword, comparePassword } from "../services/authService";
import path from "path";
import fs from "fs";

export const updateEmpresa = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { nomeEmpresa, description, password, newPassword, phoneNumber, address } = req.body;
  try {
    const empresaId = (req as any).usuario.id;

    const existingEmpresa = await prisma.empresa.findUnique({
      where: { id: empresaId },
    });

    if (!existingEmpresa) {
      res.status(404).json({ error: "Company not found" });
      return;
    }

    // Verifica se o nome da empresa é válido e atualiza
    if (nomeEmpresa !== undefined) {
      // Verifica se já existe uma empresa com esse nome
      const empresaExistente = await prisma.empresa.findUnique({
        where: { nomeEmpresa },
      });

      if (empresaExistente && empresaExistente.id !== empresaId) {
        res.status(409).json({ error: "Company name is already in use" });
        return;
      }

      await prisma.empresa.update({
        where: { id: empresaId },
        data: { nomeEmpresa },
      });
    }

    //atualiza description
    if (description !== undefined) {
      await prisma.empresa.update({
        where: { id: empresaId },
        data: { description },
      });
    }

    // atualiza phoneNumber
    if (phoneNumber !== undefined) {
      await prisma.empresa.update({
        where: { id: empresaId },
        data: { phoneNumber },
      });
    }

    //atualiza address
    if (address !== undefined) {
      await prisma.empresa.update({
        where: { id: empresaId },
        data: { address },
      });
    }
    //atualiza password
    if (password && newPassword) {
      // Verifica se a senha atual está correta
      const isPasswordValid = await comparePassword(
        password,
        existingEmpresa.password
      );
      // Se a senha atual estiver incorreta, retorna um erro
      if (!isPasswordValid) {
        res.status(401).json({ error: "Current password is incorrect" });
        return;
      }
      // hash da nova senha
      const hashedPassword = await hashPassword(newPassword);
      // Atualiza a senha do usuário
      await prisma.empresa.update({
        where: { id: empresaId },
        data: { password: hashedPassword },
      });
    }

    res.status(200).json({ message: "Company updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error updating company" });
  }
};

export const uploadFotoEmpresa = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const empresaId = (req as any).usuario.id;

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
  try {
    const empresaId = (req as any).usuario.id;

    const empresa = await prisma.empresa.findUnique({
      where: { id: empresaId },
      select: {
        name:true,
        nomeEmpresa: true,
        email: true,
        phoneNumber: true,
        address: true,
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
// lista todas as empresas
export const listEmpresas = async (req: Request, res: Response): Promise<void> => {
  try {
    const empresas = await prisma.empresa.findMany({
      select: {
        id: true,
        nomeEmpresa: true,
        image: true,
        description: true,
        address: true,
        phoneNumber: true,
        email:true,
      },
      orderBy: {
        nomeEmpresa: 'asc' // Ordenação alfabética
      }
    });

    res.status(200).json(empresas);
  } catch (error) {
    console.error("Error fetching empresas:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
//listar a empresa com base no id fornecido
export const getEmpresaById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // Obtém o ID dos parâmetros da rota

    if (!id) {
       res.status(400).json({ error: "ID da empresa é obrigatório" });
       return
    }

    const empresa = await prisma.empresa.findUnique({
      where: {
        id: String(id)
      },
      select: {
        id: true,
        nomeEmpresa: true,
        image: true,
        description: true,
        address: true,
        phoneNumber: true,
        email: true,
        createdAt:true,
        servicos: {
          where: {
            ativo: true
          },
          select: {
            id: true,
            nome: true,
            descricao: true,
            custo: true,
            duracao: true
          }
        }
      }
    });

    if (!empresa) {
      res.status(404).json({ error: "Empresa não encontrada" });
      return;
    }

    res.status(200).json(empresa);
  } catch (error) {
    console.error("Error fetching empresa:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};