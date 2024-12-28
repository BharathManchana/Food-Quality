import Blockchain from '../blockchain/blockchain.js';
import Ingredient from '../models/Ingredient.js';
import crypto from 'crypto';

const foodQualityBlockchain = new Blockchain();

async function addIngredient(req, res) {
  try {
    const { name, description, origin, expiryDate, quantity } = req.body;

    const newIngredient = new Ingredient({
      name,
      description,
      origin,
      expiryDate,
      quantity,
      blockchainId: crypto.randomBytes(16).toString('hex'),
    });

    await newIngredient.save();

    const transaction = {
      name: newIngredient.name,
      description: newIngredient.description,
      origin: newIngredient.origin,
      expiryDate: newIngredient.expiryDate,
      quantity: newIngredient.quantity,
      blockchainId: newIngredient.blockchainId,
    };

    const blockIndex = foodQualityBlockchain.createNewTransaction(transaction);
    const lastBlock = foodQualityBlockchain.getLastBlock();
    foodQualityBlockchain.createNewBlock(200, lastBlock['hash'], 'hash-example');

    res.status(201).json({
      message: 'Ingredient added successfully and recorded on the blockchain!',
      ingredient: newIngredient,
      blockchainTransaction: transaction,
    });
  } catch (error) {
    console.error('Error adding ingredient:', error);
    res.status(500).json({ message: 'Error adding ingredient.' });
  }
}

async function getIngredients(req, res) {
  try {
    const ingredients = await Ingredient.find(); 
    res.status(200).json(ingredients);
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    res.status(500).json({ message: 'Error fetching ingredients.' });
  }
}

export { addIngredient, getIngredients };
