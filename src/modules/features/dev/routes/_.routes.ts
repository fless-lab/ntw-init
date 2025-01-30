import { Router } from 'express';
import { DevHelperController } from '../controllers';
import { BullServerAdapter } from 'modules/shared/queue/bull-board';

const router = Router();

/**
 * Route to get all the app routes.
 */
router.get('', DevHelperController.getAppRoutes);
router.use('/admin/queues', BullServerAdapter.getRouter());

export default router;
