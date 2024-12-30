import Dish from '../models/Dish.js';
import Ingredient from '../models/Ingredient.js';
import Blockchain from '../blockchain/blockchain.js';

const foodQualityBlockchain = new Blockchain();

export const addDish = async (req, res) => {
  try {
    const { name, price, ingredientBlockchainIds } = req.body;

    const ingredients = await Ingredient.find({ blockchainId: { $in: ingredientBlockchainIds } });

    if (ingredients.length !== ingredientBlockchainIds.length) {
      return res.status(404).json({ message: 'Some ingredients not found.' });
    }

    let totalQualityScore = 0;
    
    for (let ingredient of ingredients) {
      const blockchainData = await foodQualityBlockchain.getTransactionByBlockchainId(ingredient.blockchainId);
      const qualityScore = blockchainData?.qualityScore || 0;
      totalQualityScore += qualityScore;
    }

    const averageQualityScore = totalQualityScore / ingredients.length;

    const newDish = new Dish({
      name,
      price,
      qualityScore: averageQualityScore,
      ingredients: ingredientBlockchainIds,
    });

    await newDish.save();

    res.status(201).json({ message: 'Dish added successfully', dish: newDish });
  } catch (err) {
    console.error('Error adding dish:', err);
    res.status(500).json({ message: 'Error adding dish.' });
  }
};


export const getDishes = async (req, res) => {
  try {
    const dishes = await Dish.find();
    const dishesWithIngredients = [];

    for (let dish of dishes) {
      const ingredients = await Ingredient.find({ blockchainId: { $in: dish.ingredients } });

      const ingredientsWithScores = await Promise.all(
        ingredients.map(async (ingredient) => {
          const blockchainData = await foodQualityBlockchain.getTransactionByBlockchainId(ingredient.blockchainId);
          return {
            ...ingredient.toObject(),
            qualityScore: blockchainData?.qualityScore || 'N/A',
          };
        })
      );

      const totalQualityScore = ingredientsWithScores.reduce(
        (sum, ingredient) => sum + (ingredient.qualityScore || 0),
        0
      );

      const averageQualityScore = totalQualityScore / ingredientsWithScores.length;

      dishesWithIngredients.push({
        ...dish.toObject(),
        qualityScore: averageQualityScore,
        ingredients: ingredientsWithScores,
      });
    }

    res.status(200).json(dishesWithIngredients);
  } catch (err) {
    console.error('Error fetching dishes:', err);
    res.status(500).json({ message: 'Error fetching dishes.' });
  }
};
