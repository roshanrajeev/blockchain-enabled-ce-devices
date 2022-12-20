const Blockchain = require('./chain')
const Block = require('./block')
describe('chain', () => {
    let blockchain

    beforeEach(() => {
        blockchain = new Blockchain()
    })

    it('starts with the genesis block', () => {
        expect(blockchain.chain[0]).toEqual(Block.genesis())
    })

    it('adds a new block', () => {
        const data = 'foo'
        blockchain.addBlock(data)
        expect(blockchain.chain[blockchain.chain.length - 1].data).toEqual(data)
    })
})
