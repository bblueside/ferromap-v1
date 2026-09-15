import { Router } from 'express';
import { getAllAgentsLog } from '../controller/agentLog.controller.js';
import { getAllAgentRecords } from '../controller/agentRecord.controller.js';
import { requireAuth } from '../middleware/requireAuth.middleware.js';

const router = Router();

// Datos de Control Operativo: exige sesión en todas las rutas del router.
router.use(requireAuth);

router.route('/getAllAgentsLog').get(getAllAgentsLog);
router.route('/getAllAgentRecords').get(getAllAgentRecords);

export default router;
