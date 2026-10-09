import { Router } from "express";
import {
    criarComunidade,
    listarComunidades,
    solicitarEntrada,
    listarSolicitacoes,
    decidirSolicitacao,
    listarMembros,
} from "../controllers/comunidadeController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", listarComunidades);
router.post("/", authMiddleware, criarComunidade);

router.post("/:communityId/entrar", authMiddleware, solicitarEntrada);
router.get("/:communityId/solicitacoes", authMiddleware, listarSolicitacoes);
router.patch("/:communityId/solicitacoes/:membroId", authMiddleware, decidirSolicitacao);
router.get("/:communityId/membros", authMiddleware, listarMembros);

export default router;