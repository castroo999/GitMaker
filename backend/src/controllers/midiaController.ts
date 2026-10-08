import type { Request, Response } from "express";
import prisma from "../lib/prisma";
import { enviarArquivo, deletarArquivo } from "../services/storageService";

export async function criarMidia(req: Request, res: Response) {
  try {
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

    const arquivo = await enviarArquivo(midia, projetoId);

    const midiaCriada = await prisma.projectMedia.create({
      data: {
        nome: midia.originalname,
        tipo: midia.mimetype,
        url: arquivo.url,
        projectId: projetoId,
      },
    });

    res.status(201).json({
      mensagem: "Mídia criada com sucesso",
      midia: midiaCriada,
    });
  } catch (erro) {
    console.error("Erro ao criar mídia:", erro);

    res.status(500).json({
      mensagem: "Erro ao criar mídia",
    });
  }
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
  try {
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

    const novoArquivo = await enviarArquivo(novaMidia, midia.projectId);

    const midiaAtualizada = await prisma.projectMedia.update({
      where: {
        id: midiaId,
      },
      data: {
        nome: novaMidia.originalname,
        tipo: novaMidia.mimetype,
        url: novoArquivo.url,
      },
    });

    await deletarArquivo(midia.url);

    res.status(200).json({
      mensagem: "Mídia atualizada com sucesso",
      midia: midiaAtualizada,
    });
  } catch (erro) {
    console.error("Erro ao atualizar mídia:", erro);

    res.status(500).json({
      mensagem: "Erro ao atualizar mídia",
    });
  }
}

export async function deletarMidia(req: Request, res: Response) {
  try {
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

    await prisma.projectMedia.delete({
      where: {
        id: midiaId,
      },
    });

    await deletarArquivo(midia.url);

    res.status(200).json({
      mensagem: "Mídia deletada com sucesso",
    });
  } catch (erro) {
    console.error("Erro ao deletar mídia:", erro);

    res.status(500).json({
      mensagem: "Erro ao deletar mídia",
    });
  }
}

export async function criarMidiaEtapa(req: Request, res: Response) {
  try {
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

    const arquivo = await enviarArquivo(midia, projetoId);

    const midiaCriada = await prisma.projectMedia.create({
      data: {
        nome: midia.originalname,
        tipo: midia.mimetype,
        url: arquivo.url,
        projectId: projetoId,
        stepId: etapaId,
      },
    });

    res.status(201).json({
      mensagem: "Mídia da etapa criada com sucesso",
      midia: midiaCriada,
    });
  } catch (erro) {
    console.error("Erro ao criar mídia da etapa:", erro);

    res.status(500).json({
      mensagem: "Erro ao criar mídia da etapa",
    });
  }
}