const WebSocket = require('ws')

//declare the peer to peer server port
const P2P_PORT_FOG = process.env.P2P_PORT_FOG || 6001

//list of address to connect to
const peers = process.env.PEERS ? process.env.PEERS.split(',') : []

class P2pserver {
    constructor() {
        this.sockets = []
    }

    // create a new p2p server and connections

    listen() {
        // create the p2p server with port as argument
        const server = new WebSocket.Server({ port: P2P_PORT_FOG })

        // event listener and a callback function for any new connection
        // on any new connection the current instance will send the current chain
        // to the newly connected peer
        server.on('connection', (socket) => this.connectSocket(socket))

        // to connect to the peers that we have specified
        this.connectToPeers()

        console.log(`Listening for peer to peer connection on port : ${P2P_PORT_FOG}`)
    }

    // after making connection to a socket
    connectSocket(socket) {
        // push the socket too the socket array
        this.sockets.push(socket)
        console.log('Socket connected')

        // register a message event listener to the socket
        this.messageHandler(socket)

        // on new connection send the blockchain chain to the peer

        this.sendData(socket)
    }

    connectToPeers() {
        //connect to each peer
        peers.forEach((peer) => {
            // create a socket for each peer
            const socket = new WebSocket(peer)

            // open event listner is emitted when a connection is established
            // saving the socket in the array
            socket.on('open', () => this.connectSocket(socket))
        })
    }

    messageHandler(socket) {
        //on recieving a message execute a callback function
        socket.on('message', (message) => {
            // const data = JSON.parse(message.toString())
            console.log('data ', String(message))
        })
    }
    /**
     * helper function to send the chain instance
     */

    sendData(socket, data) {
        socket.send(JSON.stringify(data))
    }

    /**
     * utility function to sync the chain
     * whenever a new block is added to
     * the blockchain
     */

    broadcast(data) {
        this.sockets.forEach((socket) => {
            this.sendData(socket, data)
        })
    }
}

module.exports = P2pserver
