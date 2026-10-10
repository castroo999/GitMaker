import type { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma";

export async function verificarAcessoProjeto(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const valorId = req.params.projetoId ?? req.params.id;
    const projetoId = Number(valorId);

    if (!Number.isSafeInteger(projetoId) || projetoId <= 0) {
      return res.status(400).json({ mensagem: "ID do projeto inválido." });
    }

    const projeto = await prisma.project.findUnique({
      where: { id: projetoId },
      select: {
        communityId: true,
        userId: true,
        statusAprovacao: true,
        community: { select: { creatorId: true } },
      },
    });

    if (!projeto) {
      return res.status(404).json({ mensagem: "Projeto não encontrado." });
    }

    if (projeto.communityId === null) return next();

    if (!req.userId) {
      return res.status(401).json({ mensagem: "Faça login para acessar este projeto." });
    }

    const membro = await prisma.communityMember.findUnique({
      where: {
        userId_communityId: {
          userId: Number(req.userId),
          communityId: projeto.communityId,
        },
      },
      select: { status: true },
    });

    if (membro?.status !== "APROVADO") {
      return res.status(403).json({
        mensagem: "Este projeto está disponível apenas para membros aprovados da comunidade.",
      });
    }

    if (
      projeto.statusAprovacao !== "APROVADO" &&
      projeto.userId !== Number(req.userId) &&
      projeto.community?.creatorId !== Number(req.userId)
    ) {
      return res.status(403).json({
        mensagem: "Este projeto ainda está em análise pelo criador da comunidade.",
      });
    }

    return next();
  } catch (erro) {
    console.error("Erro ao verificar acesso ao projeto:", erro);
    return res.status(500).json({ mensagem: "Não foi possível validar o acesso ao projeto." });
  }
}
