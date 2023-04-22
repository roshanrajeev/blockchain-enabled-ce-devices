const express = require('express')
const Blockchain = require('../chain')
const bodyParser = require('body-parser')
const P2pServer = require('./p2p-server')
const Kwm = require('../Kwm')
//get the port from the user or set the default port
const HTTP_PORT = process.env.HTTP_PORT || 3001
const crypto = require('crypto')

function generatetxString(data) {
    const seed = crypto.randomBytes(16).toString('hex') // Generate random seed
    const hash = crypto.createHash('sha256') // Create SHA-256 hash object
    hash.update(`${JSON.stringify(data)}${seed}`) // Update hash with JSON data and seed
    const digest = hash.digest('hex') // Get digest (hash value) as hexadecimal string
    return `${digest}${seed}` // Return digest concatenated with seed
}
const txManager = new Kwm()
//create a new app
const app = express()
//using the body parser middleware
app.use(bodyParser.json())

// create a new blockchain instance
const blockchain = new Blockchain()
const p2pserver = new P2pServer(blockchain)
p2pserver.listen()

function treeChain(txString) {
    const chunkSize = 64
    const chunks = []
    let chunkStart = 0
    let chunkEnd = chunkSize

    // Divide the transaction string into chunks
    while (chunkEnd <= txString.length) {
        chunks.push(txString.substring(chunkStart, chunkEnd))
        chunkStart += chunkSize
        chunkEnd += chunkSize
    }
    const kwmValues = chunks.map((chunk) => txManager.calculate_kwm(chunk))

    // Calculate the average KWM for the transaction
    const averageKwm = kwmValues.reduce((total, kwm) => total + kwm, 0) / kwmValues.length

    // Define the consensus threshold
    const consensusThreshold = 1000

    // Compare the average KWM to the consensus threshold
    if (averageKwm >= consensusThreshold) {
        return 'Transaction is valid'
    } else {
        return 'Transaction is invalid'
    }
}
//EXPOSED APIs

//api to get the blocks
app.get('/blocks', (req, res) => {
    res.json(blockchain.chain)
})

//api to add blocks
app.post('/mine', (req, res) => {
    const block = blockchain.addBlock(req.body.data)
    const txString = generatetxString(block)
    treeChain(txString)
    console.log(`New block added: ${block.toString()}`)
    p2pserver.syncChain()
    res.send('block added')
})

// app server configurations
app.listen(HTTP_PORT, () => {
    console.log(`listening on port ${HTTP_PORT}`)
})

module.exports = {
    mineBlock: (data) => {
        const block = blockchain.addBlock(data)
        console.log(`New block added: ${block.toString()}`)
        p2pserver.syncChain()
        res.redirect('/blocks')
    }
}
