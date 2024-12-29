import Blockchain from '../blockchain/blockchain.js';
import Ingredient from '../models/Ingredient.js';
import crypto from 'crypto';

const foodQualityBlockchain = new Blockchain();

async function addIngredient(req, res) {
  try {
    const { name, description, origin, expiryDate, quantity } = req.body;

    // Create a new ingredient
    const newIngredient = new Ingredient({
      name,
      description,
      origin,
      expiryDate,
      quantity,
      blockchainId: crypto.randomBytes(16).toString('hex'),
    });

    // Save the ingredient to the database
    await newIngredient.save();

    // Create a new transaction for the ingredient
    const transaction = {
      name: newIngredient.name,
      description: newIngredient.description,
      origin: newIngredient.origin,
      expiryDate: newIngredient.expiryDate,
      quantity: newIngredient.quantity,
      blockchainId: newIngredient.blockchainId,
    };

    // Add the transaction to the blockchain
    const transactionIndex = foodQualityBlockchain.createNewTransaction(transaction);

    // Get the last block from the blockchain
    const lastBlock = foodQualityBlockchain.getLastBlock();

    // Create a new block and add it to the blockchain
    foodQualityBlockchain.addBlock();

    // Send response with the ingredient and blockchain transaction details
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
    // Fetch all ingredients from the database
    const ingredients = await Ingredient.find();
    res.status(200).json(ingredients);
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    res.status(500).json({ message: 'Error fetching ingredients.' });
  }
}

export { addIngredient, getIngredients };
