import { Router } from 'express';
import { verifyRoles } from '../middlewares/verifyRoles';
import {
  getAllBalances,
  getBalanceByKey,
  createBalance,
  updateBalance,
  deleteBalance,
} from '../controllers/balances';

const router: Router = Router();

router.get('/', verifyRoles(['admin', 'editor', 'viewer']), getAllBalances);
router.get('/:month/:broker', verifyRoles(['admin', 'editor', 'viewer']), getBalanceByKey);
router.post('/', verifyRoles(['editor', 'admin']), createBalance);
router.put('/:month/:broker', verifyRoles(['editor', 'admin']), updateBalance);
router.delete('/:month/:broker', verifyRoles(['admin']), deleteBalance);

export default router;
