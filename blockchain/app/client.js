// client.js

const ws = new WebSocket('ws://<server-ip>:8080');

ws.onopen = function() {
  console.log('Connected to WebSocket server');
  
  // Send a message to the server
  ws.send('Hello from client!');
};

ws.onmessage = function(event) {
  console.log('Received message from server:', event.data);
};
