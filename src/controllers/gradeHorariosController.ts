// Importações necessárias
import { Request, Response } from "express";
import prisma from "../prisma";
import { addMinutes, format } from "date-fns";

// Função para criar a Grade de Horário
export const criarGradeHorario = async (req: Request, res: Response) => {
  try {
    const empresaId = (req as any).usuario.id; // Obtém o ID da empresa do token
    const { diasSemana, inicio, fim, intervalo } = req.body;

    if (!empresaId) {
      res.status(401).json({ error: "Company not found in token" });
      return;
    }
    
    // Verifica se a grade já existe para algum dos dias informados
    const gradeExistente = await prisma.gradeHorario.findMany({
      where: {
        empresaId,
        diaSemana: {
          in: diasSemana,
        },
      },
    });

    if (gradeExistente.length > 0) {
      res.status(400).json({
        error:
          "Timetable already exists for one or more selected days",
      });
      return;
    }

    // Cria as grades para cada dia informado
    const novasGrades = await Promise.all(
      diasSemana.map((dia: number) =>
        prisma.gradeHorario.create({
          data: {
            diaSemana: dia,
            inicio,
            fim,
            intervalo,
            empresaId,
          },
        })
      )
    );

    res
      .status(201)
      .json({ message: "Timetable created successfully", novasGrades });
  } catch (error) {
    res.status(500).json({ error: "Error creating Timetable Grid" });
  }
};
// Função para listar a Grade de Horários
export const listarGradeHorarios = async (req: Request, res: Response) => {
  try {
    const empresaId = (req as any).usuario.id; // Obtém o ID da empresa do token

    if (!empresaId) {
      res.status(400).json({ error: "Company not found in token" });
      return;
    }

    // Obtém a GradeHorario da empresa
    const gradeHorarios = await prisma.gradeHorario.findMany({
      where: {
        empresaId: empresaId as string,
      },
      orderBy: {
        diaSemana: "asc",
      },
    });

    if (gradeHorarios.length === 0) {
      res.status(404).json({
        message: "No timetables found for this company.",
      });
      return;
    }

    res.status(200).json(gradeHorarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error listing timetable." });
  }
};
// Função para listar os horários disponíveis
export const listarHorariosDisponiveis = async (
  req: Request,
  res: Response
) => {
  try {
    const { empresaId, data } = req.query;

    if (!empresaId || !data) {
      res
        .status(400)
        .json({ error: "Company not found in token or date not provided" });
      return;
    }

    // Obtém o dia da semana diretamente do getUTCDay (0 = Domingo, 1 = Segunda, ..., 6 = Sábado)
    const dataISO = new Date(`${data}T00:00:00.000Z`);
    const diaSemana = dataISO.getUTCDay();

    // Obtém a GradeHorario da empresa para o dia da semana específico
    const grade = await prisma.gradeHorario.findFirst({
      where: {
        empresaId: empresaId as string,
        diaSemana: diaSemana,
      },
    });

    if (!grade) {
      res
        .status(404)
        .json({ error: "Timetable not found for this day." });
      return;
    }

    // Gera os horários com base no intervalo
    const horarios: string[] = [];
    let horaAtual = grade.inicio;

    while (horaAtual < grade.fim) {
      horarios.push(horaAtual);

      // Adiciona o intervalo ao horário atual
      const [hora, minuto] = horaAtual.split(":").map(Number);
      const proximoHorario = addMinutes(
        new Date(0, 0, 0, hora, minuto),
        grade.intervalo
      );
      horaAtual = format(proximoHorario, "HH:mm");
    }

    // Obtém os agendamentos para o dia solicitado, incluindo a duração do serviço
    const agendamentos = await prisma.agendamento.findMany({
      where: {
        data: new Date(data as string),
        servico: {
          empresaId: empresaId as string,
        },
      },
      include: {
        servico: {
          select: {
            duracao: true, // Inclui a duração do serviço
          },
        },
      },
    });

    // Obtém as indisponibilidades para o dia solicitado e as globais (sem data)
    const indisponibilidades = await prisma.indisponibilidade.findMany({
      where: {
        empresaId: empresaId as string,
        OR: [
          { data: new Date(data as string) }, // Indisponibilidades específicas para o dia
          { data: null }, // Indisponibilidades globais (sem data)
        ],
      },
    });

    // Marca os horários ocupados e indisponíveis
    const horariosComStatus = horarios.map((horario) => {
      // Verifica se o horário está ocupado por algum agendamento
      const ocupado = agendamentos.some((agendamento) => {
        const [horaAgendamento, minutoAgendamento] = agendamento.horario.split(":").map(Number);
        const horarioAgendamento = new Date(0, 0, 0, horaAgendamento, minutoAgendamento);

        // Calcula o horário de término do agendamento
        const horarioFimAgendamento = addMinutes(
          horarioAgendamento,
          agendamento.servico.duracao
        );

        // Verifica se o horário atual está dentro do intervalo do agendamento
        const [horaAtual, minutoAtual] = horario.split(":").map(Number);
        const horarioAtual = new Date(0, 0, 0, horaAtual, minutoAtual);

        return (
          horarioAtual >= horarioAgendamento &&
          horarioAtual < horarioFimAgendamento
        );
      });

      // Verifica se o horário está dentro de um período de indisponibilidade
      const indisponivel = indisponibilidades.some((indisponibilidade) => {
        const [inicioIndisponivel, fimIndisponivel] =
          indisponibilidade.horario.split("-");
        return horario >= inicioIndisponivel && horario < fimIndisponivel;
      });

      return {
        horario,
        ocupado,
        indisponivel,
      };
    });

    res.status(200).json(horariosComStatus);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error listing available times."});
  }
};
// Função para adicionar dias na Grade de Horário
export const adicionarDiasGradeHorario = async (
  req: Request,
  res: Response
) => {
  try {
    const empresaId = (req as any).usuario.id; // Obtém o ID da empresa do token
    const { diasSemana } = req.body;

    if (!empresaId) {
      res.status(401).json({ error: "Company not found in token" });
      return;
    }

    if (!diasSemana || diasSemana.length === 0) {
      res.status(400).json({ error: "Weekdays are mandatory" });
      return;
    }

    // Busca o horário padrão da empresa
    const horarioPadrao = await prisma.gradeHorario.findFirst({
      where: {
        empresaId,
      },
    });

    if (!horarioPadrao) {
      res.status(404).json({ error: "Standard time not found" });
      return;
    }

    // Verifica se os dias já existem na grade
    const diasExistentes = await prisma.gradeHorario.findMany({
      where: {
        empresaId,
        diaSemana: {
          in: diasSemana,
        },
      },
    });

    if (diasExistentes.length > 0) {
      res.status(400).json({
        error: "One or more days already exist in the timetable",
      });
      return;
    }

    // Cria as grades para os novos dias
    const novasGrades = await Promise.all(
      diasSemana.map((dia: number) =>
        prisma.gradeHorario.create({
          data: {
            diaSemana: dia,
            inicio: horarioPadrao.inicio,
            fim: horarioPadrao.fim,
            intervalo: horarioPadrao.intervalo,
            empresaId,
          },
        })
      )
    );

    res
      .status(201)
      .json({ message: "Days added successfully", novasGrades });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error adding days to Timetable:" });
  }
};
// Função para atualizar horários da Grade de Horário
export const atualizarHorariosGradeHorario = async (
  req: Request,
  res: Response
) => {
  try {
    const empresaId = (req as any).usuario.id; // Obtém o ID da empresa do token
    const { inicio, fim } = req.body;

    if (!empresaId) {
      res.status(401).json({ error: "Company not found in token" });
      return;
    }

    if (!inicio || !fim) {
      res.status(400).json({ error: "Start and end are mandatory" });
      return;
    }

    // Verifica se há agendamentos futuros para qualquer dia da empresa
    const existeAgendamentoFuturo = await verificarAgendamentosFuturos(
      empresaId
    );

    if (existeAgendamentoFuturo) {
      res.status(400).json({
        error:
          "It is not possible to edit the schedules as there are future appointments",
      });
      return;
    }

    // Atualiza todos os horários da empresa
    const gradesAtualizadas = await prisma.gradeHorario.updateMany({
      where: {
        empresaId,
      },
      data: {
        inicio,
        fim,
      },
    });

    res
      .status(200)
      .json({ message: "Schedules updated successfully", gradesAtualizadas });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error updating schedules from the Timetable Grid" });
  }
};
// Função para remover dia da Grade de Horário
export const removerDiaGradeHorario = async (req: Request, res: Response) => {
  try {
    const empresaId = (req as any).usuario.id; // Obtém o ID da empresa do token
    const { diaSemana } = req.body;

    if (!empresaId) {
      res.status(401).json({ error: "Company not found in token" });
      return;
    }

    // Verifica se há agendamentos futuros para o dia especificado
    const existeAgendamentoFuturo = await verificarAgendamentosFuturos(
      empresaId,
      diaSemana
    );

    if (existeAgendamentoFuturo) {
      res.status(400).json({
        error:
         "Cannot remove day as there are future appointments",
      });
      return;
    }

    // Remove o dia da grade de horários
    const gradeRemovida = await prisma.gradeHorario.deleteMany({
      where: {
        empresaId,
        diaSemana,
      },
    });

    res
      .status(200)
      .json({ message: "Day successfully removed", gradeRemovida });
  } catch (error) {
    res.status(500).json({ error: "Error removing day from Timetable Grid" });
  }
};
// funçao auxiliar para verificar se há agendamentos futuros
const verificarAgendamentosFuturos = async (
  empresaId: string,
  diaSemana?: number
) => {
  const whereClause: any = {
    servico: {
      empresaId: empresaId, // Filtra pelo ID da empresa através da relação com Servico
    },
    data: {
      gte: new Date(), // Agendamentos a partir de agora
    },
  };

  if (diaSemana !== undefined) {
    // Filtra por dia da semana (0 = domingo, 1 = segunda, etc.)
    whereClause.data = {
      ...whereClause.data,
      // Converte o dia da semana para uma data específica
      gte: new Date(
        new Date().setDate(
          new Date().getDate() - new Date().getDay() + diaSemana
        )
      ),
      lt: new Date(
        new Date().setDate(
          new Date().getDate() - new Date().getDay() + diaSemana + 1
        )
      ),
    };
  }

  const agendamentos = await prisma.agendamento.findMany({
    where: whereClause,
  });

  return agendamentos.length > 0; // Retorna true se houver agendamentos futuros
};
// Função para criar uma indisponibilidade global
export const criarIndisponibilidadeGlobal = async (
  req: Request,
  res: Response
) => {
  try {
    const empresaId = (req as any).usuario.id; // Obtém o ID da empresa do token
    const { inicio, fim, motivo, data } = req.body;

    if (!empresaId) {
      res.status(401).json({ error: "Company not found in token" });
      return;
    }

    // Verifica se já existe uma indisponibilidade com a mesma data e horário
    const indisponibilidadeExistente = await prisma.indisponibilidade.findFirst({
      where: {
        empresaId,
        data: data ? new Date(data) : null, // Se a data não for fornecida, será null (indisponibilidade global)
        horario: `${inicio}-${fim}`, // Ex: "12:00-13:00"
      },
    });

    if (indisponibilidadeExistente) {
      res.status(400).json({ error: "Unavailability already exists for this date and time" });
      return;
    }

    // Verifica se há sobreposição com indisponibilidades globais (data = null)
    const indisponibilidadesGlobais = await prisma.indisponibilidade.findMany({
      where: {
        empresaId,
        data: null, // Apenas indisponibilidades globais
      },
    });

    // Função para verificar sobreposição de horários
    const horariosSobrepostos = indisponibilidadesGlobais.some((indisponibilidade) => {
      const [inicioExistente, fimExistente] = indisponibilidade.horario.split('-');
      return (
        (inicio >= inicioExistente && inicio < fimExistente) || // Novo início dentro de um intervalo existente
        (fim > inicioExistente && fim <= fimExistente) ||       // Novo fim dentro de um intervalo existente
        (inicio <= inicioExistente && fim >= fimExistente)      // Novo intervalo cobre completamente um intervalo existente
      );
    });

    if (horariosSobrepostos) {
      res.status(400).json({ error: "Unavailability overlaps with an existing global unavailability" });
      return;
    }

    // Cria a indisponibilidade global
    const indisponibilidade = await prisma.indisponibilidade.create({
      data: {
        data: data ? new Date(data) : null, // Se a data não for fornecida, será null (indisponibilidade global)
        horario: `${inicio}-${fim}`, // Ex: "12:00-13:00"
        motivo: motivo || "Unavailable time", // Motivo padrão
        empresaId,
      },
    });

    res.status(201).json({
      message: "Unavailability created successfully",
      indisponibilidade,
    });
  } catch (error) {
    console.error("Error creating global unavailability:", error);
    res.status(500).json({ error: "Error creating global unavailability" });
  }
};
// Função para remover uma indisponibilidade pelo ID
export const removerIndisponibilidade = async (req: Request, res: Response) => {
  try {
    const empresaId = (req as any).usuario.id; // Obtém o ID da empresa do token
    const { indisponibilidadeId } = req.body;

    if (!empresaId) {
      res.status(401).json({ error: "Company not found in token" });
      return;
    }

    if (!indisponibilidadeId) {
      res.status(400).json({ error: "Outage ID is required" });
      return;
    }

    const indisponibilidade = await prisma.indisponibilidade.findUnique({
      where: {
        id: indisponibilidadeId,
      },});

    if (!indisponibilidade) {
      res.status(404).json({ error: "Unavailability not found" });
      return;
    }
    // Remove a indisponibilidade
    const indisponibilidadeRemovida = await prisma.indisponibilidade.delete({
      where: {
        id: indisponibilidadeId,
        empresaId, // Garante que apenas a empresa dona pode remover
      },
    });

    res.status(200).json({
      message: "Unavailability successfully removed",
      indisponibilidadeRemovida,
    });
  } catch (error) {
    res.status(500).json({ error: "Error removing unavailability" });
  }
};

