import type { Request, Response } from "express";
import prisma from "../lib/prisma";

export async function criarProjeto(req: Request, res: Response) {
  const { titulo, descricao, comunidadeId } = req.body;
  const userId = req.userId;

  if (!titulo || !descricao) {
    res.status(400).json({
      mensagem: "Preencha todos os campos",
    });
    return;
  }

  if (!userId) {
    res.status(400).json({
      mensagem: "ID invalido",
    });
    return;
  }

  let idComunidade: number | null = null;
  let statusAprovacao = "APROVADO";

  if (comunidadeId !== undefined && comunidadeId !== null) {
    idComunidade = Number(comunidadeId);

    if (!Number.isSafeInteger(idComunidade) || idComunidade <= 0) {
      res.status(400).json({ mensagem: "ID da comunidade inválido." });
      return;
    }

    const comunidade = await prisma.community.findUnique({
      where: { id: idComunidade },
      select: { id: true, creatorId: true },
    });

    if (!comunidade) {
      res.status(404).json({ mensagem: "Comunidade não encontrada." });
      return;
    }

    const membro = await prisma.communityMember.findUnique({
      where: {
        userId_communityId: {
          userId: Number(userId),
          communityId: idComunidade,
        },
      },
      select: { status: true },
    });

    if (membro?.status !== "APROVADO") {
      res.status(403).json({
        mensagem: "Somente membros aprovados podem enviar projetos para esta comunidade.",
      });
      return;
    }

    if (comunidade.creatorId !== Number(userId)) statusAprovacao = "PENDENTE";
  }

  const projeto = await prisma.project.create({
    data: {
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      statusAprovacao,
      userId: Number(userId),
      communityId: idComunidade,
    },
  });

  res.status(201).json({
    mensagem: "Projeto criado com susseso!",
    projeto,
  });
}

export async function listarProjetos(req: Request, res: Response) {
  const projetos = await prisma.project.findMany({
    where: { communityId: null },
    include: {
      user: {
        select: {
          id: true,
          nome: true,
        },
      },
      midias: {
        select: {
          id: true,
          nome: true,
          tipo: true,
          url: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  res.status(200).json({ projetos });
}

export async function buscarProjetos(req: Request, res: Response) {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    res.status(400).json({
      mensagem: "ID invalido",
    });
    return;
  }

  const projeto = await prisma.project.findUnique({
    where: {
      id,
    },
    include: {
      user: {
        select: {
          id: true,
          nome: true,
        },
      },
      community: {
        select: {
          id: true,
          nome: true,
        },
      },
    },
  });

  if (!projeto) {
    res.status(404).json({
      mensagem: "projeto não encontrado",
    });
    return;
  }

  res.status(200).json(projeto);
}

export async function listarProjetosDaComunidade(req: Request, res: Response) {
  const userId = req.userId;
  const communityId = Number(req.params.communityId);

  if (!userId) {
    res.status(401).json({ mensagem: "Usuário não autenticado." });
    return;
  }

  if (!Number.isSafeInteger(communityId) || communityId <= 0) {
    res.status(400).json({ mensagem: "ID da comunidade inválido." });
    return;
  }

  const comunidade = await prisma.community.findUnique({
    where: { id: communityId },
    select: { id: true },
  });

  if (!comunidade) {
    res.status(404).json({ mensagem: "Comunidade não encontrada." });
    return;
  }

  const membro = await prisma.communityMember.findUnique({
    where: {
      userId_communityId: {
        userId: Number(userId),
        communityId,
      },
    },
    select: { status: true },
  });

  if (membro?.status !== "APROVADO") {
    res.status(403).json({
      mensagem: "Somente membros aprovados podem ver os projetos da comunidade.",
    });
    return;
  }

  const projetos = await prisma.project.findMany({
    where: {
      communityId,
      OR: [
        { statusAprovacao: "APROVADO" },
        { userId: Number(userId) },
      ],
    },
    include: {
      user: { select: { id: true, nome: true } },
      midias: { select: { id: true, nome: true, tipo: true, url: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  res.status(200).json({ projetos });
}

export async function listarProjetosPendentesComunidade(req: Request, res: Response) {
  const userId = req.userId;
  const communityId = Number(req.params.communityId);

  if (!userId) return res.status(401).json({ mensagem: "Usuário não autenticado." });
  if (!Number.isSafeInteger(communityId) || communityId <= 0) {
    return res.status(400).json({ mensagem: "ID da comunidade inválido." });
  }

  const comunidade = await prisma.community.findUnique({
    where: { id: communityId },
    select: { creatorId: true },
  });
  if (!comunidade) return res.status(404).json({ mensagem: "Comunidade não encontrada." });
  if (comunidade.creatorId !== Number(userId)) {
    return res.status(403).json({ mensagem: "Somente o criador pode analisar os projetos." });
  }

  const projetos = await prisma.project.findMany({
    where: { communityId, statusAprovacao: "PENDENTE" },
    include: { user: { select: { id: true, nome: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });

  return res.status(200).json({ projetos });
}

export async function decidirProjetoComunidade(req: Request, res: Response) {
  const userId = req.userId;
  const communityId = Number(req.params.communityId);
  const projetoId = Number(req.params.projetoId);
  const { decisao } = req.body;

  if (!userId) return res.status(401).json({ mensagem: "Usuário não autenticado." });
  if (!Number.isSafeInteger(communityId) || communityId <= 0 || !Number.isSafeInteger(projetoId) || projetoId <= 0) {
    return res.status(400).json({ mensagem: "ID da comunidade ou do projeto inválido." });
  }
  if (!["APROVAR", "RECUSAR"].includes(decisao)) {
    return res.status(400).json({ mensagem: "Decisão inválida." });
  }

  const comunidade = await prisma.community.findUnique({
    where: { id: communityId },
    select: { creatorId: true },
  });
  if (!comunidade) return res.status(404).json({ mensagem: "Comunidade não encontrada." });
  if (comunidade.creatorId !== Number(userId)) {
    return res.status(403).json({ mensagem: "Somente o criador pode analisar os projetos." });
  }

  const projeto = await prisma.project.findFirst({
    where: { id: projetoId, communityId, statusAprovacao: "PENDENTE" },
  });
  if (!projeto) return res.status(404).json({ mensagem: "Projeto pendente não encontrado." });

  const statusAprovacao = decisao === "APROVAR" ? "APROVADO" : "RECUSADO";
  const projetoAtualizado = await prisma.project.update({
    where: { id: projetoId },
    data: { statusAprovacao },
  });

  return res.status(200).json({
    mensagem: decisao === "APROVAR" ? "Projeto aprovado e publicado na comunidade." : "Projeto recusado.",
    projeto: projetoAtualizado,
  });
}

export async function atualizarProjeto(req: Request, res: Response) {
  const id = Number(req.params.id);
  const { titulo, descricao } = req.body;
  const userId = req.userId;

  if (!userId) {
    res.status(401).json({ mensagem: "Usuário não autenticado." });
    return;
  }

  const projetoAtual = await prisma.project.findUnique({ where: { id } });

  if (!projetoAtual) {
    res.status(404).json({ mensagem: "Projeto não encontrado." });
    return;
  }

  if (projetoAtual.userId !== Number(userId)) {
    res.status(403).json({ mensagem: "Você não pode editar este projeto." });
    return;
  }

  const projeto = await prisma.project.update({
    where: {
      id,
    },
    data: {
      ...(titulo !== undefined && { titulo: titulo.trim() }),
      ...(descricao !== undefined && { descricao: descricao.trim() }),
    },
  });

  res.status(200).json({
    mensagem: "Projeto atualizado com susseso",
    projeto,
  });
}

export async function deletarProjeto(req: Request, res: Response) {
  const id = Number(req.params.id);
  const userId = req.userId;

  if (Number.isNaN(id)) {
    res.status(400).json({
      mensagem: "ID invalido",
    });
    return;
  }

  if (!userId) {
    res.status(401).json({ mensagem: "Usuário não autenticado." });
    return;
  }

  const projetoAtual = await prisma.project.findUnique({ where: { id } });

  if (!projetoAtual) {
    res.status(404).json({ mensagem: "Projeto não encontrado." });
    return;
  }

  if (projetoAtual.userId !== Number(userId)) {
    res.status(403).json({ mensagem: "Você não pode excluir este projeto." });
    return;
  }

  const projeto = await prisma.project.delete({
    where: {
      id,
    },
  });

  res.status(200).json({
    mensagem: "Projeto removido com susseso",
    projeto,
  });
}

export async function listarMeusProjetos(req: Request, res: Response) {
  const userId = req.userId

  if (!userId) {
    res.status(401).json({
      mensagem: "ERRO usuario não autenticado"
    })
    return;
  }

  const projetos = await prisma.project.findMany({
    where: {
      userId: req.userId,
    },
    include: {
      user: {
        select: {
          id: true,
          nome: true,
        },
      },
      midias: true,
    },
  });

  res.status(200).json({
    projetos
  })
}
