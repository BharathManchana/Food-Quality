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
    return this.pendingTransactions.length - 1;  // Return the index of the newly added transaction
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

    // Clear the pending transactions after adding them to the block
    this.pendingTransactions = [];
    return newBlock;
  }

  getLastBlock() {
    return this.chain[this.chain.length - 1];  // Return the last block in the chain
  }

  getBlockchain() {
    return this.chain;
  }
}

export default Blockchain;
