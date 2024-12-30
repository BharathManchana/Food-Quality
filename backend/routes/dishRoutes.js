import { Router } from 'express';
import { getDishes,addDish,updateDish,deleteDish } from '../controllers/dishController.js';

const router = Router();

router.get('/', getDishes);
router.post('/add', addDish);
router.put('/update/:dishId', updateDish); 
router.delete('/delete/:dishId', deleteDish);


export default router;
