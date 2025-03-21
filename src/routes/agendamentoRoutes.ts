import { Router } from "express";
import {
  criarAgendamento,
  excluirAgendamento,
  listarAgendamentosDoDiaPorEmpresa,
  listarAgendamentosDoDiaPorUsuario,
  listarAgendamentosFuturosPorEmpresa,
  listarAgendamentosFuturosPorUsuario,
  listarAgendamentosPorEmpresa,
  listarAgendamentosPorUsuario,
} from "../controllers/agendamentoController";
import { autenticarToken } from "../middlewares/authMiddleware";
import { validarEntradaAgendamento } from "../middlewares/agendamentoMiddleware";


const router = Router();
//rotas user
router.post("/agendar", autenticarToken, validarEntradaAgendamento, criarAgendamento);
router.get("/meus-agendamentos", autenticarToken, listarAgendamentosPorUsuario);
router.get("/meus-agendamentos-futuros", autenticarToken, listarAgendamentosFuturosPorUsuario);
router.get("/meus-agendamentos-dia", autenticarToken, listarAgendamentosDoDiaPorUsuario);
router.delete("/meus-agendamentos-excluir/:agendamentoId", autenticarToken, excluirAgendamento);
//rotas empresa
router.get("/agendamentos-empresa", autenticarToken, listarAgendamentosPorEmpresa);
router.get("/agendamentos-empresa-futuro", autenticarToken, listarAgendamentosFuturosPorEmpresa);
router.get("/agendamentos-empresa-dia", autenticarToken, listarAgendamentosDoDiaPorEmpresa);


export default router;