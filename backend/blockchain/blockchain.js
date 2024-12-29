import crypto from 'crypto';

class Blockchain {
  constructor() {
    this.chain = [];
    this.pendingTransactions = [];  
    this.createGenesisBlock();
  }

  createGenesisBlock() {
    const block = {
      index: 0,
      timestamp: Date.now(),
      data: 'Genesis Block',
      previousHash: '0',
      hash: this.calculateHash(0, 'Genesis Block', '0'),
    };
    this.chain.push(block);
  }

  calculateHash(index, data, previousHash) {
    return crypto
      .createHash('sha256')
      .update(index + data + previousHash)
      .digest('hex');
  }

  createNewTransaction(transaction) {
    this.pendingTransactions.push(transaction);
    return this.pendingTransactions.length - 1;
  }

  addBlock() {
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
    return newBlock;
  }

  getLastBlock() {
    return this.chain[this.chain.length - 1];  
  }

  getBlockchain() {
    return this.chain;
  }

  getTransactionByBlockchainId(blockchainId) {
    for (let block of this.chain) {
      for (let transaction of block.data) {
        if (transaction.blockchainId === blockchainId) {
          return transaction;
        }
      }
    }
    return null;
  }
}

export default Blockchain;