import type { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma";
import { deletarArquivo, enviarMidiaPublicacao } from "../services/storageService";

const TIPOS_ENTRADA = ["LIVRE", "APROVACAO"];

function validarId(valor: string | string[] | undefined): number | null {
    if (typeof valor !== "string" || !valor.trim()) {
        return null;
    }

    const id = Number(valor);

    if (!Number.isSafeInteger(id) || id <= 0) {
        return null;
    }

    return id;
}

function responderErro(res: Response, erro: unknown) {
    console.error(erro);

    return res.status(500).json({
        mensagem: "Ocorreu um erro interno no servidor.",
    });
}

// CRIAR COMUNIDADE
export async function criarComunidade(req: Request, res: Response) {
    try {
        const { nome, descricao, tipoEntrada } = req.body;
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({
                mensagem: "Usuário não autenticado.",
            });
        }

        if (
            typeof nome !== "string" ||
            typeof descricao !== "string" ||
            !nome.trim() ||
            !descricao.trim()
        ) {
            return res.status(400).json({
                mensagem: "Preencha o nome e a descrição da comunidade.",
            });
        }

        const tipo = tipoEntrada ?? "LIVRE";

        if (
            typeof tipo !== "string" ||
            !TIPOS_ENTRADA.includes(tipo)
        ) {
            return res.status(400).json({
                mensagem: "Tipo de entrada inválido. Use LIVRE ou APROVACAO.",
            });
        }

        const comunidade = await prisma.community.create({
            data: {
                nome: nome.trim(),
                descricao: descricao.trim(),
                tipoEntrada: tipo,
                creatorId: Number(userId),
                membros: {
                    create: {
                        userId: Number(userId),
                        status: "APROVADO",
                    },
                },
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        nome: true,
                    },
                },
                _count: {
                    select: {
                        membros: {
                            where: { status: "APROVADO" },
                        },
                        posts: true,
                    },
                },
            },
        });

        return res.status(201).json({
            mensagem: "Comunidade criada com sucesso.",
            comunidade,
        });
    } catch (erro) {
        return responderErro(res, erro);
    }
}

// LISTAR COMUNIDADES
export async function listarComunidades(req: Request, res: Response) {
    try {
        const comunidades = await prisma.community.findMany({
            include: {
                creator: {
                    select: {
                        id: true,
                        nome: true,
                    },
                },
                _count: {
                    select: {
                        membros: {
                            where: { status: "APROVADO" },
                        },
                        posts: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return res.status(200).json({ comunidades });
    } catch (erro) {
        return responderErro(res, erro);
    }
}

// SOLICITAR ENTRADA OU ENTRAR EM UMA COMUNIDADE LIVRE
export async function solicitarEntrada(req: Request, res: Response) {
    try {
        const userId = req.userId;
        const communityId = validarId(req.params.communityId);

        if (!userId) {
            return res.status(401).json({
                mensagem: "Usuário não autenticado.",
            });
        }

        if (!communityId) {
            return res.status(400).json({
                mensagem: "ID da comunidade inválido.",
            });
        }

        const comunidade = await prisma.community.findUnique({
            where: { id: communityId },
            select: {
                id: true,
                nome: true,
                tipoEntrada: true,
                creatorId: true,
            },
        });

        if (!comunidade) {
            return res.status(404).json({
                mensagem: "Comunidade não encontrada.",
            });
        }

        const usuarioId = Number(userId);

        if (comunidade.creatorId === usuarioId) {
            return res.status(400).json({
                mensagem: "Você já é o criador desta comunidade.",
            });
        }

        const membroExistente = await prisma.communityMember.findUnique({
            where: {
                userId_communityId: {
                    userId: usuarioId,
                    communityId,
                },
            },
        });

        if (membroExistente?.status === "BANIDO") {
            return res.status(403).json({
                mensagem: "Você foi banido e não pode acessar esta comunidade.",
            });
        }

        const bloqueadoAte = membroExistente?.status === "REMOVIDO"
            ? new Date(membroExistente.createdAt.getTime() + 2 * 24 * 60 * 60 * 1000)
            : null;

        if (bloqueadoAte && bloqueadoAte > new Date()) {
            return res.status(403).json({
                mensagem: `Você poderá solicitar entrada novamente em ${bloqueadoAte.toLocaleString("pt-BR")}.`,
                bloqueadoAte,
            });
        }

        if (membroExistente?.status === "APROVADO") {
            return res.status(409).json({
                mensagem: "Você já faz parte desta comunidade.",
            });
        }

        if (membroExistente?.status === "PENDENTE") {
            return res.status(409).json({
                mensagem: "Sua solicitação já está aguardando aprovação.",
            });
        }

        if (comunidade.tipoEntrada === "LIVRE") {
            const membro = membroExistente
                ? await prisma.communityMember.update({
                    where: {
                        userId_communityId: {
                            userId: usuarioId,
                            communityId,
                        },
                    },
                    data: {
                        status: "APROVADO",
                        statusContribuicao: "NAO_SOLICITADO",
                        createdAt: new Date(),
                    },
                })
                : await prisma.communityMember.create({
                    data: {
                        userId: usuarioId,
                        communityId,
                        status: "APROVADO",
                    },
                });

            return res.status(200).json({
                mensagem: "Você entrou na comunidade com sucesso.",
                status: membro.status,
            });
        }

        if (comunidade.tipoEntrada === "APROVACAO") {
            const membro = membroExistente
                ? await prisma.communityMember.update({
                    where: {
                        userId_communityId: {
                            userId: usuarioId,
                            communityId,
                        },
                    },
                    data: {
                        status: "PENDENTE",
                        statusContribuicao: "NAO_SOLICITADO",
                        createdAt: new Date(),
                    },
                })
                : await prisma.communityMember.create({
                    data: {
                        userId: usuarioId,
                        communityId,
                        status: "PENDENTE",
                    },
                });

            return res.status(201).json({
                mensagem: "Solicitação enviada. Aguarde a aprovação do moderador.",
                status: membro.status,
            });
        }

        return res.status(400).json({
            mensagem: "Tipo de entrada da comunidade inválido.",
        });
    } catch (erro) {
        return responderErro(res, erro);
    }
}

// CONSULTAR A PARTICIPAÇÃO DO USUÁRIO AUTENTICADO
export async function consultarMinhaParticipacao(req: Request, res: Response) {
    try {
        const userId = req.userId;
        const communityId = validarId(req.params.communityId);

        if (!userId) {
            return res.status(401).json({
                mensagem: "Usuário não autenticado.",
            });
        }

        if (!communityId) {
            return res.status(400).json({
                mensagem: "ID da comunidade inválido.",
            });
        }

        const membro = await prisma.communityMember.findUnique({
            where: {
                userId_communityId: {
                    userId: Number(userId),
                    communityId,
                },
            },
            select: { status: true, statusContribuicao: true, createdAt: true },
        });

        return res.status(200).json({
            status: membro?.status ?? null,
            statusContribuicao: membro?.statusContribuicao ?? null,
            bloqueadoAte: membro?.status === "REMOVIDO"
                ? new Date(membro.createdAt.getTime() + 2 * 24 * 60 * 60 * 1000)
                : null,
        });
    } catch (erro) {
        return responderErro(res, erro);
    }
}

// LISTAR SOLICITAÇÕES PENDENTES (SOMENTE O CRIADOR)
export async function listarSolicitacoes(req: Request, res: Response) {
    try {
        const userId = req.userId;
        const communityId = validarId(req.params.communityId);

        if (!userId) {
            return res.status(401).json({
                mensagem: "Usuário não autenticado.",
            });
        }

        if (!communityId) {
            return res.status(400).json({
                mensagem: "ID da comunidade inválido.",
            });
        }

        const comunidade = await prisma.community.findUnique({
            where: { id: communityId },
            select: {
                id: true,
                creatorId: true,
            },
        });

        if (!comunidade) {
            return res.status(404).json({
                mensagem: "Comunidade não encontrada.",
            });
        }

        if (comunidade.creatorId !== Number(userId)) {
            return res.status(403).json({
                mensagem: "Somente o criador pode gerenciar as solicitações.",
            });
        }

        const solicitacoes = await prisma.communityMember.findMany({
            where: {
                communityId,
                status: "PENDENTE",
            },
            include: {
                user: {
                    select: {
                        id: true,
                        nome: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: "asc",
            },
        });

        return res.status(200).json({ solicitacoes });
    } catch (erro) {
        return responderErro(res, erro);
    }
}

// APROVAR OU RECUSAR UMA SOLICITAÇÃO (SOMENTE O CRIADOR)
export async function decidirSolicitacao(req: Request, res: Response) {
    try {
        const userId = req.userId;
        const communityId = validarId(req.params.communityId);
        const membroId = validarId(req.params.membroId);
        const { decisao } = req.body;

        if (!userId) {
            return res.status(401).json({
                mensagem: "Usuário não autenticado.",
            });
        }

        if (!communityId || !membroId) {
            return res.status(400).json({
                mensagem: "ID da comunidade ou do membro inválido.",
            });
        }

        if (!["APROVAR", "RECUSAR"].includes(decisao)) {
            return res.status(400).json({
                mensagem: "Decisão inválida. Use APROVAR ou RECUSAR.",
            });
        }

        const comunidade = await prisma.community.findUnique({
            where: { id: communityId },
            select: {
                id: true,
                creatorId: true,
            },
        });

        if (!comunidade) {
            return res.status(404).json({
                mensagem: "Comunidade não encontrada.",
            });
        }

        if (comunidade.creatorId !== Number(userId)) {
            return res.status(403).json({
                mensagem: "Somente o criador pode decidir as solicitações.",
            });
        }

        const membro = await prisma.communityMember.findFirst({
            where: {
                id: membroId,
                communityId,
                status: "PENDENTE",
            },
        });

        if (!membro) {
            return res.status(404).json({
                mensagem: "Solicitação pendente não encontrada.",
            });
        }

        const status = decisao === "APROVAR" ? "APROVADO" : "RECUSADO";

        const membroAtualizado = await prisma.communityMember.update({
            where: { id: membroId },
            data: {
                status,
                ...(decisao === "APROVAR" ? { statusContribuicao: "APROVADO" } : {}),
            },
        });

        return res.status(200).json({
            mensagem: decisao === "APROVAR"
                ? "Solicitação aprovada. O usuário agora é membro."
                : "Solicitação recusada.",
            membro: membroAtualizado,
        });
    } catch (erro) {
        return responderErro(res, erro);
    }
}

// LISTAR MEMBROS APROVADOS (SOMENTE MEMBROS DA COMUNIDADE)
export async function listarMembros(req: Request, res: Response) {
    try {
        const userId = req.userId;
        const communityId = validarId(req.params.communityId);

        if (!userId) {
            return res.status(401).json({
                mensagem: "Usuário não autenticado.",
            });
        }

        if (!communityId) {
            return res.status(400).json({
                mensagem: "ID da comunidade inválido.",
            });
        }

        const comunidade = await prisma.community.findUnique({
            where: { id: communityId },
            select: { id: true },
        });

        if (!comunidade) {
            return res.status(404).json({
                mensagem: "Comunidade não encontrada.",
            });
        }

        const membroAtual = await prisma.communityMember.findUnique({
            where: {
                userId_communityId: {
                    userId: Number(userId),
                    communityId,
                },
            },
        });

        if (membroAtual?.status !== "APROVADO") {
            return res.status(403).json({
                mensagem: "Você precisa ser membro aprovado para ver os membros.",
            });
        }

        const membros = await prisma.communityMember.findMany({
            where: {
                communityId,
                status: "APROVADO",
            },
            include: {
                user: {
                    select: {
                        id: true,
                        nome: true,
                    },
                },
            },
            orderBy: {
                createdAt: "asc",
            },
        });

        return res.status(200).json({ membros });
    } catch (erro) {
        return responderErro(res, erro);
    }
}

// SAIR DA COMUNIDADE
export async function sairDaComunidade(req: Request, res: Response) {
    try {
        const userId = req.userId;
        const communityId = validarId(req.params.communityId);

        if (!userId) return res.status(401).json({ mensagem: "Usuário não autenticado." });
        if (!communityId) return res.status(400).json({ mensagem: "ID da comunidade inválido." });

        const comunidade = await prisma.community.findUnique({
            where: { id: communityId },
            select: { creatorId: true },
        });
        if (!comunidade) return res.status(404).json({ mensagem: "Comunidade não encontrada." });
        if (comunidade.creatorId === Number(userId)) {
            return res.status(400).json({ mensagem: "O criador não pode sair da própria comunidade." });
        }

        const membro = await prisma.communityMember.findUnique({
            where: {
                userId_communityId: { userId: Number(userId), communityId },
            },
        });
        if (membro?.status !== "APROVADO") {
            return res.status(404).json({ mensagem: "Você não é membro desta comunidade." });
        }

        await prisma.communityMember.update({
            where: { id: membro.id },
            data: { status: "SAIU", statusContribuicao: "NAO_SOLICITADO" },
        });

        return res.status(200).json({ mensagem: "Você saiu da comunidade." });
    } catch (erro) {
        return responderErro(res, erro);
    }
}

// REMOVER TEMPORARIAMENTE OU BANIR MEMBRO (SOMENTE O CRIADOR)
export async function gerenciarMembro(req: Request, res: Response) {
    try {
        const userId = req.userId;
        const communityId = validarId(req.params.communityId);
        const membroId = validarId(req.params.membroId);
        const { acao } = req.body;

        if (!userId) return res.status(401).json({ mensagem: "Usuário não autenticado." });
        if (!communityId || !membroId) {
            return res.status(400).json({ mensagem: "ID da comunidade ou do membro inválido." });
        }
        if (!["REMOVER", "BANIR"].includes(acao)) {
            return res.status(400).json({ mensagem: "Ação inválida. Use REMOVER ou BANIR." });
        }

        const comunidade = await prisma.community.findUnique({
            where: { id: communityId },
            select: { creatorId: true },
        });
        if (!comunidade) return res.status(404).json({ mensagem: "Comunidade não encontrada." });
        if (comunidade.creatorId !== Number(userId)) {
            return res.status(403).json({ mensagem: "Somente o criador pode gerenciar os membros." });
        }

        const membro = await prisma.communityMember.findFirst({
            where: { id: membroId, communityId, status: "APROVADO", userId: { not: Number(userId) } },
        });
        if (!membro) return res.status(404).json({ mensagem: "Membro aprovado não encontrado." });

        const banido = acao === "BANIR";
        await prisma.communityMember.update({
            where: { id: membroId },
            data: {
                status: banido ? "BANIDO" : "REMOVIDO",
                statusContribuicao: "NAO_SOLICITADO",
                createdAt: new Date(),
            },
        });

        return res.status(200).json({
            mensagem: banido
                ? "Membro banido permanentemente da comunidade."
                : "Membro removido. Ele poderá solicitar entrada novamente após 2 dias.",
        });
    } catch (erro) {
        return responderErro(res, erro);
    }
}

// MIDDLEWARE PARA PROTEGER CONTEÚDO DA COMUNIDADE
export async function verificarMembroComunidade(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.userId;
        const communityId = validarId(req.params.communityId);

        if (!userId) {
            return res.status(401).json({
                mensagem: "Usuário não autenticado.",
            });
        }

        if (!communityId) {
            return res.status(400).json({
                mensagem: "ID da comunidade inválido.",
            });
        }

        const comunidade = await prisma.community.findUnique({
            where: { id: communityId },
            select: { id: true },
        });

        if (!comunidade) {
            return res.status(404).json({
                mensagem: "Comunidade não encontrada.",
            });
        }

        const membro = await prisma.communityMember.findUnique({
            where: {
                userId_communityId: {
                    userId: Number(userId),
                    communityId,
                },
            },
        });

        if (membro?.status !== "APROVADO") {
            return res.status(403).json({
                mensagem: "Você não tem acesso a esta comunidade.",
            });
        }

        return next();
    } catch (erro) {
        return responderErro(res, erro);
    }
}

// LISTAR PUBLICAÇÕES DA COMUNIDADE (SOMENTE MEMBROS APROVADOS)
export async function listarPublicacoes(req: Request, res: Response) {
    try {
        const userId = req.userId;
        const communityId = validarId(req.params.communityId);

        if (!userId) {
            return res.status(401).json({ mensagem: "Usuário não autenticado." });
        }
        if (!communityId) {
            return res.status(400).json({ mensagem: "ID da comunidade inválido." });
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
            return res.status(403).json({ mensagem: "Você precisa ser membro aprovado para ver as publicações." });
        }

        const publicacoes = await prisma.communityPost.findMany({
            where: { communityId },
            include: {
                author: { select: { id: true, nome: true } },
                midias: { select: { id: true, nome: true, tipo: true, url: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 100,
        });

        return res.status(200).json({ publicacoes });
    } catch (erro) {
        return responderErro(res, erro);
    }
}

// CRIAR PUBLICAÇÃO NA COMUNIDADE (SOMENTE MEMBROS APROVADOS)
export async function criarPublicacao(req: Request, res: Response) {
    try {
        const userId = req.userId;
        const communityId = validarId(req.params.communityId);
        const conteudo = typeof req.body.conteudo === "string" ? req.body.conteudo.trim() : "";
        const arquivos = (req.files || []) as Express.Multer.File[];

        if (!userId) {
            return res.status(401).json({ mensagem: "Usuário não autenticado." });
        }
        if (!communityId) {
            return res.status(400).json({ mensagem: "ID da comunidade inválido." });
        }
        if (!conteudo && arquivos.length === 0) {
            return res.status(400).json({ mensagem: "Escreva uma mensagem ou anexe uma imagem ou vídeo." });
        }

        const comunidade = await prisma.community.findUnique({
            where: { id: communityId },
            select: { id: true, creatorId: true, tipoEntrada: true },
        });

        if (!comunidade) {
            return res.status(404).json({ mensagem: "Comunidade não encontrada." });
        }

        const membro = await prisma.communityMember.findUnique({
            where: {
                userId_communityId: {
                    userId: Number(userId),
                    communityId,
                },
            },
            select: { status: true, statusContribuicao: true },
        });

        if (
            membro?.status !== "APROVADO" ||
            (comunidade.creatorId !== Number(userId) &&
                (comunidade.tipoEntrada === "LIVRE"
                    ? membro.statusContribuicao !== "APROVADO"
                    : ["RECUSADO", "PENDENTE"].includes(membro.statusContribuicao)))
        ) {
            return res.status(403).json({ mensagem: "Você precisa da permissão do criador para publicar nesta comunidade." });
        }

        const midiasEnviadas: { nome: string; tipo: string; url: string }[] = [];
        const urlsEnviadas: string[] = [];

        try {
            for (const arquivo of arquivos) {
                if (!arquivo.mimetype.startsWith("image/") && !arquivo.mimetype.startsWith("video/")) {
                    return res.status(400).json({ mensagem: "Envie somente imagens ou vídeos." });
                }

                const midia = await enviarMidiaPublicacao(arquivo, communityId);
                urlsEnviadas.push(midia.url);
                midiasEnviadas.push({
                    nome: arquivo.originalname,
                    tipo: arquivo.mimetype,
                    url: midia.url,
                });
            }

            const publicacao = await prisma.communityPost.create({
                data: {
                    titulo: "Publicação",
                    conteudo,
                    authorId: Number(userId),
                    communityId,
                    midias: { create: midiasEnviadas },
                },
                include: {
                    author: { select: { id: true, nome: true } },
                    midias: { select: { id: true, nome: true, tipo: true, url: true } },
                },
            });

            return res.status(201).json({ publicacao });
        } catch (erro) {
            await Promise.all(urlsEnviadas.map((url) => deletarArquivo(url)));
            throw erro;
        }
    } catch (erro) {
        return responderErro(res, erro);
    }
}

// SOLICITAR PERMISSÃO PARA PUBLICAR NA COMUNIDADE
export async function solicitarPermissaoContribuicao(req: Request, res: Response) {
    try {
        const userId = req.userId;
        const communityId = validarId(req.params.communityId);

        if (!userId) return res.status(401).json({ mensagem: "Usuário não autenticado." });
        if (!communityId) return res.status(400).json({ mensagem: "ID da comunidade inválido." });

        const comunidade = await prisma.community.findUnique({
            where: { id: communityId },
            select: { id: true, creatorId: true, tipoEntrada: true },
        });

        if (!comunidade) return res.status(404).json({ mensagem: "Comunidade não encontrada." });
        if (comunidade.creatorId === Number(userId)) {
            return res.status(400).json({ mensagem: "O criador já pode publicar." });
        }

        const membro = await prisma.communityMember.findUnique({
            where: {
                userId_communityId: { userId: Number(userId), communityId },
            },
        });

        if (membro?.status !== "APROVADO") {
            return res.status(403).json({ mensagem: "Entre na comunidade antes de solicitar permissão." });
        }
        if (membro.statusContribuicao === "PENDENTE") {
            return res.status(409).json({ mensagem: "Sua solicitação de contribuição já está aguardando aprovação." });
        }
        if (membro.statusContribuicao === "APROVADO") {
            return res.status(409).json({ mensagem: "Você já tem permissão para publicar nesta comunidade." });
        }

        await prisma.communityMember.update({
            where: { id: membro.id },
            data: { statusContribuicao: "PENDENTE" },
        });

        return res.status(200).json({
            mensagem: "Solicitação enviada ao criador da comunidade.",
            statusContribuicao: "PENDENTE",
        });
    } catch (erro) {
        return responderErro(res, erro);
    }
}

// LISTAR SOLICITAÇÕES DE CONTRIBUIÇÃO (SOMENTE O CRIADOR)
export async function listarSolicitacoesContribuicao(req: Request, res: Response) {
    try {
        const userId = req.userId;
        const communityId = validarId(req.params.communityId);

        if (!userId) return res.status(401).json({ mensagem: "Usuário não autenticado." });
        if (!communityId) return res.status(400).json({ mensagem: "ID da comunidade inválido." });

        const comunidade = await prisma.community.findUnique({
            where: { id: communityId },
            select: { creatorId: true },
        });

        if (!comunidade) return res.status(404).json({ mensagem: "Comunidade não encontrada." });
        if (comunidade.creatorId !== Number(userId)) {
            return res.status(403).json({ mensagem: "Somente o criador pode aprovar contribuidores." });
        }

        const solicitacoes = await prisma.communityMember.findMany({
            where: {
                communityId,
                status: "APROVADO",
                userId: { not: Number(userId) },
            },
            include: {
                user: { select: { id: true, nome: true, email: true } },
            },
            orderBy: { createdAt: "asc" },
        });

        return res.status(200).json({ solicitacoes });
    } catch (erro) {
        return responderErro(res, erro);
    }
}

// APROVAR OU RECUSAR PERMISSÃO PARA CONTRIBUIR (SOMENTE O CRIADOR)
export async function decidirPermissaoContribuicao(req: Request, res: Response) {
    try {
        const userId = req.userId;
        const communityId = validarId(req.params.communityId);
        const membroId = validarId(req.params.membroId);
        const { decisao } = req.body;

        if (!userId) return res.status(401).json({ mensagem: "Usuário não autenticado." });
        if (!communityId || !membroId) {
            return res.status(400).json({ mensagem: "ID da comunidade ou do membro inválido." });
        }
        if (!["APROVAR", "RECUSAR", "REVOGAR"].includes(decisao)) {
            return res.status(400).json({ mensagem: "Decisão inválida." });
        }

        const comunidade = await prisma.community.findUnique({
            where: { id: communityId },
            select: { creatorId: true },
        });

        if (!comunidade) return res.status(404).json({ mensagem: "Comunidade não encontrada." });
        if (comunidade.creatorId !== Number(userId)) {
            return res.status(403).json({ mensagem: "Somente o criador pode aprovar contribuidores." });
        }

        const solicitacao = await prisma.communityMember.findFirst({
            where: {
                id: membroId,
                communityId,
                status: "APROVADO",
                userId: { not: Number(userId) },
            },
        });

        if (!solicitacao) {
            return res.status(404).json({ mensagem: "Solicitação de contribuição não encontrada." });
        }

        const statusContribuicao = decisao === "APROVAR" ? "APROVADO" : "RECUSADO";
        await prisma.communityMember.update({
            where: { id: membroId },
            data: { statusContribuicao },
        });

        return res.status(200).json({
            mensagem: decisao === "APROVAR"
                ? "Permissão para publicar aprovada."
                : decisao === "REVOGAR"
                    ? "Permissão para publicar revogada."
                    : "Solicitação recusada.",
            statusContribuicao,
        });
    } catch (erro) {
        return responderErro(res, erro);
    }
}
