import Blockchain from '../blockchain/blockchain.js';
import Ingredient from '../models/Ingredient.js';
import crypto from 'crypto';

const foodQualityBlockchain = new Blockchain();

function calculateFreshnessScore(expiryDate) {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffInTime = expiry.getTime() - today.getTime();
  const diffInDays = diffInTime / (1000 * 3600 * 24);

  if (diffInDays >= 7) {
    return 10;
  } else if (diffInDays >= 3) {
    return 8;
  } else if (diffInDays >= 1) {
    return 5;
  } else {
    return 1;
  }
}

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

    const freshnessScore = calculateFreshnessScore(expiryDate);

    const transaction = {
      name: newIngredient.name,
      description: newIngredient.description,
      origin: newIngredient.origin,
      expiryDate: newIngredient.expiryDate,
      quantity: newIngredient.quantity,
      blockchainId: newIngredient.blockchainId,
      qualityScore: freshnessScore,
      timestamp: Date.now(),
    };

    foodQualityBlockchain.createNewTransaction(transaction);
    const lastBlock = foodQualityBlockchain.getLastBlock();
    foodQualityBlockchain.addBlock();

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

async function getIngredientDetails(req, res) {
  // console.log("Inside ingrdientcontrollers:Here is the req",req);
  try {
    const { ingredientId } = req.params;
    const ingredient = await Ingredient.findOne({ blockchainId: ingredientId });
    console.log("This is ingredient in ingrdientcontrollers",ingredient);

    if (!ingredient) {
      return res.status(404).json({ message: 'Ingredient not found.' });
    }

    const blockchainData = foodQualityBlockchain.getTransactionByBlockchainId(ingredient.blockchainId);
    console.log("This is blocchinaData:ingrdientcontrollers",blockchainData);

    res.status(200).json({
      name: ingredient.name,
      description: ingredient.description,
      origin: ingredient.origin,
      expiryDate: ingredient.expiryDate,
      quantity: ingredient.quantity,
      qualityScore: blockchainData?.qualityScore || 'N/A',
      blockchainTimestamp: blockchainData?.timestamp || 'N/A',
    });
  } catch (error) {
    console.error('Error fetching ingredient details:', error);
    res.status(500).json({ message: 'Error fetching ingredient details.' });
  }
}

export { addIngredient, getIngredients, getIngredientDetails };
