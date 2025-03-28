import { Router } from 'express';
import { 
  ativarServico,
  atualizarServico,
  criarServico,
  listarServicoPorId,
  listarServicosPorEmpresaLogada,
  listarServicosPorEmpresa,
  softDeleteServico, 
} from '../controllers/servicoController';
import {
  validarEntradaServico,
  validarEntradaUpdateServico,
} from "../middlewares/servicoMiddleware";
import { autenticarToken } from '../middlewares/authMiddleware';

const router = Router();

router.post('/servicos', validarEntradaServico, autenticarToken , criarServico);
router.put('/servicos/:id', validarEntradaUpdateServico, autenticarToken, atualizarServico);
router.get('/servicos/empresa/:empresaId', autenticarToken, listarServicosPorEmpresa);
router.get('/servicos/meus-servicos', autenticarToken, listarServicosPorEmpresaLogada);
router.get("/servicos/:id",autenticarToken, listarServicoPorId);
router.put("/servicos/:id/inativar",autenticarToken, softDeleteServico);
router.put("/servicos/:id/ativar",autenticarToken, ativarServico);


export default router;
