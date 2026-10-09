import { Router } from "express";
import {
  criarEtapa,
  listarEtapas,
  atualizarEtapas,
  deletarEtapa,
} from "../controllers/etapasController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/projetos/:projetoId/etapas", authMiddleware, criarEtapa);

router.get("/projetos/:projetoId/etapas", listarEtapas);

router.put("/etapas/:etapaId", authMiddleware, atualizarEtapas);

router.delete("/etapas/:etapaId", authMiddleware, deletarEtapa);

export default router;
