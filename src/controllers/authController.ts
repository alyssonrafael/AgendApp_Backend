import { Request, Response } from "express";
import prisma from "../prisma";
import { hashPassword } from "../services/authService";
import bcrypt from "bcryptjs";
import { generateToken } from "../services/authService";
import jwt from "jsonwebtoken";

// AUTH USER
export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, password, name } = req.body;

  // Validações básicas
  if (!email || !password || !name) {
    res.status(400).json({ error: "Email, password, and name are required" });
    return;
  }

  try {
    // Verifica se o e-mail já está em uso
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: "Email is already in use" });
      return;
    }
    // aguarda a senha ser criptografada
    const hashedPassword = await hashPassword(password);
    // Cria o usuário
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name
      },
    });

    res.status(201).json({ message: "User created successfully", user });
    return;
  } catch (err) {
    res.status(500).json({ error: "Error creating user" });
    return;
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = generateToken({
      id: user.id,
      name: user.name,
    });

    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ error: "Error during login" });
  }
};

export const googleAuthCallback = async (req: Request, res: Response) => {
  try {
    const { googleId, name, email } = req.user as {
      googleId: string;
      name: string;
      email: string;
    };

    // Verifica se o usuário já existe no banco
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      // Se o usuário já existir e tiver uma senha cadastrada, bloqueia o login pelo Google
      if (user.password) {
         res.status(400).json({
          message:
            "This email is already registered. Log in using your password.",
        });
        return
      }

      // Se o usuário já existir, mas sem senha (ou seja, criado pelo Google antes), apenas retorna o token
    } else {
      // Se não existir, cria um novo usuário
      user = await prisma.user.create({
        data: {
          name,
          email,
          googleId
        },
      });
    }

    // Gera o token JWT
    const token = jwt.sign(
      { id: user.id},
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

     res.json({ token, user });
     return
  } catch (error) {
    console.error("Google authentication error:", error);
     res.status(500).json({ message: "Internal server error" });
     return
  }
};

//AUTH empresa
export const registerEmpresa = async (req: Request, res: Response) => {
  try {
    const { email, password, name, nomeEmpresa, image } = req.body;

    // Verifica se o e-mail já existe
    const empresaExistente = await prisma.empresa.findUnique({
      where: { email },
    });

    if (empresaExistente) {
       res.status(400).json({ error: "Error creating company" });
       return
    }

    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria a empresa
    const empresa = await prisma.empresa.create({
      data: {
        email,
        password: hashedPassword,
        name,
        nomeEmpresa,
      },
    });

     res.status(201).json({ message: "Empresa created successfully", empresa });
     return
  } catch (error) {
     res.status(500).json({ error: "Error registering company" });
     return
  }
};

export const loginEmpresa = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Busca a empresa pelo e-mail
    const empresa = await prisma.empresa.findUnique({
      where: { email },
    });

    if (!empresa) {
       res.status(400).json({ error: "Invalid credentials" });
       return
    }

    // Verifica a senha
    const senhaCorreta = await bcrypt.compare(password, empresa.password);
    if (!senhaCorreta) {
       res.status(400).json({ error: "Invalid credentials" });
       return
    }

    // Gera um token JWT
    const token = generateToken({
      id: empresa.id,
      nameEmpresa: empresa.nomeEmpresa,
      name: empresa.name,
    });

     res.json({ message: "Login successful", token, empresa });
     return
  } catch (error) {
     res.status(500).json({ error: "Error during login" });
     return
  }
};