import type { Request, Response } from "express";
import prisma from "../lib/prisma";

export async function criarEtapa(req: Request, res: Response) {
  const { titulo, conteudo, ordem } = req.body;
  const userId = req.userId;

  if (!titulo || !conteudo || !ordem) {
    res.status(400).json({
      mensagem: "Preencha todos os campos",
    });
    return;
  }

  const projetoId = Number(req.params.projetoId);

  if (Number.isNaN(projetoId)) {
    res.status(400).json({
      mensagem: "ID invalido",
    });
    return;
  }

  const projeto = await prisma.project.findUnique({
    where: {
      id: projetoId,
    },
  });

  if (!projeto) {
    res.status(404).json({
      mensagem: "Projeto invalido",
    });
    return;
  }

  if (projeto.userId !== userId) {
    res.status(403).json({
      mensagem: "Você não pode adicionar etapas neste projeto",
    });
    return;
  }

  const etapa = await prisma.projectStep.create({
    data: {
      titulo: titulo.trim(),
      conteudo: conteudo.trim(),
      ordem: Number(ordem),
      projectId: projetoId,
    },
  });

  res.status(201).json({
    mensagem: "Etapa criada com sucesso",
    etapa,
  });
}


export async function listarEtapas(req: Request, res: Response) {
  const projetoId = Number(req.params.projetoId);

  if (Number.isNaN(projetoId)) {
    res.status(400).json({
      mensagem: "ID do projeto invalido",
    });
    return;
  }

  const projeto = await prisma.project.findUnique({
    where: {
      id: projetoId,
    },
  });

  if (!projeto) {
    res.status(404).json({
      mensagem: "Projeto invalido",
    });
    return;
  }

  const etapas = await prisma.projectStep.findMany({
    where: {
      projectId: projetoId,
    },
    orderBy: {
      ordem: "asc",
    },
  });

  res.status(200).json({
    etapas,
  });
}


export async function atualizarEtapas(req: Request, res: Response) {
  const etapaId = Number(req.params.etapaId);
  const { titulo, conteudo, ordem } = req.body;
  const userId = req.userId;

  if (Number.isNaN(etapaId)) {
    res.status(400).json({
      mensagem: "ID da etapa invalido",
    });
    return;
  }

  if (!userId) {
    res.status(401).json({
      mensagem: "Usuario nao autenticado",
    });
    return;
  }

  const etapa = await prisma.projectStep.findUnique({
    where: {
      id: etapaId,
    },
    include: {
      project: true,
    },
  });

  if (!etapa) {
    res.status(404).json({
      mensagem: "Etapa não encontrada",
    });
    return;
  }

  if (etapa.project.userId !== userId) {
    res.status(403).json({
      mensagem: "Voce não pode editar essa etapa",
    });
    return;
  }

  const etapaAtualizada = await prisma.projectStep.update({
    where: {
      id: etapaId,
    },
    data: {
      titulo: titulo?.trim(),
      conteudo: conteudo?.trim(),
      ordem: ordem !== undefined ? Number(ordem) : undefined,
    },
  });

  res.status(200).json({
    mensagem: "Etapa atualizada com sucesso",
    etapaAtualizada,
  });
}


export async function deletarEtapa(req: Request, res: Response) {
  const etapaId = Number(req.params.etapaId);
  const userId = req.userId;

  if (Number.isNaN(etapaId)) {
    res.status(400).json({
      mensagem: "ID da etapa invalido",
    });
    return;
  }

  if (!userId) {
    res.status(401).json({
      mensagem: "Usuario não autenticado",
    });
    return;
  }

  const etapa = await prisma.projectStep.findUnique({
    where: {
      id: etapaId,
    },
    include: {
      project: true,
    },
  });

  if (!etapa) {
    res.status(404).json({
      mensagem: "Etapa não encontrada",
    });
    return;
  }

  if (etapa.project.userId !== userId) {
    res.status(403).json({
      mensagem: "Voce não pode deletar essa etapa",
    });
    return;
  }

  const etapaDeletar = await prisma.projectStep.delete({
    where: {
      id: etapaId,
    },
  });

  res.status(200).json({
    mensagem: "Etapa deletada com sucesso",
    etapaDeletar,
  });
}
