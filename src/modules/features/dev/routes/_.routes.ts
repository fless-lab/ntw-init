import { Router } from 'express';
import { DevHelperController } from '../controllers';

const router = Router();

/**
 * Route to get all the app routes.
 */
router.get('', DevHelperController.getAppRoutes);

export default router;
