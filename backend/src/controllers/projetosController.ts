import type { Request, Response } from "express";
import prisma from "../lib/prisma";

export async function criarProjeto(req: Request, res: Response) {
  const { titulo, descricao } = req.body;
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
  }

  const projeto = await prisma.project.create({
    data: {
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      userId: Number(userId),
    },
  });

  res.status(201).json({
    mensagem: "Projeto criado com susseso!",
    projeto,
  });
}

export async function listarProjetos(req: Request, res: Response) {
  const projetos = await prisma.project.findMany({
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

export async function atualizarProjeto(req: Request, res: Response) {
  const id = Number(req.params.id);
  const { titulo, descricao } = req.body;

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

  if (Number.isNaN(id)) {
    res.status(400).json({
      mensagem: "ID invalido",
    });
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
