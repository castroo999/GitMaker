import type { Request, Response } from "express";
import prisma from "../lib/prisma";
import { criarNotificacao } from "../services/notificationService";
import { deletarArquivo } from "../services/storageService";

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
  let comunidadeParaNotificar: { creatorId: number; nome: string } | null = null;

  if (comunidadeId !== undefined && comunidadeId !== null) {
    idComunidade = Number(comunidadeId);

    if (!Number.isSafeInteger(idComunidade) || idComunidade <= 0) {
      res.status(400).json({ mensagem: "ID da comunidade inválido." });
      return;
    }

    const comunidade = await prisma.community.findUnique({
      where: { id: idComunidade },
      select: { id: true, creatorId: true, nome: true },
    });

    if (!comunidade) {
      res.status(404).json({ mensagem: "Comunidade não encontrada." });
      return;
    }
    comunidadeParaNotificar = comunidade;

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

  const criadorComunidade =
    statusAprovacao === "PENDENTE" ? comunidadeParaNotificar : null;
  const projeto = await prisma.$transaction(async (transacao) => {
    const novoProjeto = await transacao.project.create({
      data: {
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        statusAprovacao,
        userId: Number(userId),
        communityId: idComunidade,
      },
    });

    if (criadorComunidade && idComunidade !== null) {
      await criarNotificacao(transacao, "projetos", {
          userId: criadorComunidade.creatorId,
          tipo: "PROJETO_ENVIADO",
          titulo: "Novo projeto para analisar",
          mensagem: `Um projeto foi enviado para aprovação em ${criadorComunidade.nome}.`,
          link: `/comunidades/${idComunidade}`,
      });
    }
    return novoProjeto;
  });

  res.status(201).json({
    mensagem: "Projeto criado com susseso!",
    projeto,
  });
}

export async function listarProjetos(req: Request, res: Response) {
  const userId = Number(req.userId);
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
      _count: { select: { curtidas: true } },
      curtidas: { where: { userId }, select: { userId: true } },
    },
    orderBy: [{ curtidas: { _count: "desc" } }, { createdAt: "desc" }],
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
      _count: { select: { curtidas: true } },
      curtidas: {
        where: { userId: Number(req.userId) },
        select: { userId: true },
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
      _count: { select: { curtidas: true } },
      curtidas: {
        where: { userId: Number(userId) },
        select: { userId: true },
      },
    },
    orderBy: [{ curtidas: { _count: "desc" } }, { createdAt: "desc" }],
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
    select: { creatorId: true, nome: true },
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
    select: { creatorId: true, nome: true },
  });
  if (!comunidade) return res.status(404).json({ mensagem: "Comunidade não encontrada." });
  if (comunidade.creatorId !== Number(userId)) {
    return res.status(403).json({ mensagem: "Somente o criador pode analisar os projetos." });
  }

  const projeto = await prisma.project.findFirst({
    where: { id: projetoId, communityId, statusAprovacao: "PENDENTE" },
    select: { id: true, titulo: true, userId: true },
  });
  if (!projeto) return res.status(404).json({ mensagem: "Projeto pendente não encontrado." });

  const statusAprovacao = decisao === "APROVAR" ? "APROVADO" : "RECUSADO";
  const projetoAtualizado = await prisma.$transaction(async (transacao) => {
    const atualizado = await transacao.project.update({
      where: { id: projetoId },
      data: { statusAprovacao },
    });

    await criarNotificacao(transacao, "projetos", {
        userId: projeto.userId,
        tipo: decisao === "APROVAR" ? "PROJETO_APROVADO" : "PROJETO_RECUSADO",
        titulo: decisao === "APROVAR" ? "Projeto aprovado" : "Projeto não aprovado",
        mensagem: decisao === "APROVAR"
          ? `Seu projeto "${projeto.titulo}" foi aprovado em ${comunidade.nome}.`
          : `Seu projeto "${projeto.titulo}" não foi aprovado em ${comunidade.nome}.`,
        link: `/projetos/${projeto.id}`,
    });
    return atualizado;
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

  if (
    (titulo !== undefined && (typeof titulo !== "string" || !titulo.trim())) ||
    (descricao !== undefined && (typeof descricao !== "string" || !descricao.trim()))
  ) {
    return res.status(400).json({
      mensagem: "O título e a descrição não podem ficar vazios.",
    });
  }

  if (titulo === undefined && descricao === undefined) {
    return res.status(400).json({
      mensagem: "Informe um título ou uma descrição para atualizar.",
    });
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

  const midias = await prisma.projectMedia.findMany({
    where: { projectId: id },
    select: { url: true },
  });

  const projeto = await prisma.project.delete({
    where: {
      id,
    },
  });

  await Promise.all(midias.map((midia) => deletarArquivo(midia.url)));

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
      _count: { select: { curtidas: true } },
      curtidas: {
        where: { userId: Number(userId) },
        select: { userId: true },
      },
    },
    orderBy: [{ curtidas: { _count: "desc" } }, { createdAt: "desc" }],
  });

  res.status(200).json({
    projetos
  })
}

async function validarAcessoCurtida(req: Request, res: Response) {
  const projectId = Number(req.params.id);
  const userId = req.userId;
  if (!Number.isSafeInteger(projectId) || projectId <= 0) {
    res.status(400).json({ mensagem: "ID do projeto inválido." });
    return null;
  }
  if (!userId) {
    res.status(401).json({ mensagem: "Usuário não autenticado." });
    return null;
  }

  const projeto = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, communityId: true },
  });
  if (!projeto) {
    res.status(404).json({ mensagem: "Projeto não encontrado." });
    return null;
  }

  if (projeto.communityId !== null) {
    const membro = await prisma.communityMember.findUnique({
      where: {
        userId_communityId: {
          userId: Number(userId),
          communityId: projeto.communityId,
        },
      },
      select: { status: true },
    });
    if (membro?.status !== "APROVADO") {
      res.status(403).json({
        mensagem: "Somente membros aprovados podem curtir projetos desta comunidade.",
      });
      return null;
    }
  }

  return { projectId, userId: Number(userId) };
}

export async function curtirProjeto(req: Request, res: Response) {
  const acesso = await validarAcessoCurtida(req, res);
  if (!acesso) return;

  await prisma.projectLike.upsert({
    where: {
      projectId_userId: {
        projectId: acesso.projectId,
        userId: acesso.userId,
      },
    },
    create: { projectId: acesso.projectId, userId: acesso.userId },
    update: {},
  });

  const curtidas = await prisma.projectLike.count({
    where: { projectId: acesso.projectId },
  });
  return res.status(200).json({ curtidas, curtido: true });
}

export async function descurtirProjeto(req: Request, res: Response) {
  const acesso = await validarAcessoCurtida(req, res);
  if (!acesso) return;

  await prisma.projectLike.deleteMany({
    where: {
      projectId: acesso.projectId,
      userId: acesso.userId,
    },
  });

  const curtidas = await prisma.projectLike.count({
    where: { projectId: acesso.projectId },
  });
  return res.status(200).json({ curtidas, curtido: false });
}
