import { Router } from "express";
import {
  criarProjeto,
  listarProjetos,
  atualizarProjeto,
  buscarProjetos,
  deletarProjeto,
  listarMeusProjetos,
  listarProjetosDaComunidade,
  listarProjetosPendentesComunidade,
  decidirProjetoComunidade,
} from "../controllers/projetosController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { verificarAcessoProjeto } from "../middlewares/verificarAcessoProjeto";

const router = Router()

router.post("/criar-projeto", authMiddleware, criarProjeto);

router.get("/comunidade/:communityId/pendentes", authMiddleware, listarProjetosPendentesComunidade);
router.patch("/comunidade/:communityId/:projetoId/aprovacao", authMiddleware, decidirProjetoComunidade);
router.get("/comunidade/:communityId", authMiddleware, listarProjetosDaComunidade);

router.get("/listar-projetos", listarProjetos);

router.get("/buscar-projeto/:id", authMiddleware, verificarAcessoProjeto, buscarProjetos);

router.put("/atualizar-projeto/:id", authMiddleware, verificarAcessoProjeto, atualizarProjeto);

router.delete("/deletar-projeto/:id", authMiddleware, verificarAcessoProjeto, deletarProjeto);

router.get("/meus-projetos", authMiddleware, listarMeusProjetos);

export default router
