import { Router } from "express";
import {
  adicionarDiasGradeHorario,
  atualizarHorariosGradeHorario,
  criarGradeHorario,
  criarIndisponibilidadeGlobal,
  listarGradeHorarios,
  listarHorariosDisponiveis,
  removerDiaGradeHorario,
  removerIndisponibilidade,
} from "../controllers/gradeHorariosController";
import { autenticarToken } from "../middlewares/authMiddleware";
import {
  validarEntradaDiasGradeHorario,
  validarEntradaGradeHorario,
  validarHorariosGradeHorario,
  validarIndisponibilidadeGlobal,
  validarRemocaoDiaGradeHorario,
  validarRemocaoIndisponibilidade,
} from "../middlewares/gradeHorariosMiddleware";

const router = Router();

//rota de criação de grade de horario
router.post(
  "/grade-horario",
  autenticarToken,
  validarEntradaGradeHorario,
  criarGradeHorario
);
//rota de listagem de grade de horarios
router.get("/grade-horarios", autenticarToken, listarGradeHorarios);
//rota de listagem de horarios disponiveis
router.get("/horarios-disponiveis", autenticarToken, listarHorariosDisponiveis);
//rota de adição de dias na grade de horario
router.post(
  "/grade-horario/adicionar-dias",
  autenticarToken,
  validarEntradaDiasGradeHorario,
  adicionarDiasGradeHorario
);
//rota de remoção de dia da grade de horario
router.delete(
  "/grade-horario/remover-dia",
  autenticarToken,
  validarRemocaoDiaGradeHorario,
  removerDiaGradeHorario
);
//rota de atualização de horarios da grade
router.put(
  "/grade-horario/atualizar-horarios",
  autenticarToken,
  validarHorariosGradeHorario,
  atualizarHorariosGradeHorario
);

//rotas de indisponibilidade global
router.post(
  "/indisponibilidade/criar",
  autenticarToken,
  validarIndisponibilidadeGlobal,
  criarIndisponibilidadeGlobal
);
//rota de remoção de indisponibilidade com base no id
router.delete(
  "/indisponibilidade/remover",
  autenticarToken,
  validarRemocaoIndisponibilidade,
  removerIndisponibilidade
);

export default router;
