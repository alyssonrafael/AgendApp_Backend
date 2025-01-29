import { Request, Response } from 'express';
import prisma from '../prisma';
import { hashPassword } from '../services/authService';
import bcrypt from 'bcryptjs';
import { generateToken } from '../services/authService';

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password, name, provider } = req.body;

  // Validações básicas
  if (!email || !password || !name) {
    res.status(400).json({ error: 'Email, password, and name are required' });
    return
  }

  try {
    // Verifica se o e-mail já está em uso
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
    res.status(400).json({ error: 'Email is already in use' });
    return
    }
    // aguarda a senha ser criptografada
    const hashedPassword = await hashPassword(password);
    // Cria o usuário
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        provider: provider || false,
        role: provider ? 'PROVIDER' : 'CLIENT',
      },
    });

     res.status(201).json({ message: 'User created successfully', user });
     return
  } catch (err) {
     res.status(500).json({ error: 'Error creating user' });
     return
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }
  
    try {
      const user = await prisma.user.findUnique({ where: { email } });
  
      if (!user || !user.password) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }
  
      const token = generateToken({ id: user.id, role: user.role, name: user.name });
  
      res.status(200).json({ message: 'Login successful', token });
    } catch (err) {
      res.status(500).json({ error: 'Error during login' });
    }
  };


  
