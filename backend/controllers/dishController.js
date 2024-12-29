import Dish from '../models/Dish.js';
import Ingredient from '../models/Ingredient.js';

export const addDish = async (req, res) => {
  try {
    const { name, price, qualityScore, ingredientBlockchainIds } = req.body;
    const ingredients = await Ingredient.find({ blockchainId: { $in: ingredientBlockchainIds } });

    if (ingredients.length !== ingredientBlockchainIds.length) {
      return res.status(404).json({ message: 'Some ingredients not found.' });
    }
    const newDish = new Dish({
      name,
      price,
      qualityScore,
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
      
      dishesWithIngredients.push({
        ...dish.toObject(),
        ingredients: ingredients
      });
    }

    res.status(200).json(dishesWithIngredients);
  } catch (err) {
    console.error('Error fetching dishes:', err);
    res.status(500).json({ message: 'Error fetching dishes.' });
  }
};
