// rota de teste
import { Router } from 'express';
import { createTeste } from '../controllers/testeController';

const router = Router();

router.post('/teste', createTeste);

export default router;
