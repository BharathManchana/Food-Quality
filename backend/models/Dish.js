import mongoose from 'mongoose';

const DishSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  qualityScore: { type: Number, required: true },
  ingredients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient' }],
});

export default mongoose.model('Dish', DishSchema);
