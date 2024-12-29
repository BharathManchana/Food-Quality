import Dish from '../models/Dish.js';

export const getDishes = async (req, res) => {
  try {
    const dishes = await Dish.find().populate('ingredients', 'name description qualityScore');
    res.status(200).json(dishes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
