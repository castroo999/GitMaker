import { Router } from "express";
import {
    criarComunidade,
    listarComunidades,
    solicitarEntrada,
    consultarMinhaParticipacao,
    listarSolicitacoes,
    decidirSolicitacao,
    listarMembros,
    sairDaComunidade,
    gerenciarMembro,
    listarPublicacoes,
    criarPublicacao,
    solicitarPermissaoContribuicao,
    listarSolicitacoesContribuicao,
    decidirPermissaoContribuicao,
} from "../controllers/comunidadeController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { receberMidiasPublicacao } from "../middlewares/uploadMiddleware";

const router = Router();

router.get("/", listarComunidades);
router.post("/", authMiddleware, criarComunidade);

router.post("/:communityId/entrar", authMiddleware, solicitarEntrada);
router.get("/:communityId/minha-participacao", authMiddleware, consultarMinhaParticipacao);
router.get("/:communityId/solicitacoes", authMiddleware, listarSolicitacoes);
router.patch("/:communityId/solicitacoes/:membroId", authMiddleware, decidirSolicitacao);
router.get("/:communityId/membros", authMiddleware, listarMembros);
router.delete("/:communityId/sair", authMiddleware, sairDaComunidade);
router.patch("/:communityId/membros/:membroId", authMiddleware, gerenciarMembro);
router.get("/:communityId/posts", authMiddleware, listarPublicacoes);
router.post("/:communityId/posts", authMiddleware, receberMidiasPublicacao, criarPublicacao);
router.post("/:communityId/contribuicoes/solicitar", authMiddleware, solicitarPermissaoContribuicao);
router.get("/:communityId/contribuicoes", authMiddleware, listarSolicitacoesContribuicao);
router.patch("/:communityId/contribuicoes/:membroId", authMiddleware, decidirPermissaoContribuicao);

export default router;
