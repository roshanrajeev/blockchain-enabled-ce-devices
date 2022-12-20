var mongoose = require('mongoose')

mongoose.Promise = global.Promise
var murl = 'mongodb://mongo:27017/fog_db'

mongoose.connect(murl,{useNewUrlParser: true})

module.exports={
    mongoose:mongoose,
}