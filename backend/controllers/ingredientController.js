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

    await foodQualityBlockchain.createNewTransaction(transaction);

    const lastBlock = await foodQualityBlockchain.addBlock();

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

    const ingredientsWithQualityScore = await Promise.all(
      ingredients.map(async (ingredient) => {
        const blockchainData = await foodQualityBlockchain.getTransactionByBlockchainId(ingredient.blockchainId);
        console.log("Blochcaindata",blockchainData);
        return {
          ...ingredient.toObject(),
          qualityScore: blockchainData?.qualityScore || 'N/A',
        };
      })
    );

    res.status(200).json(ingredientsWithQualityScore);
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    res.status(500).json({ message: 'Error fetching ingredients.' });
  }
}

async function getIngredientDetails(req, res) {
  try {
    const { ingredientId } = req.params;

    const ingredient = await Ingredient.findOne({ blockchainId: ingredientId });

    if (!ingredient) {
      return res.status(404).json({ message: 'Ingredient not found.' });
    }

    const blockchainData = await foodQualityBlockchain.getTransactionByBlockchainId(ingredient.blockchainId);

    if (!blockchainData) {
      console.warn(`Blockchain data not found for ingredient: ${ingredient.name}`);
    }

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

async function updateIngredient(req, res) {
  try {
    const { ingredientId } = req.params;
    const { name, description, origin, expiryDate, quantity } = req.body;

    const ingredient = await Ingredient.findOne({ blockchainId: ingredientId });

    if (!ingredient) {
      return res.status(404).json({ message: 'Ingredient not found.' });
    }

    let hasChanges = false;

    if (name && name !== ingredient.name) {
      ingredient.name = name;
      hasChanges = true;
    }

    if (description && description !== ingredient.description) {
      ingredient.description = description;
      hasChanges = true;
    }

    if (origin && origin !== ingredient.origin) {
      ingredient.origin = origin;
      hasChanges = true;
    }

    if (expiryDate && expiryDate !== ingredient.expiryDate) {
      ingredient.expiryDate = expiryDate;
      hasChanges = true;
    }

    if (quantity && quantity !== ingredient.quantity) {
      ingredient.quantity = quantity;
      hasChanges = true;
    }

    if (hasChanges) {
      await ingredient.save();

      const freshnessScore = calculateFreshnessScore(expiryDate);
      const blockchainData = {
        name: ingredient.name,
        description: ingredient.description,
        origin: ingredient.origin,
        expiryDate: ingredient.expiryDate,
        quantity: ingredient.quantity,
        blockchainId: ingredient.blockchainId,
        qualityScore: freshnessScore,
        timestamp: Date.now(),
      };

      await foodQualityBlockchain.createNewTransaction(blockchainData);
      await foodQualityBlockchain.addBlock();

      res.status(200).json({
        message: 'Ingredient updated successfully',
        ingredient,
        blockchainTransaction: blockchainData,
      });
    } else {
      res.status(200).json({
        message: 'No changes detected for the ingredient.',
      });
    }

  } catch (error) {
    console.error('Error updating ingredient:', error);
    res.status(500).json({ message: 'Error updating ingredient.' });
  }
}


async function deleteIngredient(req, res) {
  try {
    const { ingredientId } = req.params;

    const ingredient = await Ingredient.findOneAndDelete({ blockchainId: ingredientId });

    if (!ingredient) {
      return res.status(404).json({ message: 'Ingredient not found.' });
    }

    const blockchainData = {
      blockchainId: ingredient.blockchainId,
      action: 'delete',
      timestamp: Date.now(),
    };

    await foodQualityBlockchain.createNewTransaction(blockchainData);
    const lastBlock = await foodQualityBlockchain.addBlock();

    res.status(200).json({
      message: 'Ingredient deleted successfully from database and blockchain.',
      ingredient,
    });
  } catch (error) {
    console.error('Error deleting ingredient:', error);
    res.status(500).json({ message: 'Error deleting ingredient.' });
  }
}


export { addIngredient, getIngredients, getIngredientDetails,updateIngredient,deleteIngredient};