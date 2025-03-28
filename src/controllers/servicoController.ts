import { Request, Response } from "express";
import prisma from "../prisma";

// Função para criar serviço
export const criarServico = async (req: Request, res: Response) => {
  try {
    // pegando o id da empresa pela decodificaçao do middleware de auth que retorna o payload do jtw decodificado
    const empresaId = (req as any).usuario.id;
    // Espera os seguintes campos do body
    const { nome, descricao, duracao, custo } = req.body;
    // Verifica se já existe um serviço com o mesmo nome na empresa
    const servicoExistente = await prisma.servico.findUnique({
      where: {
        nome_empresaId: {
          nome,
          empresaId,
        },
      },
    });
    // Se houver, retorna o conflito
    if (servicoExistente) {
      res.status(409).json({
        error: "There is already a service with that name for this company.",
      });
      return;
    }
    // Se tudo ok, cria o serviço
    const novoServico = await prisma.servico.create({
      data: {
        nome,
        descricao,
        duracao,
        custo,
        empresaId,
      },
    });

    res.status(201).json(novoServico);
    return;
  } catch (error) {
    res.status(500).json({ error: "Error creating service." });
    return;
  }
};
//Função para listar os serviços da empresa logada. ativos e não ativos
export const listarServicosPorEmpresaLogada = async (
  req: Request,
  res: Response
) => {
  try {
    //recupera o id pelo middleware de altenticação
    const empresaId = (req as any).usuario.id;
    // Verifica se o empresaId é válido
    if (!empresaId) {
      res.status(400).json({ error: "Company ID is required" });
      return;
    }
    // Lista os serviços da empresa com o ID fornecido
    const servicos = await prisma.servico.findMany({
      where: {
        empresaId: empresaId,
      },
      orderBy: {
        nome: "asc", //ordena em ordem alfabetica (A-Z)
      },
    });
    // Se não encontrar serviços
    if (servicos.length === 0) {
      res.status(404).json({ message: "No services found for this company." });
      return;
    }
    // Retorna os serviços encontrados
    res.status(200).json(servicos);
    return;
  } catch (error) {
    res.status(500).json({ error: "Error listing services." });
    return;
  }
};
// Função para listar serviços de uma empresa apenas os ativados com base no id rota usada por clientes
export const listarServicosPorEmpresa = async (req: Request, res: Response) => {
  const { empresaId } = req.params; // Extrai o empresaId da URL. O id da empresa!!
  try {
    // Verifica se o empresaId é válido
    if (!empresaId) {
      res.status(400).json({ error: "Company ID is required" });
      return;
    }
    // Lista os serviços da empresa com o ID fornecido
    const servicos = await prisma.servico.findMany({
      where: {
        empresaId: empresaId,
        ativo: true,
      },
      orderBy: {
        nome: "asc", //ordena em ordem alfabetica (A-Z)
      },
    });
    // Se não encontrar serviços
    if (servicos.length === 0) {
      res.status(404).json({ message: "No services found for this company." });
      return;
    }
    // Retorna os serviços encontrados
    res.status(200).json(servicos);
    return;
  } catch (error) {
    res.status(500).json({ error: "Error listing services." });
    return;
  }
};
// Função para listar um serviço específico pelo ID
export const listarServicoPorId = async (req: Request, res: Response) => {
  const { id } = req.params; // Extrai o id do serviço!! da URL
  try {
    // Verifica se o id é válido
    if (!id) {
      res.status(400).json({ error: "Service ID is required" });
      return;
    }
    // Busca o serviço pelo ID fornecido
    const servico = await prisma.servico.findUnique({
      where: {
        id: id,
      },
    });
    // Se não encontrar o serviço
    if (!servico) {
      res.status(404).json({ message: "Service not found." });
      return;
    }
    // Retorna o serviço encontrado
    res.status(200).json(servico);
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error searching for service." });
    return;
  }
};
// Função para atualizar um serviço podendo atualizar 1 dado por vez
export const atualizarServico = async (req: Request, res: Response) => {
  const { id } = req.params; // Extrai o id do serviço!! da URL
  const { nome, descricao, duracao, custo } = req.body;

  try {
    // Verifica se o id é válido
    if (!id) {
      res.status(400).json({ error: "Service ID is required" });
      return;
    }

    // Verifica se o serviço existe
    const servicoExistente = await prisma.servico.findUnique({
      where: { id },
    });

    if (!servicoExistente) {
      res.status(404).json({ error: "Service not found" });
      return;
    }

    // Verifica se o nome já existe para a mesma empresa e atualiza
    if (nome !== undefined) {
      const nomeExistente = await prisma.servico.findFirst({
        where: {
          nome,
          empresaId: servicoExistente.empresaId,
          id: {
            not: id, // Ignora o serviço atual
          },
        },
      });

      if (nomeExistente) {
        res
          .status(409)
          .json({ error: "Service name already exists for this company" });
        return;
      }

      await prisma.servico.update({
        where: { id },
        data: { nome },
      });
    }
    //atualiza descriçao
    if (descricao !== undefined) {
      await prisma.servico.update({
        where: { id },
        data: { descricao },
      });
    }
    //atualiza a duraçao
    if (duracao !== undefined) {
      await prisma.servico.update({
        where: { id },
        data: { duracao },
      });
    }
    //atualiza o custo
    if (custo !== undefined) {
      await prisma.servico.update({
        where: { id },
        data: { custo },
      });
    }

    // Retorna o serviço atualizado
    res.status(200).json({ message: "Service updated successfully" });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating service." });
    return;
  }
};
// desativar serviço
export const softDeleteServico = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    // Verifica se o ID foi fornecido
    if (!id) {
      res.status(400).json({ error: "Service ID is required" });
      return;
    }

    // Verifica se o serviço existe e está ativo
    const servicoExistente = await prisma.servico.findUnique({
      where: { id },
    });

    // Verifica se o serviço existe
    if (!servicoExistente) {
      res.status(404).json({ error: "Service not found." });
      return;
    }
    // verifica se está ativo
    if (!servicoExistente.ativo) {
      res.status(409).json({ error: "Service is already inactive." });
      return;
    }

    // Realiza o soft delete, atualizando o campo ativo para false
    await prisma.servico.update({
      where: { id },
      data: {
        ativo: false,
      },
    });

    res.status(200).json({ message: "Service disabled successfully." });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error disabled service." });
    return;
  }
};
// ativar serviço
export const ativarServico = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    // Verifica se o ID foi fornecido
    if (!id) {
      res.status(400).json({ error: "Service ID is required" });
      return;
    }

    // Verifica se o serviço existe e está inativo
    const servicoExistente = await prisma.servico.findUnique({
      where: { id },
    });

    if (!servicoExistente) {
      res.status(404).json({ error: "Service not found." });
      return;
    }

    if (servicoExistente.ativo) {
      res.status(409).json({ error: "Service is already active." });
      return;
    }

    // Realiza a ativação, atualizando o campo ativo para true
    await prisma.servico.update({
      where: { id },
      data: {
        ativo: true,
      },
    });

    res.status(200).json({ message: "Service activated successfully." });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error activating service." });
    return;
  }
};
