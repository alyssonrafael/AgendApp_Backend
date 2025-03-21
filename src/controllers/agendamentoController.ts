import { Request, Response } from "express";
import prisma from "../prisma";

// função auxiliar para verificar conflitos de agendamento
const verificarConflitosAgendamento = async (
  dataAgendamento: Date, // Data e horário do agendamento em UTC
  horarioFim: Date, // Horário de fim do agendamento em UTC
  servicoId: string,
  empresaId: string
) => {
  // Busca todos os agendamentos no mesmo dia (dataAgendamento) para a empresa
  const agendamentosConflitantes = await prisma.agendamento.findMany({
    where: {
      data: new Date(
        dataAgendamento.toISOString().split("T")[0] + "T00:00:00.000Z"
      ), // Filtra pela data (ignorando o horário)
      servico: {
        empresaId,
      },
    },
    include: {
      servico: true,
    },
  });

  // Verifica se há conflito com algum agendamento existente
  return agendamentosConflitantes.some((agendamentoExistente) => {
    // Converte o horário do agendamento existente para UTC
    const [horaExistente, minutoExistente] = agendamentoExistente.horario
      .split(":")
      .map(Number);
    const horarioInicioExistente = new Date(agendamentoExistente.data);
    horarioInicioExistente.setUTCHours(horaExistente + 3, minutoExistente, 0, 0); // Converte de Brasília (UTC-3) para UTC

    const horarioFimExistente = new Date(horarioInicioExistente);
    horarioFimExistente.setUTCMinutes(
      horarioFimExistente.getUTCMinutes() + agendamentoExistente.servico.duracao
    );

    // Verifica se há sobreposição entre os agendamentos
    return (
      (dataAgendamento >= horarioInicioExistente &&
        dataAgendamento < horarioFimExistente) || // Novo agendamento começa durante o existente
      (horarioFim > horarioInicioExistente &&
        horarioFim <= horarioFimExistente) || // Novo agendamento termina durante o existente
      (dataAgendamento <= horarioInicioExistente &&
        horarioFim >= horarioFimExistente) // Novo agendamento engloba o existente
    );
  });
};
//Usuario
// função para criar um agendamento
export const criarAgendamento = async (req: Request, res: Response) => {
  try {
    const { data, horario, servicoId } = req.body;
    const clienteId = (req as any).usuario.id;

    // Verifica se o cliente existe
    const cliente = await prisma.user.findUnique({
      where: { id: clienteId },
    });

    if (!cliente) {
      res.status(404).json({ error: "Client not found" });
      return;
    }

    // Verifica se o serviço existe
    const servico = await prisma.servico.findUnique({
      where: { id: servicoId },
    });

    if (!servico) {
      res.status(404).json({ error: "Service not found" });
      return;
    }

    // Converte a data para o formato YYYY-MM-DDT00:00:00.000Z
    const dataAgendamento = new Date(data);
    const dataAgendamentoUTC = new Date(
      Date.UTC(
        dataAgendamento.getUTCFullYear(),
        dataAgendamento.getUTCMonth(),
        dataAgendamento.getUTCDate(),
        0, // Horário fixo em 00:00:00
        0,
        0,
        0
      )
    );

    // Converte o horário fornecido pelo usuário (em Brasília, UTC-3) para UTC
    const [hora, minuto] = horario.split(":").map(Number);
    const horarioAgendamentoUTC = new Date(dataAgendamentoUTC);
    horarioAgendamentoUTC.setUTCHours(hora + 3, minuto, 0, 0); // Adiciona 3 horas para converter de Brasília (UTC-3) para UTC

    // Obtém a data/horário atual em UTC
    const dataAtualUTC = new Date();

    // Verifica se a data e o horário do agendamento são posteriores ao momento atual
    if (horarioAgendamentoUTC <= dataAtualUTC) {
      res
        .status(400)
        .json({ error: "Appointment date and time must be in the future" });
      return;
    }

    // Calcula o horário de fim do agendamento em UTC
    const horarioFimUTC = new Date(horarioAgendamentoUTC);
    horarioFimUTC.setUTCMinutes(horarioFimUTC.getUTCMinutes() + servico.duracao);

    // Obtém o dia da semana da data do agendamento
    const diaSemana = dataAgendamentoUTC.getUTCDay();

    // Obtém a grade de horários da empresa para o dia da semana
    const gradeHorario = await prisma.gradeHorario.findFirst({
      where: {
        empresaId: servico.empresaId,
        diaSemana,
      },
    });
    //se não houver grade de horario para o dia retorna erro
    if (!gradeHorario) {
      res.status(400).json({ error: "No schedule available for this day" });
      return;
    }

    // Converte o horário de funcionamento da empresa para UTC
    const [horaInicioGrade, minutoInicioGrade] = gradeHorario.inicio
      .split(":")
      .map(Number);
    const [horaFimGrade, minutoFimGrade] = gradeHorario.fim
      .split(":")
      .map(Number);

    const horarioInicioGradeUTC = new Date(dataAgendamentoUTC);
    horarioInicioGradeUTC.setUTCHours(horaInicioGrade + 3, minutoInicioGrade, 0, 0); // Converte de Brasília (UTC-3) para UTC

    const horarioFimGradeUTC = new Date(dataAgendamentoUTC);
    horarioFimGradeUTC.setUTCHours(horaFimGrade + 3, minutoFimGrade, 0, 0); // Converte de Brasília (UTC-3) para UTC

    // Verifica se o horário solicitado está dentro do horário de funcionamento
    if (
      horarioAgendamentoUTC < horarioInicioGradeUTC ||
      horarioFimUTC > horarioFimGradeUTC
    ) {
      res
        .status(400)
        .json({ error: "Requested time is outside business hours" });
      return;
    }

    // Verifica se o horário solicitado está alinhado com os intervalos da grade
    const intervaloGrade = gradeHorario.intervalo; // Intervalo da grade em minutos
    const minutosSolicitados = (hora + 3) * 60 + minuto; // Converte o horário solicitado para minutos em UTC
    const minutosInicioGradeUTC = (horaInicioGrade + 3) * 60 + minutoInicioGrade; // Converte o início da grade para minutos em UTC

    // Verifica se o horário solicitado está alinhado com a grade
    if ((minutosSolicitados - minutosInicioGradeUTC) % intervaloGrade !== 0) {
      res.status(400).json({
        error: `Requested time must be aligned with the schedule intervals (every ${intervaloGrade} minutes)`,
      });
      return;
    }

    // Verifica se há conflitos com outros agendamentos usando a função auxiliar
    const conflito = await verificarConflitosAgendamento(
      horarioAgendamentoUTC,
      horarioFimUTC,
      servicoId,
      servico.empresaId
    );
    //se houver conflito retorna erro
    if (conflito) {
      res.status(400).json({
        error: "Requested time conflicts with an existing appointment",
      });
      return;
    }

    // Verifica se há indisponibilidade no horário solicitado
    const indisponibilidades = await prisma.indisponibilidade.findMany({
      where: {
        empresaId: servico.empresaId,
        OR: [
          { data: null }, // Indisponibilidades globais (todos os dias)
          { data: dataAgendamentoUTC }, // Indisponibilidades específicas para o dia
        ],
      },
    });

    // Verifica se o horário solicitado está dentro de uma indisponibilidade
    const horarioSolicitadoMinutosUTC = (hora + 3) * 60 + minuto; // Converte o horário solicitado para minutos em UTC
    
    const indisponivel = indisponibilidades.some((indisponibilidade) => {
      const [inicioIndisponivel, fimIndisponivel] = indisponibilidade.horario.split("-");
      const [horaInicioIndisponivel, minutoInicioIndisponivel] = inicioIndisponivel.split(":").map(Number);
      const [horaFimIndisponivel, minutoFimIndisponivel] = fimIndisponivel.split(":").map(Number);

      const inicioIndisponivelMinutosUTC = (horaInicioIndisponivel + 3) * 60 + minutoInicioIndisponivel; // Converte para UTC
      const fimIndisponivelMinutosUTC = (horaFimIndisponivel + 3) * 60 + minutoFimIndisponivel; // Converte para UTC

      return (
        horarioSolicitadoMinutosUTC >= inicioIndisponivelMinutosUTC &&
        horarioSolicitadoMinutosUTC < fimIndisponivelMinutosUTC
      );
    });
    //se estiver indisponivel retorna erro
    if (indisponivel) {
      res.status(400).json({
        error: "Requested time is unavailable due to a scheduled unavailability",
      });
      return;
    }

    // Cria o agendamento
    const agendamento = await prisma.agendamento.create({
      data: {
        data: dataAgendamentoUTC, // Armazena a data com horário 00:00:00.000Z
        horario, // Armazena o horário no formato "HH:mm"
        clienteId,
        servicoId,
      },
    });
    //retorna o agendamento criado
    res.status(201).json({
      message: "Appointment created successfully",
      agendamento,
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({ error: "Error creating appointment" });
  }
};
// todos os agendamentos de um usuario
export const listarAgendamentosPorUsuario = async (
  req: Request,
  res: Response
) => {
  try {
    const clienteId = (req as any).usuario.id;

    // Verifica se o clienteId foi fornecido
    if (!clienteId) {
      res.status(400).json({ error: "Client ID is required" });
      return;
    }

    // Verifica se o cliente existe
    const cliente = await prisma.user.findUnique({
      where: { id: clienteId },
    });

    if (!cliente) {
      res.status(404).json({ error: "Client not found" });
      return;
    }

    // Busca os agendamentos do cliente
    const agendamentos = await prisma.agendamento.findMany({
      where: {
        clienteId,
      },
      include: {
        servico: {
          include: {
            empresa: true, // Inclui os detalhes da empresa relacionada ao serviço
          },
        },
      },
      orderBy: {
        data: "desc", // Ordena por data (do mais recente para o mais antigo)
      },
    });

    // Enxuga a resposta
    const agendamentosEnxutos = agendamentos.map((agendamento) => ({
      id: agendamento.id,
      data: agendamento.data,
      horario: agendamento.horario,
      servico: {
        nome: agendamento.servico.nome,
        descricao: agendamento.servico.descricao,
        duracao: agendamento.servico.duracao,
        custo: agendamento.servico.custo,
        empresa: {
          nomeEmpresa: agendamento.servico.empresa.nomeEmpresa,
          description: agendamento.servico.empresa.description,
        },
      },
    }));
    const totalDeAgendamentos = agendamentosEnxutos.length;
    
    //retorna o nuemro de agendamentos e os agendamentos
    res.status(200).json({
      message: "Appointments retrieved successfully",
      total: totalDeAgendamentos,
      agendamentos: agendamentosEnxutos,
    });
  } catch (error) {
    console.error("Error retrieving appointments:", error);
    res.status(500).json({ error: "Error retrieving appointments" });
  }
};
export const listarAgendamentosFuturosPorUsuario = async (
  req: Request,
  res: Response
) => {
  try {
    const clienteId = (req as any).usuario.id;

    // Verifica se o clienteId foi fornecido
    if (!clienteId) {
      res.status(400).json({ error: "Client ID is required" });
      return;
    }

    // Verifica se o cliente existe
    const cliente = await prisma.user.findUnique({
      where: { id: clienteId },
    });

    if (!cliente) {
      res.status(404).json({ error: "Client not found" });
      return;
    }

    const agoraUTC = new Date(); // Data e hora atuais em UTC
    const agoraBrasilia = new Date(agoraUTC.getTime() - 3 * 60 * 60 * 1000); // Converte para Brasília (UTC-3)

    // Busca os agendamentos futuros do cliente
    const agendamentos = await prisma.agendamento.findMany({
      where: {
        clienteId,
        AND: [
          {
            // Filtra por data maior ou igual à data atual
            data: {
              gte: new Date(
                Date.UTC(
                  agoraBrasilia.getUTCFullYear(),
                  agoraBrasilia.getUTCMonth(),
                  agoraBrasilia.getUTCDate()
                )
              ),
            },
          },
          {
            // Filtra por horário maior que o horário atual (se for o mesmo dia)
            OR: [
              {
                data: {
                  gt: new Date(
                    Date.UTC(
                      agoraBrasilia.getUTCFullYear(),
                      agoraBrasilia.getUTCMonth(),
                      agoraBrasilia.getUTCDate()
                    )
                  ),
                },
              },
              {
                // Se for o mesmo dia, filtra por horário maior que o horário atual
                AND: [
                  {
                    data: new Date(
                      Date.UTC(
                        agoraBrasilia.getUTCFullYear(),
                        agoraBrasilia.getUTCMonth(),
                        agoraBrasilia.getUTCDate()
                      )
                    ),
                  },
                  {
                    horario: {
                      gt: agoraBrasilia.toISOString().split("T")[1].slice(0, 5), // Compara apenas o horário (HH:mm)
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
      include: {
        servico: {
          include: {
            empresa: true, // Inclui os detalhes da empresa relacionada ao serviço
          },
        },
      },
      orderBy: [
        {
          data: "asc", // Ordena por data (do mais antigo para o mais recente)
        },
        {
          horario: "asc", // Ordena por horário (do mais cedo para o mais tarde)
        },
      ],
    });

    // Enxuga a resposta
    const agendamentosEnxutos = agendamentos.map((agendamento) => ({
      id: agendamento.id,
      data: agendamento.data,
      horario: agendamento.horario, // Já está em Brasília (UTC-3)
      servico: {
        nome: agendamento.servico.nome,
        descricao: agendamento.servico.descricao,
        duracao: agendamento.servico.duracao,
        custo: agendamento.servico.custo,
        empresa: {
          nomeEmpresa: agendamento.servico.empresa.nomeEmpresa,
          description: agendamento.servico.empresa.description,
        },
      },
    }));

    const totalDeAgendamentos = agendamentosEnxutos.length;
    //retorna o numero de agendamentos e os agendamentos futuros apartir da data e hora atual
    res.status(200).json({
      message: "Future appointments retrieved successfully",
      total: totalDeAgendamentos,
      agendamentos: agendamentosEnxutos,
    });
  } catch (error) {
    console.error("Error retrieving future appointments:", error);
    res.status(500).json({ error: "Error retrieving future appointments" });
  }
};
//listagem dos agendamentods do dia de um usuario
export const listarAgendamentosDoDiaPorUsuario = async (
  req: Request,
  res: Response
) => {
  try {
    const clienteId = (req as any).usuario.id;

    // Verifica se o clienteId foi fornecido
    if (!clienteId) {
      res.status(400).json({ error: "Client ID is required" });
      return;
    }

    // Verifica se o cliente existe
    const cliente = await prisma.user.findUnique({
      where: { id: clienteId },
    });

    if (!cliente) {
      res.status(404).json({ error: "Client not found" });
      return;
    }

    // Obtém a data atual no fuso horário de Brasília (UTC-3)
    const hojeBrasilia = new Date();
    hojeBrasilia.setHours(hojeBrasilia.getHours() - 3); // Ajusta para Brasília (UTC-3)

    // Define o início e o fim do dia no fuso horário de Brasília
    const inicioDoDiaBrasilia = new Date(hojeBrasilia);
    inicioDoDiaBrasilia.setUTCHours(0, 0, 0, 0); // Início do dia (00:00:00)

    const fimDoDiaBrasilia = new Date(hojeBrasilia);
    fimDoDiaBrasilia.setUTCHours(23, 59, 59, 999); // Fim do dia (23:59:59.999)

    // Busca os agendamentos do dia do cliente
    const agendamentos = await prisma.agendamento.findMany({
      where: {
        clienteId,
        data: {
          gte: inicioDoDiaBrasilia.toISOString(), // Início do dia
          lte: fimDoDiaBrasilia.toISOString(), // Fim do dia
        },
      },
      include: {
        servico: {
          include: {
            empresa: true, // Inclui os detalhes da empresa relacionada ao serviço
          },
        },
      },
      orderBy: [
        {
          data: "asc", // Ordena por data (do mais antigo para o mais recente)
        },
        {
          horario: "asc", // Ordena por horário (do mais cedo para o mais tarde)
        },
      ],
    });

    // Enxuga a resposta
    const agendamentosEnxutos = agendamentos.map((agendamento) => ({
      id: agendamento.id,
      data: agendamento.data,
      horario: agendamento.horario, // Já está em Brasília (UTC-3)
      servico: {
        nome: agendamento.servico.nome,
        descricao: agendamento.servico.descricao,
        duracao: agendamento.servico.duracao,
        custo: agendamento.servico.custo,
        empresa: {
          nomeEmpresa: agendamento.servico.empresa.nomeEmpresa,
        },
      },
    }));

    const totalDeAgendamentos = agendamentosEnxutos.length;
    //retorna o numero de agendamentos e os agendamentos do dia
    res.status(200).json({
      message: "Day appointments retrieved successfully",
      total: totalDeAgendamentos,
      day: hojeBrasilia.toISOString().split("T")[0], // Exibe apenas a data (YYYY-MM-DD)
      agendamentos: agendamentosEnxutos,
    });
  } catch (error) {
    console.error("Error retrieving appointments:", error);
    res.status(500).json({ error: "Error retrieving appointments" });
  }
};

//Excluir agendamento
export const excluirAgendamento = async (req: Request, res: Response) => {
  try {
    const agendamentoId = req.params.agendamentoId;

    // Verifica se o agendamentoId foi fornecido
    if (!agendamentoId) {
      res.status(400).json({ error: "Appointment ID is required" });
      return;
    }

    // Verifica se o agendamento existe
    const agendamento = await prisma.agendamento.findUnique({
      where: { id: agendamentoId },
    });

    if (!agendamento) {
      res.status(404).json({ error: "Appointment not found" });
      return;
    }

    // Verifica se o agendamento pertence ao cliente autenticado
    const clienteId = (req as any).usuario.id;

    if (agendamento.clienteId !== clienteId) {
      res
        .status(403)
        .json({ error: "You are not allowed to delete this appointment" });
      return;
    }

    // Obtém a data e horário atuais em UTC
    const agora = new Date();

    // Combina a data e o horário do agendamento em UTC
    const [horaAgendamento, minutoAgendamento] = agendamento.horario.split(":").map(Number);
    const dataAgendamento = new Date(agendamento.data);
    dataAgendamento.setUTCHours(horaAgendamento, minutoAgendamento, 0, 0);

    // Calcula a diferença em milissegundos entre o horário atual e o horário do agendamento
    const diferencaMilissegundos = dataAgendamento.getTime() - agora.getTime();

    // Converte a diferença para horas
    const diferencaHoras = diferencaMilissegundos / (1000 * 60 * 60);

    // Verifica se a diferença é menor que 24 horas
    if (diferencaHoras < 24) {
      res.status(400).json({
        error: "Appointments can only be canceled up to 24 hours in advance",
      });
      return;
    }

    // Exclui o agendamento
    await prisma.agendamento.delete({
      where: { id: agendamentoId },
    });

    res.status(200).json({ message: "Appointment deleted successfully" });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    res.status(500).json({ error: "Error deleting appointment" });
  }
};

//Empresa
// todos os agendamentos de uma empresa
export const listarAgendamentosPorEmpresa = async (
  req: Request,
  res: Response
) => {
  try {
    const empresaId = (req as any).usuario.id;

    // Verifica se o empresaId foi fornecido
    if (!empresaId) {
      res.status(400).json({ error: "Company ID is required" });
      return;
    }

    // Verifica se a empresa existe
    const empresa = await prisma.empresa.findUnique({
      where: { id: empresaId },
    });

    if (!empresa) {
      res.status(404).json({ error: "Company not found" });
      return;
    }

    // Busca os agendamentos da empresa
    const agendamentos = await prisma.agendamento.findMany({
      where: {
        servico: {
          empresaId,
        },
      },
      include: {
        cliente: true,
        servico: true,
      },
      orderBy: {
        data: "desc", // Ordena por data (do mais recente para o mais antigo)
      },
    });

    // Enxuga a resposta
    const agendamentosEnxutos = agendamentos.map((agendamento) => ({
      id: agendamento.id,
      data: agendamento.data,
      horario: agendamento.horario,
      cliente: {
        nome: agendamento.cliente.name,
        email: agendamento.cliente.email,
      },
      servico: {
        nome: agendamento.servico.nome,
        descricao: agendamento.servico.descricao,
        duracao: agendamento.servico.duracao,
        custo: agendamento.servico.custo,
      },
    }));

    const totalDeAgendamentos = agendamentosEnxutos.length;
    //retorna o numero de agendamentos e os agendamentos da empresa 
    res.status(200).json({
      message: "Appointments retrieved successfully",
      total: totalDeAgendamentos,
      agendamentos: agendamentosEnxutos,
    });
  } catch (error) {
    console.error("Error retrieving appointments:", error);
    res.status(500).json({ error: "Error retrieving appointments" });
  }
};
//todos os agendamentos futuros de uma empresa
export const listarAgendamentosFuturosPorEmpresa = async (
  req: Request,
  res: Response
) => {
  try {
    const empresaId = (req as any).usuario.id;

    // Verifica se o empresaId foi fornecido
    if (!empresaId) {
      res.status(400).json({ error: "Company ID is required" });
      return;
    }

    // Verifica se a empresa existe
    const empresa = await prisma.empresa.findUnique({
      where: { id: empresaId },
    });

    if (!empresa) {
      res.status(404).json({ error: "Company not found" });
      return;
    }

    // Obtém a data e horário atuais em Brasília (UTC-3)
    const agoraUTC = new Date(); // Data e hora atuais em UTC
    const agoraBrasilia = new Date(agoraUTC.getTime() - 3 * 60 * 60 * 1000); // Converte para Brasília (UTC-3)

    // Busca os agendamentos futuros da empresa
    const agendamentos = await prisma.agendamento.findMany({
      where: {
        servico: {
          empresaId,
        },
        AND: [
          {
            // Filtra por data maior ou igual à data atual
            data: {
              gte: new Date(
                Date.UTC(
                  agoraBrasilia.getUTCFullYear(),
                  agoraBrasilia.getUTCMonth(),
                  agoraBrasilia.getUTCDate()
                )
              ),
            },
          },
          {
            // Filtra por horário maior que o horário atual (se for o mesmo dia)
            OR: [
              {
                data: {
                  gt: new Date(
                    Date.UTC(
                      agoraBrasilia.getUTCFullYear(),
                      agoraBrasilia.getUTCMonth(),
                      agoraBrasilia.getUTCDate()
                    )
                  ),
                },
              },
              {
                AND: [
                  {
                    data: new Date(
                      Date.UTC(
                        agoraBrasilia.getUTCFullYear(),
                        agoraBrasilia.getUTCMonth(),
                        agoraBrasilia.getUTCDate()
                      )
                    ),
                  },
                  {
                    horario: {
                      gt: agoraBrasilia.toISOString().split("T")[1].slice(0, 5), // Compara apenas o horário (HH:mm)
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
      include: {
        cliente: true,
        servico: true,
      },
      orderBy: [
        {
          data: "asc", // Ordena por data (do mais antigo para o mais recente)
        },
        {
          horario: "asc", // Ordena por horário (do mais cedo para o mais tarde)
        },
      ],
    });

    // Enxuga a resposta
    const agendamentosEnxutos = agendamentos.map((agendamento) => ({
      id: agendamento.id,
      data: agendamento.data,
      horario: agendamento.horario, // Já está em Brasília (UTC-3)
      cliente: {
        nome: agendamento.cliente.name,
        email: agendamento.cliente.email,
      },
      servico: {
        nome: agendamento.servico.nome,
        descricao: agendamento.servico.descricao,
        duracao: agendamento.servico.duracao,
        custo: agendamento.servico.custo,
      },
    }));

    const totalDeAgendamentos = agendamentosEnxutos.length;

    res.status(200).json({
      message: "Future appointments retrieved successfully",
      total: totalDeAgendamentos,
      agendamentos: agendamentosEnxutos,
    });
  } catch (error) {
    console.error("Error retrieving future appointments:", error);
    res.status(500).json({ error: "Error retrieving future appointments" });
  }
};
//listar agendamentos do dia
export const listarAgendamentosDoDiaPorEmpresa = async (
  req: Request,
  res: Response
) => {
  try {
    const empresaId = (req as any).usuario.id;

    // Verifica se o empresaId foi fornecido
    if (!empresaId) {
      res.status(400).json({ error: "Company ID is required" });
      return;
    }

    // Verifica se a empresa existe
    const empresa = await prisma.empresa.findUnique({
      where: { id: empresaId },
    });

    if (!empresa) {
      res.status(404).json({ error: "Company not found" });
      return;
    }

    // Obtém a data atual no fuso horário de Brasília (UTC-3)
    const hojeBrasilia = new Date();
    hojeBrasilia.setHours(hojeBrasilia.getHours() - 3); // Ajusta para Brasília (UTC-3)

    // Define o início e o fim do dia no fuso horário de Brasília
    const inicioDoDiaBrasilia = new Date(hojeBrasilia);
    inicioDoDiaBrasilia.setUTCHours(0, 0, 0, 0); // Início do dia (00:00:00)

    const fimDoDiaBrasilia = new Date(hojeBrasilia);
    fimDoDiaBrasilia.setUTCHours(23, 59, 59, 999); // Fim do dia (23:59:59.999)

    // Busca os agendamentos do dia da empresa
    const agendamentos = await prisma.agendamento.findMany({
      where: {
        servico: {
          empresaId,
        },
        data: {
          gte: inicioDoDiaBrasilia.toISOString(), // Início do dia
          lte: fimDoDiaBrasilia.toISOString(), // Fim do dia
        },
      },
      include: {
        cliente: true,
        servico: true,
      },
      orderBy: [
        {
          data: "asc", // Ordena por data (do mais antigo para o mais recente)
        },
        {
          horario: "asc", // Ordena por horário (do mais cedo para o mais tarde)
        },
      ],
    });

    // Enxuga a resposta
    const agendamentosEnxutos = agendamentos.map((agendamento) => ({
      id: agendamento.id,
      data: agendamento.data,
      horario: agendamento.horario, // Já está em Brasília (UTC-3)
      cliente: {
        nome: agendamento.cliente.name,
        email: agendamento.cliente.email,
      },
      servico: {
        nome: agendamento.servico.nome,
        descricao: agendamento.servico.descricao,
        duracao: agendamento.servico.duracao,
        custo: agendamento.servico.custo,
      },
    }));

    const totalDeAgendamentos = agendamentosEnxutos.length;

    res.status(200).json({
      message: "Day appointments retrieved successfully",
      total: totalDeAgendamentos,
      day: hojeBrasilia.toISOString().split("T")[0], // Exibe apenas a data (YYYY-MM-DD)
      agendamentos: agendamentosEnxutos,
    });
  } catch (error) {
    console.error("Error retrieving appointments:", error);
    res.status(500).json({ error: "Error retrieving appointments" });
  }
};
