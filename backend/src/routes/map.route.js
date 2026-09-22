import { Router } from 'express';
import { getAllPos, getAllPosExample } from '../controller/pos.controller.js';
import { getAllTopZones, getAllTopZonesExample } from '../controller/topZone.controller.js';
import { getAllFactories } from '../controller/factory.controller.js';
import { getAllWarehouse } from '../controller/warehouse.controller.js';
import { getAllRoutes } from '../controller/route.controller.js';
import { getPriorityRanking, getPriorityRankingExample, getStatusComparison, getStatusComparisonExample } from '../controller/stats.controller.js';
import { requireAuth } from '../middleware/requireAuth.middleware.js';

const router = Router();

// Todo /api/map alimenta Dashboard, Control Operativo y Mapa: exige sesión.
// `requireAuth` a nivel de router cubre las rutas actuales y las futuras
// sin repetirlo en cada `.get()`.
router.use(requireAuth);

router.route('/getAllPos').get(getAllPos);
router.route('/getAllTopZones').get(getAllTopZones);
router.route('/getAllWarehouse').get(getAllWarehouse);
router.route('/getAllFactories').get(getAllFactories);
router.route('/getAllRoutes').get(getAllRoutes);
router.route('/getPriorityRanking').get(getPriorityRanking);
router.route('/getStatusComparison').get(getStatusComparison);

router.route('/getAllPosExample').get(getAllPosExample);
router.route('/getAllTopZonesExample').get(getAllTopZonesExample);
router.route('/getPriorityRankingExample').get(getPriorityRankingExample);
router.route('/getStatusComparisonExample').get(getStatusComparisonExample);

export default router;
