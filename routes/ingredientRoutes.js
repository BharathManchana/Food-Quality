import { Router } from 'express';
import { addIngredient,  getIngredients , getIngredientDetails,updateIngredient,deleteIngredient} from '../controllers/ingredientController.js';

const router = Router();

router.post('/add', addIngredient);
router.get('/', getIngredients);
router.get('/getIngredientDetails/:ingredientId', getIngredientDetails);
router.put('/update/:ingredientId', updateIngredient);
router.delete('/delete/:ingredientId', deleteIngredient); 

export default router;



