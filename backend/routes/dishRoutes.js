import { Router } from 'express';
import { getDishes,addDish } from '../controllers/dishController.js';

const router = Router();

router.get('/', getDishes);
router.post('/add', addDish);

export default router;
