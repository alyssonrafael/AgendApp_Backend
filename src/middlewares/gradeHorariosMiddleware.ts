import { Request, Response, NextFunction } from "express";

//função auxiliar para validar a entrada de horirio
const validarHorario = (inicio: string, fim: string): string | null => {
  const regexHora = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;

  // Verifica se o formato é válido
  if (!regexHora.test(inicio) || !regexHora.test(fim)) {
    return "Invalid time format. Use HH:MM (e.g., 08:00, 18:30)";
  }

  // Converte os horários para Date para comparar
  const [horaInicio, minutoInicio] = inicio.split(":").map(Number);
  const [horaFim, minutoFim] = fim.split(":").map(Number);
  const inicioDate = new Date();
  inicioDate.setHours(horaInicio, minutoInicio, 0);
  const fimDate = new Date();
  fimDate.setHours(horaFim, minutoFim, 0);

  // Verifica se o horário de início é antes do horário de fim
  if (inicioDate >= fimDate) {
    return "Start time must be before end time";
  }

  // Se tudo estiver válido, retorna null
  return null;
};
//middleware para a criação da grade de horario validando entrada e regras de negocio.
export const validarEntradaGradeHorario = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { diasSemana, inicio, fim, intervalo } = req.body;

  // Verifica se todos os campos estão presentes
  if (!diasSemana || !inicio || !fim || !intervalo) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }

  // Valida o horário
  const mensagemErro = validarHorario(inicio, fim);
  if (mensagemErro) {
    res.status(400).json({ error: mensagemErro });
    return;
  }

  // Verifica se diasSemana é um array não vazio de números válidos
  if (
    !Array.isArray(diasSemana) ||
    diasSemana.length === 0 ||
    !diasSemana.every((dia) => typeof dia === "number" && !isNaN(dia))
  ) {
    res.status(400).json({
      error: "diasSemana must be a non-empty array of valid numbers",
    });
    return;
  }

  // Verificação do intervalo
  if (
    typeof intervalo !== "number" || // Verifica se é um número
    !Number.isInteger(intervalo) || // Verifica se é um número inteiro
    intervalo < 10 || // Verifica se é maior ou igual a 10
    intervalo > 720 // Verifica se é menor ou igual a 720
  ) {
    res.status(400).json({
      error: "The interval must be an integer between 10 and 720 (12 hours)",
    });
    return;
  }

  next();
};
//middleware de adição de dias na grade de horarios
export const validarEntradaDiasGradeHorario = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { diasSemana } = req.body;

  // Verifica se diasSemana está presente e é um array
  if (!diasSemana || !Array.isArray(diasSemana) || diasSemana.length === 0) {
    res
      .status(400)
      .json({ error: "diasSemana is required and must be a non-empty array" });
    return;
  }

  // Verifica se todos os elementos são números
  if (!diasSemana.every((dia) => typeof dia === "number")) {
    res
      .status(400)
      .json({ error: "All elements in diasSemana must be numbers" });
    return;
  }

  // Verifica se há dias duplicados
  const diasUnicos = new Set(diasSemana);
  if (diasUnicos.size !== diasSemana.length) {
    res.status(400).json({ error: "Duplicate days are not allowed" });
    return;
  }

  next();
};
//middleware para atualizar os horarios da grade
export const validarHorariosGradeHorario = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { inicio, fim } = req.body;

  // Verifica se inicio e fim estão presentes
  if (!inicio || !fim) {
    res.status(400).json({ error: "Start and end times are mandatory" });
    return;
  }

  // Valida o horário
  const mensagemErro = validarHorario(inicio, fim);
  if (mensagemErro) {
    res.status(400).json({ error: mensagemErro });
    return;
  }

  next();
};
//middleware para validar a entrada para a rota de remoção de dia da grade de horario
export const validarRemocaoDiaGradeHorario = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { diaSemana } = req.body;

  // Verifica se diaSemana está presente
  if (!diaSemana) {
    res.status(400).json({ error: "Weekday is required ex: 1 or 2" });
    return;
  }

  // Verifica se diaSemana é um número
  if (typeof diaSemana !== "number") {
    res.status(400).json({ error: "Weekday must be a number" });
    return;
  }

  next();
};
//middleware para validar a entrada para a rota de criação de indisponibilidade global
export const validarIndisponibilidadeGlobal = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { inicio, fim, data } = req.body;

  // Verifica se horarioInicio e horarioFim estão presentes
  if (!inicio || !fim) {
    res.status(400).json({ error: "Start and end times are mandatory" });
    return;
  }

  // Valida o horário
  const mensagemErro = validarHorario(inicio, fim);
  if (mensagemErro) {
    res.status(400).json({ error: mensagemErro });
    return;
  }

  // Verifica se a data é válida (se fornecida)
  if (data) {
    const dataValida = new Date(data);
    if (isNaN(dataValida.getTime())) {
      res.status(400).json({ error: "Invalid date format" });
      return;
    }
  }

  next();
};
//middleware para validar a entrada para a rota de remoção de indisponibilidade
export const validarRemocaoIndisponibilidade = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Expressão regular para validar UUID
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  const { indisponibilidadeId } = req.body;

  // Verifica se indisponibilidadeId está presente
  if (!indisponibilidadeId) {
    res.status(400).json({ error: "Outage ID is required" });
    return;
  }

  // Verifica se indisponibilidadeId é um UUID válido
  if (!uuidRegex.test(indisponibilidadeId)) {
    res.status(400).json({ error: "Invalid Outage ID format" });
    return;
  }

  next();
};
