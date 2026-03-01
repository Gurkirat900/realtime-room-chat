import {WebSocketServer, WebSocket} from 'ws';

const wss = new WebSocketServer({port: 8080});

let userCount = 0;
let allSockets: WebSocket[]= [];

wss.on('connection', (socket:WebSocket) => {
  console.log('Client connected');
  userCount++;    // how many users are connected
  console.log(`Current user count: ${userCount}`);
  allSockets.push(socket); // add the new socket to the list of all sockets

  socket.on('message', (message:any) => {
    console.log(`Received message: ${message}`);

    // Broadcast the message to all connected clients
    allSockets.forEach((s) => {
      if (s !== socket) { // Don't send the message back to the sender  
        s.send(`Broadcast: ${message}`); 
      }
    });

    socket.on('disconnect', () => {
      allSockets = allSockets.filter(s => s !== socket); // Remove the socket from the list
      userCount--;
      console.log(`User disconnected. Current user count: ${userCount}`);
    })

  });

})
 