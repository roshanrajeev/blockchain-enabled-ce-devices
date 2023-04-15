let mongoose = require('mongoose')
let Schema = mongoose.Schema

const BlockSchema = new Schema({
    timestamp: { type: Date, required: true },
    lastHash: { type: String, required: true },
    hash: { type: String, required: true },
    data: { type: String, required: true }
})

module.exports = mongoose.model('Blockchain', BlockSchema)
