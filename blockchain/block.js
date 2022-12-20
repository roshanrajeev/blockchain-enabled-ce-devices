const SHA256 = require('crypto-js/sha256')
class Block {
    constructor(timestamp, lastHash, hash, data) {
        this.timestamp = timestamp
        this.lastHash = lastHash
        this.hash = hash
        this.data = data
    }
    toString() {
        return `Block - 
        
        Data : ${this.data}`
    }

    static genesis() {
        return new this('Genesis time', '----', 'genetic-hash', [])
    }
    static hash(timestamp, lastHash, data) {
        console.log('sha')
        return SHA256(`${timestamp}${lastHash}${data}`).toString()
    }
    static mineBlock(lastBlock, data) {
        let hash
        let timestamp
        const lastHash = lastBlock.hash

        return new this(timestamp, lastHash, hash, data)
    }
    static blockHash(block) {
        //destructuring
        const { timestamp, lastHash, data } = block
        return Block.hash(timestamp, lastHash, data)
    }
}
module.exports = Block
