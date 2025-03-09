const WebSocket = require('ws');  // Correctly import the ws package

const socket = new WebSocket("ws://localhost:8000/ws/online-status/");

socket.on('open', function() {
    console.log("Connection established!");
    socket.send(JSON.stringify({
        "type": "online_status",
        "user_id": 123,
        "status": "online"
    }));
});

socket.on('message', function(event) {
    console.log("Received message:", event);
});

socket.on('close', function() {
    console.log("Connection closed!");
});



