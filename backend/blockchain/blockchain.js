import crypto from 'crypto';
class Blockchain {
  constructor() {
    this.chain = [];
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

  addBlock(data) {
    const previousBlock = this.chain[this.chain.length - 1];
    const newBlock = {
      index: this.chain.length,
      timestamp: Date.now(),
      data,
      previousHash: previousBlock.hash,
      hash: this.calculateHash(
        this.chain.length,
        data,
        previousBlock.hash
      ),
    };
    this.chain.push(newBlock);
    return newBlock;
  }

  getBlockchain() {
    return this.chain;
  }
}

export default Blockchain;