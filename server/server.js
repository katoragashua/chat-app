const { createServer } = require("http");
const express = require("express");
const { Server } = require("socket.io");
const path = require("path");
const PORT = process.env.PORT || 3000;
const app = express();
const httpServer = createServer();
httpServer.on("request", app);

app.use(express.static(path.join(__dirname, "public")));
// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "public", "index.html"));
// });

const io = new Server(httpServer);

io.on("connection", (socket) => {
  console.log(socket.id);
  // Emit a welcome message to the connected client
  socket.emit("chat message", "Welcome to the chat!");

  // Listen for chat messages from the client
  socket.on("chat message", (msg) => {
    console.log(msg);
    // Broadcast the message to all connected clients
    io.emit("chat message", `${socket.id.substring(0, 6)}: ${msg}`);
  });

  // Notify all clients when a new user joins
  socket.broadcast.emit(
    "chat message",
    `${socket.id.substring(0, 6)} has joined the chat!`
  );

  socket.on("disconnect", () => {
    console.log(`${socket.id} has disconnected`);
    // Notify all clients when a user leaves
    io.emit("chat message", `${socket.id.substring(0, 6)} has left the chat!`);
  });

  // Listen for activity detection events
    socket.on("activity", (data) => {
        // console.log(`${socket.id} is active`);
        socket.broadcast.emit("activity", data)
        
    });

  // Handle socket errors
  socket.on("error", (err) => {
    console.error(`Socket error: ${err}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
