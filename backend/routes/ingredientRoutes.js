import { Router } from 'express';
import { addIngredient,  getIngredients } from '../controllers/ingredientController.js';

const router = Router();

router.post('/add', addIngredient);
router.get('/', getIngredients);

export default router;



