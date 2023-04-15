const Block = require('./block')
const { connectToMongoDB } = require('./config/db.js')
class Blockchain {
    constructor() {
        this.chain = [Block.genesis()]
    }
    async addBlock(data) {
        const block = Block.mineBlock(this.chain[this.chain.length - 1], data)
        this.chain.push(block)
        const db = await connectToMongoDB()
        const collection = db.collection('sensor-data')
        await collection.insertOne(block)

        return block
    }
    // check chain to find tampering
    isValidChain(chain) {
        if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
            return false
        }
        for (let i = 1; i < chain.length; i++) {
            const block = chain[i]
            const lastBlock = chain[i - 1]
            if (block.lastHash !== lastBlock.hash || block.hash !== Block.blockHash(block)) {
                return false
            }
        }
        return true
    }
    //replace when receive a new chain which is valid and longer than ours
    replaceChain(newChain) {
        if (newChain.length <= this.chain.length) {
            console.log('Received chain not longer than current chain')
            return
        } else if (!this.isValidChain(newChain)) {
            console.log('Invalid chain')
            return
        }
        console.log('Replaced current chain with new chain')
        this.chain = newChain
    }
}
module.exports = Blockchain
