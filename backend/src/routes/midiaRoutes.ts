import { Router } from "express";
import {
  criarMidia,
  listarMidia,
  atualizarMidia,
  deletarMidia,
  criarMidiaEtapa,
} from "../controllers/midiaController";
import { authMiddleware } from "../middlewares/authMiddleware";
import upload from "../middlewares/uploadMiddleware";
import { verificarAcessoProjeto } from "../middlewares/verificarAcessoProjeto";

const router = Router();

router.post(
  "/projetos/:projetoId/midias",
  authMiddleware,
  verificarAcessoProjeto,
  upload.single("arquivo"),
  criarMidia,
);

router.get(
  "/projetos/:projetoId/midias",
  authMiddleware,
  verificarAcessoProjeto,
  listarMidia,
);

router.put(
  "/midias/:midiaId",
  authMiddleware,
  upload.single("arquivo"),
  atualizarMidia,
);

router.delete("/midias/:midiaId", authMiddleware, deletarMidia);

router.post(
  "/projetos/:projetoId/etapas/:etapaId/midias",
  authMiddleware,
  verificarAcessoProjeto,
  upload.single("arquivo"),
  criarMidiaEtapa,
);

export default router;
