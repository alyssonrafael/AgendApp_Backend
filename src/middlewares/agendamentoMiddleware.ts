import { Request, Response, NextFunction } from "express";

export const validarEntradaAgendamento = (req: Request, res: Response, next: NextFunction) => {

  const { data, horario, servicoId } = req.body;

  // Verifica se todos os campos estão presentes
  if (!data || !horario || !servicoId) {
    res.status(400).json({ error: "The fields date, time, clienteId and servicoId are mandatory" });
    return;
  }

  // Regex para validar UUID
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

  // Verifica se os UUIDs são válidos
  if (!uuidRegex.test(servicoId)) {
    res.status(400).json({ error: "Invalid UUID format for clienteId or servicoId" });
    return;
  }

  // Regex para validar o formato do horário (HH:MM)
  const horarioRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;

  if (!horarioRegex.test(horario)) {
    res.status(400).json({ error: "Invalid time format. Use HH:MM (e.g., 09:30, 18:00)" });
    return;
  }

  //Regex para validar a data (YYYY-MM-DD)
  const dataRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (!dataRegex.test(data)) {
    res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD (e.g., 2021-12-31)" });
    return;
  }

  // Se todas as validações passarem, prossegue para o próximo middleware ou rota
  next();
};