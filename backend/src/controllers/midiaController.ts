import type { Request, Response } from "express";
import prisma from "../lib/prisma";
import fs from "fs/promises";
import path from "path";

export async function criarMidia(req: Request, res: Response) {
  const projetoId = Number(req.params.projetoId);
  const userId = req.userId;
  const midia = req.file;

  if (!userId) {
    res.status(400).json({
      mensagem: "ID invalido",
    });
    return;
  }

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
    res.status(400).json({
      mensagem: "Erro ao localizar seu projeto",
    });
    return;
  }

  if (projeto.userId !== userId) {
    res.status(403).json({
      mensagem: "voce não pode criar midias para esse projeto",
    });
    return;
  }

  if (!midia) {
    res.status(400).json({
      mensagem: "Nenhum arquivo foi enviado",
    });
    return;
  }

  const midiaCriada = await prisma.projectMedia.create({
    data: {
      nome: midia.originalname,
      tipo: midia.mimetype,
      url: `/uploads/projetos/${midia.filename}`,
      projectId: projetoId,
    },
  });

  res.status(201).json({
    mensagem: "Mídia criada com sucesso",
    midia: midiaCriada,
  });
}

export async function listarMidia(req: Request, res: Response) {
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
      mensagem: "Projeto não encontrado",
    });
    return;
  }

  const midiaListadas = await prisma.projectMedia.findMany({
    where: {
      projectId: projetoId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  res.status(200).json({
    midiaListadas,
  });
}

export async function atualizarMidia(req: Request, res: Response) {
  const midiaId = Number(req.params.midiaId);
  const userId = req.userId;
  const novaMidia = req.file;

  if (!userId) {
    res.status(401).json({
      mensagem: "Usuário não autenticado",
    });
    return;
  }

  if (Number.isNaN(midiaId)) {
    res.status(400).json({
      mensagem: "ID da mídia inválido",
    });
    return;
  }

  if (!novaMidia) {
    res.status(400).json({
      mensagem: "Nenhum arquivo foi enviado",
    });
    return;
  }

  const midia = await prisma.projectMedia.findUnique({
    where: {
      id: midiaId,
    },
  });

  if (!midia) {
    res.status(404).json({
      mensagem: "Mídia não encontrada",
    });
    return;
  }

  const projeto = await prisma.project.findUnique({
    where: {
      id: midia.projectId,
    },
  });

  if (!projeto) {
    res.status(404).json({
      mensagem: "Projeto não encontrado",
    });
    return;
  }

  if (projeto.userId !== userId) {
    res.status(403).json({
      mensagem: "Você não pode atualizar mídias desse projeto",
    });
    return;
  }

  const midiaAtualizada = await prisma.projectMedia.update({
    where: {
      id: midiaId,
    },
    data: {
      nome: novaMidia.originalname,
      tipo: novaMidia.mimetype,
      url: `/uploads/projetos/${novaMidia.filename}`,
    },
  });

  const caminhoArquivoAntigo = path.join(
    process.cwd(),
    midia.url.replace("/uploads/", "uploads/"),
  );

  try {
    await fs.unlink(caminhoArquivoAntigo);
  } catch (erro) {
    console.error("Não foi possível apagar o arquivo antigo:", erro);
  }

  res.status(200).json({
    mensagem: "Mídia atualizada com sucesso",
    midia: midiaAtualizada,
  });
}

export async function deletarMidia(req: Request, res: Response) {
  const midiaId = Number(req.params.midiaId);
  const userId = req.userId;

  if (!userId) {
    res.status(401).json({
      mensagem: "Usuário não autenticado",
    });
    return;
  }

  if (Number.isNaN(midiaId)) {
    res.status(400).json({
      mensagem: "ID da mídia inválido",
    });
    return;
  }

  const midia = await prisma.projectMedia.findUnique({
    where: {
      id: midiaId,
    },
  });

  if (!midia) {
    res.status(404).json({
      mensagem: "Mídia não encontrada",
    });
    return;
  }

  const projeto = await prisma.project.findUnique({
    where: {
      id: midia.projectId,
    },
  });

  if (!projeto) {
    res.status(404).json({
      mensagem: "Projeto não encontrado",
    });
    return;
  }

  if (projeto.userId !== userId) {
    res.status(403).json({
      mensagem: "Você não pode deletar mídias desse projeto",
    });
    return;
  }

  const caminhoArquivo = path.join(
    process.cwd(),
    midia.url.replace("/uploads/", "uploads/"),
  );

  await prisma.projectMedia.delete({
    where: {
      id: midiaId,
    },
  });

  try {
    await fs.unlink(caminhoArquivo);
  } catch (erro) {
    console.error("Não foi possível apagar o arquivo físico:", erro);
  }

  res.status(200).json({
    mensagem: "Mídia deletada com sucesso",
  });
}

export async function criarMidiaEtapa(req: Request, res: Response) {
  const projetoId = Number(req.params.projetoId);
  const etapaId = Number(req.params.etapaId);
  const userId = req.userId;
  const midia = req.file;

  if (!userId) {
    res.status(401).json({
      mensagem: "Usuário não autenticado",
    });
    return;
  }

  if (Number.isNaN(projetoId) || Number.isNaN(etapaId)) {
    res.status(400).json({
      mensagem: "ID inválido",
    });
    return;
  }

  if (!midia) {
    res.status(400).json({
      mensagem: "Nenhum arquivo foi enviado",
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

  if (etapa.projectId !== projetoId) {
    res.status(400).json({
      mensagem: "A etapa não pertence a esse projeto",
    });
    return;
  }

  if (etapa.project.userId !== userId) {
    res.status(403).json({
      mensagem: "Você não pode adicionar mídia nessa etapa",
    });
    return;
  }

  const midiaCriada = await prisma.projectMedia.create({
    data: {
      nome: midia.originalname,
      tipo: midia.mimetype,
      url: `/uploads/projetos/${midia.filename}`,
      projectId: projetoId,
      stepId: etapaId,
    },
  });

  res.status(201).json({
    mensagem: "Mídia da etapa criada com sucesso",
    midia: midiaCriada,
  });
}
