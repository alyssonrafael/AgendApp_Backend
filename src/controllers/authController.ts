import { Request, Response } from "express";
import prisma from "../prisma";
import { hashPassword } from "../services/authService";
import bcrypt from "bcryptjs";
import { generateToken } from "../services/authService";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { addMinutes } from "date-fns";
import { sendRecoveryEmail } from "../utils/email";

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
      res.status(409).json({ error: "Email is already in use" });
      return;
    }
    // aguarda a senha ser criptografada
    const hashedPassword = await hashPassword(password);
    // Cria o usuário
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
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
      googleAuth: !user.googleId
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
        return;
      }

      // Se o usuário já existir, mas sem senha (ou seja, criado pelo Google antes), apenas retorna o token
    } else {
      // Se não existir, cria um novo usuário
      user = await prisma.user.create({
        data: {
          name,
          email,
          googleId,
        },
      });
    }

    // Gera o token JWT
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    res.json({ token, user });
    return;
  } catch (error) {
    console.error("Google authentication error:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

//AUTH empresa
export const registerEmpresa = async (req: Request, res: Response) => {
  try {
    const { email, password, name, nomeEmpresa } = req.body;

    // Verifica se o e-mail já existe
    const empresaExistente = await prisma.empresa.findUnique({
      where: { email },
    });

    if (empresaExistente) {
      res.status(400).json({ error: "Error creating company" });
      return;
    }

    // Verifica se o nome da empresa já existe
    const nomeEmpresaExistente = await prisma.empresa.findUnique({
      where: { nomeEmpresa },
    });

    if (nomeEmpresaExistente) {
      res.status(409).json({ error: "Company name is already in use." });
      return;
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
    return;
  } catch (error) {
    res.status(500).json({ error: error });
    return;
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
      return;
    }

    // Verifica a senha
    const senhaCorreta = await bcrypt.compare(password, empresa.password);
    if (!senhaCorreta) {
      res.status(400).json({ error: "Invalid credentials" });
      return;
    }

    // Gera um token JWT
    const token = generateToken({
      id: empresa.id,
      nameEmpresa: empresa.nomeEmpresa,
      name: empresa.name,
    });

    res.json({ message: "Login successful", token });
    return;
  } catch (error) {
    res.status(500).json({ error: "Error during login" });
    return;
  }
};

// RECUPERAÇÃO DE SENHA

// Função auxiliar para gerar o token e enviar o e-mail
const sendResetTokenAndEmail = async (
  email: string,
  res: Response,
  message: string
) => {
  const token = uuidv4();
  const expiresAt = addMinutes(new Date(), 15);

  await prisma.passwordResetToken.upsert({
    where: { email },
    update: { token, expiresAt },
    create: { email, token, expiresAt },
  });

  // Envia o e-mail com o código de recuperação
  await sendRecoveryEmail(email, token);

  // Retorna a resposta com a mensagem personalizada o res usa o status que vem da funçao primaria abaixo
  res.json({ message });
  return;
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Verifica se o e-mail pertence a um usuário ou empresa
    const user = await prisma.user.findUnique({ where: { email } });
    const empresa = await prisma.empresa.findUnique({ where: { email } });

    // Se não pertencer a nenhum dos dois, retorna erro
    if (!user && !empresa) {
      res.status(404).json({ message: "Email not found." });
      return;
    }

    // Se for um usuário com """ GoogleID """, não permite redefinir a senha
    if (user && user.googleId) {
      if (empresa) {
        // Caso o e-mail também seja de uma empresa, permite redefinir a senha da empresa
        sendResetTokenAndEmail(
          email,
          res.status(207),
          "This email belongs to more than one account type. Confirm in the next step which type you want to change."
        );
        return;
      }

      // Caso o usuário tenha GoogleID e não tenha empresa, não permite resetar a senha
      res.status(400).json({
        message:
          "This account was created with Google. Please sign in with Google to access your account.",
      });
      return;
    }
    //se nao tiver conta no googleid mais tiver conta de empresa e de usuario
    if (user && empresa) {
      sendResetTokenAndEmail(
        email,
        res.status(207),
        "This email belongs to more than one account type. Confirm in the next step which type you want to change."
      );
      return;
    }

    // Se o usuário não tiver GoogleID e so tiver um tipo de conta, cria o token e envia o e-mail
    sendResetTokenAndEmail(
      email,
      res.status(200),
      "Recovery code sent to email."
    );
    return;
  } catch (error) {
    res.status(500).json({ message: "Error processing request." });
    return;
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, token, newPassword, type } = req.body;

    // Verifica se o tipo informado é válido
    if (type !== "user" && type !== "empresa") {
      res.status(400).json({ message: "Invalid account type." });
      return;
    }

    // Busca o token no banco
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { email },
    });

    // quando nao houver token para recuperaçao
    if (!resetToken) {
      res.status(400).json({ message: "Token not found." });
      return;
    }

    // Verifica se o token é válido e se não expirou
    if (resetToken.token !== token || new Date() > resetToken.expiresAt) {
      res.status(403).json({ message: "Invalid or expired token." });
      return;
    }

    // Verifica se o usuário tem um googleId antes de permitir a alteração
    if (type === "user") {
      const user = await prisma.user.findUnique({ where: { email } });

      if (user && user.googleId) {
        res.status(409).json({
          message:
            "This account was created with Google. Sign in with Google to access your account.",
        });
        return;
      }
    }

    // Hash da nova senha
    const hashedPassword = await hashPassword(newPassword);

    // Atualiza a senha apenas no tipo de conta correspondente
    let updated;
    if (type === "user") {
      updated = await prisma.user.updateMany({
        where: { email },
        data: { password: hashedPassword },
      });
    } else {
      updated = await prisma.empresa.updateMany({
        where: { email },
        data: { password: hashedPassword },
      });
    }

    // Verifica se alguma conta foi atualizada
    if (updated.count === 0) {
      res.status(406).json({ message: "Account not found." });
      return;
    }

    // Remove o token usado
    await prisma.passwordResetToken.delete({ where: { email } });

    res.status(200).json({ message: "Password reset successfully!" });
    return;
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Internal server error." });
    return;
  }
};
