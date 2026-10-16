import { Router } from "express";
import {
  listarNotificacoes,
  obterPreferenciasNotificacao,
  atualizarPreferenciasNotificacao,
  marcarNotificacaoComoLida,
  marcarTodasComoLidas,
} from "../controllers/notificacoesController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.use(authMiddleware);
router.get("/", listarNotificacoes);
router.get("/preferencias", obterPreferenciasNotificacao);
router.patch("/preferencias", atualizarPreferenciasNotificacao);
router.patch("/lidas", marcarTodasComoLidas);
router.patch("/:notificacaoId/lida", marcarNotificacaoComoLida);

export default router;
