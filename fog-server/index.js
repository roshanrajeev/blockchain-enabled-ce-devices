const express = require('express');
var bodyParser = require('body-parser');
const cors = require('cors');
const { response } = require('express');
const P2pServer = require('./p2p-server')

//get the port from the user or set the default port
const HTTP_PORT = process.env.HTTP_PORT || 3000

const p2pserver = new P2pServer()
p2pserver.listen()

const fetch = (...args) =>
	import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false })); // Configuring body parser middleware
app.use(bodyParser.json());

app.post('/getsensordata', async (req, res) => {
    const body = req.body;
    const url1 = `http://localhost:3002/mine`;
    const url2 = `http://localhost:3002/update`;
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    };
    // to endpoint /mine
    try {
        const response = await fetch(url1, options);
        const data = await response.json();
        res.send(data);
    } catch (err) {
        console.log(err);
        res.status(400).send();
    }
    // to endpoint /update
    try {
        const response = await fetch(url2, options);
        const data = await response.json();
        res.send(data);
    } catch (err) {
        console.log(err);
        res.status(400).send();
    }
});

app.get('/',function(req,res){
    res.send("Server is up and listening");
});

app.listen(HTTP_PORT, () => {
    console.log(`Server listening on port ${HTTP_PORT}`);
});



