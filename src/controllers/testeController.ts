// controller de teste
import { Request, Response } from 'express';
import prisma from '../prisma';

export const createTeste = async (req: Request, res: Response) => {
  try {
    const { nome } = req.body;
    const newTeste = await prisma.teste.create({
     data :{
        nome
     }
    });
    res.status(201).json(newTeste);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar o teste' });
  }
};
