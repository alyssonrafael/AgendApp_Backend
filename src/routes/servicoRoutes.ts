import { Router } from 'express';
import { 
  ativarServico,
  atualizarServico,
  criarServico,
  listarServicoPorId,
  listarServicosDesativadosPorEmpresa,
  listarServicosPorEmpresa,
  softDeleteServico, 
} from '../controllers/servicoController';
import { validarEntradaServico } from '../middlewares/servicoMiddleware';
import { autenticarToken } from '../middlewares/authMiddleware';

const router = Router();

router.post('/servicos', validarEntradaServico,autenticarToken , criarServico);
router.put('/servicos/:id', validarEntradaServico, autenticarToken, atualizarServico);
router.get('/servicos/empresa/:empresaId', autenticarToken, listarServicosPorEmpresa);
router.get('/servicos/desativado/empresa/:empresaId',autenticarToken, listarServicosDesativadosPorEmpresa);
router.get("/servicos/:id",autenticarToken, listarServicoPorId);
router.put("/servicos/:id/inativar",autenticarToken, softDeleteServico);
router.put("/servicos/:id/ativar",autenticarToken, ativarServico);


export default router;
