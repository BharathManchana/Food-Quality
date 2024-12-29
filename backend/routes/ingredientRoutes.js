import { Router } from 'express';
import { addIngredient,  getIngredients , getIngredientDetails} from '../controllers/ingredientController.js';

const router = Router();

router.post('/add', addIngredient);
router.get('/', getIngredients);
router.get('/getIngredientDetails/:ingredientId', getIngredientDetails);

export default router;



