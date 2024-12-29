import Dish from '../models/Dish.js';
import Ingredient from '../models/Ingredient.js';
import Blockchain from '../blockchain/blockchain.js'; // Import Blockchain instance

// Initialize blockchain instance
const foodQualityBlockchain = new Blockchain();

// Add dish with calculated quality score based on ingredients
export const addDish = async (req, res) => {
  try {
    const { name, price, ingredientBlockchainIds } = req.body;

    // Fetch ingredients using the blockchain IDs
    const ingredients = await Ingredient.find({ blockchainId: { $in: ingredientBlockchainIds } });

    if (ingredients.length !== ingredientBlockchainIds.length) {
      return res.status(404).json({ message: 'Some ingredients not found.' });
    }

    // Calculate the total quality score based on blockchain data
    let totalQualityScore = 0;
    for (let ingredient of ingredients) {
      const blockchainData = foodQualityBlockchain.getTransactionByBlockchainId(ingredient.blockchainId);
      totalQualityScore += blockchainData?.qualityScore || 0;
    }

    // Calculate the average quality score
    const averageQualityScore = totalQualityScore / ingredients.length;

    // Create a new dish with the calculated quality score
    const newDish = new Dish({
      name,
      price,
      qualityScore: averageQualityScore,
      ingredients: ingredientBlockchainIds,
    });

    // Save the dish to the database
    await newDish.save();

    res.status(201).json({ message: 'Dish added successfully', dish: newDish });
  } catch (err) {
    console.error('Error adding dish:', err);
    res.status(500).json({ message: 'Error adding dish.' });
  }
};

// Get all dishes with their ingredients and quality scores
export const getDishes = async (req, res) => {
  try {
    const dishes = await Dish.find();
    const dishesWithIngredients = [];

    for (let dish of dishes) {
      // Fetch ingredients for the dish
      const ingredients = await Ingredient.find({ blockchainId: { $in: dish.ingredients } });

      // Include blockchain data to get the quality score
      const ingredientsWithScores = await Promise.all(ingredients.map(async (ingredient) => {
        const blockchainData = foodQualityBlockchain.getTransactionByBlockchainId(ingredient.blockchainId);
        return {
          ...ingredient.toObject(),
          qualityScore: blockchainData?.qualityScore || 'N/A',
        };
      }));

      // Add the ingredients with quality scores to the dish
      dishesWithIngredients.push({
        ...dish.toObject(),
        ingredients: ingredientsWithScores,
      });
    }

    res.status(200).json(dishesWithIngredients);
  } catch (err) {
    console.error('Error fetching dishes:', err);
    res.status(500).json({ message: 'Error fetching dishes.' });
  }
};
