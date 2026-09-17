import { Router } from 'express';
import { verifyRoles } from '../middlewares/verifyRoles';
import { createUser, getUsersList } from '../controllers/users';

const router = Router();

router.post('/create-user', verifyRoles(['admin']), createUser);
router.get('/list', verifyRoles(['admin', 'editor', 'viewer']), getUsersList);

export default router;
