import { Router } from 'express';
import { getAllKpis } from '../controller/kpi.controller.js';
import { getAllPosCoverage } from '../controller/posCoverage.controller.js';
import { getAllPosCoverageGap } from '../controller/posCoverageGap.controller.js';
import { requireAuth } from '../middleware/requireAuth.middleware.js';

const router = Router();

// Datos del Dashboard: exige sesión en todas las rutas del router.
router.use(requireAuth);

router.route('/getAllKpis').get(getAllKpis);
router.route('/getAllPosCoverage').get(getAllPosCoverage);
router.route('/getAllPosCoverageGap').get(getAllPosCoverageGap);

export default router;
