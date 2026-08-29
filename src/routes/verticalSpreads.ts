import { Router } from 'express';
import { verifyRoles } from '../middlewares/verifyRoles';
import {
  getAllVerticalSpreads,
  getVerticalSpreadById,
  createVerticalSpread,
  updateVerticalSpread,
  deleteVerticalSpread,
} from '../controllers/verticalSpreads';

const router: Router = Router();

router.get('/', verifyRoles(['admin', 'editor', 'viewer']), getAllVerticalSpreads);
router.get('/:id', verifyRoles(['admin', 'editor', 'viewer']), getVerticalSpreadById);
router.post('/', verifyRoles(['admin', 'editor']), createVerticalSpread);
router.put('/:id', verifyRoles(['admin', 'editor']), updateVerticalSpread);
router.delete('/:id', verifyRoles(['admin', 'editor']), deleteVerticalSpread);

export default router;
