import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import prisma from "./prisma"; // Importando a instância do Prisma Client
import authRoutes from "./routes/authRoutes";
import passport from "passport";
import userRoutes from "./routes/userRoutes";
import empresaRoutes from "./routes/empresaRoutes";

dotenv.config();

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

// Usando o middleware CORS
app.use(cors({
  origin: ["http://localhost:8081", "exp://10.0.0.20:8081"], // Permite o Expo acessar o backend
  methods: ["GET", "POST", "PUT", "DELETE"], //  Métodos HTTP permitidos
  credentials: true
}));
// ussando o passport para possibilitar o login com o google
app.use(passport.initialize());

//Usando as rotas
app.use("/api/auth", authRoutes);
app.use("/api", userRoutes);
app.use("/api", empresaRoutes);

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
