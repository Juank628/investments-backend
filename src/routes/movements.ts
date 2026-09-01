import { Router } from 'express';
import { verifyRoles } from '../middlewares/verifyRoles';
import {
  getAllMovements,
  getMovementById,
  createMovement,
  updateMovement,
  deleteMovement,
} from '../controllers/movements';

const router: Router = Router();

router.get('/', verifyRoles(['admin', 'editor', 'viewer']), getAllMovements);
router.get('/:id', verifyRoles(['admin', 'editor', 'viewer']), getMovementById);
router.post('/', verifyRoles(['editor', 'admin']), createMovement);
router.put('/:id', verifyRoles(['admin']), updateMovement);
router.delete('/:id', verifyRoles(['admin']), deleteMovement);

export default router;
