import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import prisma from "./prisma"; // Importando a instância do Prisma Client
import authRoutes from "./routes/authRoutes";

dotenv.config();

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

// Usando o middleware CORS
app.use(cors());

//Usando as rotas
app.use('/api/auth', authRoutes);

// Função para testar a conexão
const testConnection = async () => {
  try {
    // Conectando ao banco
    await prisma.$connect();
    console.log("Conexão estabelecida com sucesso!");
    // Desconectando do banco
    await prisma.$disconnect();
    console.log("Desconectado do banco. Teste concluído!");
  } catch (err) {
    console.error("Erro ao conectar ou realizar operação no banco:", err);
  }
};

// Rodando o teste de conexão e operações
testConnection();

// Iniciando o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
