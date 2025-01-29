import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

const SECRET_KEY = process.env.JWT_SECRET || 'default_secret_key'; // Use uma variável de ambiente para o segredo
const EXPIRES_IN = '8h'; // Tempo de expiração do token

export const generateToken = (payload: object): string => {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: EXPIRES_IN });
};

export const verifyToken = (token: string): object | null | undefined => {
  try {
     jwt.verify(token, SECRET_KEY);
     return
  } catch (error) {
    return null;
  }
};