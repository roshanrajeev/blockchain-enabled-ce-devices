const express = require('express')
const bodyParser = require('body-parser')

const P2pServer = require('./p2p-server')
const { default: axios } = require('axios')

//get the port from the user or set the default port
const HTTP_PORT_FOG = process.env.HTTP_PORT_FOG || 8001
const HTTP_PORT_CHAIN = process.env.HTTP_PORT_CHAIN || 3001
//create a new app
const app = express()
//using the body parser middleware
app.use(bodyParser.json())

// create a new blockchain instance
const p2pserver = new P2pServer()

p2pserver.listen()

app.post("/hey", (req, res) => {
    axios({
        method: "post",
        url: `http://localhost:${String(HTTP_PORT_CHAIN).trim()}/mine`,
        data: JSON.stringify(req.body),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(() => console.log("data added to blockchain"))
    const data = req.body.data
    p2pserver.broadcast(data)
    res.sendStatus(200);
})

app.listen(HTTP_PORT_FOG, () => {
    console.log('Server is running on port ' + HTTP_PORT_FOG)
})
