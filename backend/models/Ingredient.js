import { Schema, model } from 'mongoose';

const IngredientSchema = new Schema({
  name: { type: String, required: true },
  blockchainId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default model('Ingredient', IngredientSchema);