import { Router } from "express";
import {
  criarProjeto,
  listarProjetos,
  atualizarProjeto,
  buscarProjetos,
  deletarProjeto,
  listarMeusProjetos
} from "../controllers/projetosController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router()

router.post("/criar-projeto", authMiddleware, criarProjeto);

router.get("/listar-projetos", listarProjetos);

router.get("/buscar-projeto/:id", buscarProjetos);

router.put("/atualizar-projeto/:id", authMiddleware, atualizarProjeto);

router.delete("/deletar-projeto/:id", authMiddleware, deletarProjeto);

router.get("/meus-projetos", authMiddleware, listarMeusProjetos);

export default router