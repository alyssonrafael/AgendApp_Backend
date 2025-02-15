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
const EXPIRES_IN = '7d'; // Tempo de expiração do token

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
//decodifica o token e volta os dados do payload
export const decodeToken = (token: string): object | null => {
  try {
    const decoded = jwt.verify(token, SECRET_KEY) as object; 
    return decoded;
  } catch (error) {
    return null; // Retorna null se o token for inválido
  }
};