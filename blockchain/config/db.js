// File: mongodb.js
const { MongoClient } = require('mongodb')

async function connectToMongoDB() {
    const client = new MongoClient('mongodb://localhost:27017')
    await client.connect()
    const db = client.db('bc-database')
    if (db) {
        console.log('connected to db')
    }
    return db
}

module.exports = {
    connectToMongoDB
}
