import crypto from 'crypto';
import BlockchainModel from '../models/blockchain.js';

class Blockchain {
  constructor() {
    this.chain = [];
    this.pendingTransactions = [];
    this.loadBlockchain();
  }

  async createGenesisBlock() {
    const block = {
      index: 0,
      timestamp: Date.now(),
      data: 'Genesis Block',
      previousHash: '0',
      hash: this.calculateHash(0, 'Genesis Block', '0'),
    };
    this.chain.push(block);
    await this.saveBlockchain();
  }

  calculateHash(index, data, previousHash) {
    return crypto
      .createHash('sha256')
      .update(index + data + previousHash)
      .digest('hex');
  }

  async createNewTransaction(transaction) {
    this.pendingTransactions.push(transaction);
    return this.pendingTransactions.length - 1;
  }

  async addBlock() {
    const previousBlock = this.chain[this.chain.length - 1];
    const newBlock = {
      index: this.chain.length,
      timestamp: Date.now(),
      data: this.pendingTransactions,
      previousHash: previousBlock.hash,
      hash: this.calculateHash(
        this.chain.length,
        JSON.stringify(this.pendingTransactions),
        previousBlock.hash
      ),
    };
    
    this.chain.push(newBlock);
    this.pendingTransactions = [];
    await this.saveBlockchain();
    return newBlock;
  }
  

  async getLastBlock() {
    return this.chain[this.chain.length - 1];
  }

  getBlockchain() {
    return this.chain;
  }

  async getTransactionByBlockchainId(blockchainId) {
    for (let block of this.chain) {
      for (let transaction of block.data) {
        if (transaction.blockchainId === blockchainId) {
          return transaction;
        }
      }
    }
    return null;
  }

  async saveBlockchain() {
    for (let block of this.chain) {
      const existingBlock = await BlockchainModel.findOne({ index: block.index });
      if (existingBlock) {
        await BlockchainModel.updateOne({ index: block.index }, block);
      } else {
        const newBlock = new BlockchainModel(block);
        await newBlock.save();
      }
    }
  }
  

  async loadBlockchain() {
    const blocks = await BlockchainModel.find();
    if (blocks.length === 0) {
      await this.createGenesisBlock();
    } else {
      this.chain = blocks;
    }
  }
}

export default Blockchain;
