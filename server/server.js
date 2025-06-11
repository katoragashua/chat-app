const { createServer } = require("http");
const express = require("express");
const { Server } = require("socket.io");
const path = require("path");
const PORT = process.env.PORT || 3000;
const app = express();
const httpServer = createServer();
httpServer.on("request", app);
const {
  UsersState,
  buildMessage,
  activateUser,
  getUser,
  getUsersInRoom,
  userLeavesApp,
  buildActivityMessage,
  getAllActiveRooms,
} = require("./utils");
const ADMIN = "Admin";

app.use(express.static(path.join(__dirname, "public")));
// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "public", "index.html"));
// });

const io = new Server(httpServer);

io.on("connection", (socket) => {
  console.log(socket.id);
  // Emit a welcome message to the connected client
  socket.emit(
    "chat message",
    buildMessage({ message: "Welcome to the chat!", username: ADMIN })
  );

  // Listen for join room events
  socket.on("join room", ({ room, username }) => {
    if (!room || !username) return;

    // Activate the user in the specified room
    const user = activateUser(username, socket.id, room);
    console.log(`${user.name} has joined room: ${user.room}`);

    // Join the specified room
    socket.join(user.room);

    // Notify all clients in the room about the new user
    io.to(user.room).emit(
      "chat message",
      buildMessage({
        message: `${user.name} has joined the chat!`,
        username: ADMIN,
      })
    );

    // Optionally, you can send the list of users in the room to the client
    const usersInRoom = getUsersInRoom(user.room);
    io.to(user.room).emit("users in room", usersInRoom);
  });

  // Listen for chat messages from the client/Frontend
  socket.on("chat message", ({message, username}) => {
    console.log(message, username);
    // Broadcast the message to all connected clients
    io.emit("chat message", buildMessage({ message: message, username: username }));
  });

  // Notify all clients when a new user joins
  socket.broadcast.emit(
    "chat message",
    buildMessage({
      message: `${socket.id.substring(0, 6)} has joined the chat!`,
      username: ADMIN,
    })
  );

  socket.on("disconnect", () => {
    console.log(`${socket.id} has disconnected`);
    // Notify all clients when a user leaves
    io.emit("chat message", buildMessage({
      message: `${socket.id.substring(0, 6)} has left the chat.`,
      username: ADMIN,
    }));
  });

  // Listen for activity detection events
  socket.on("activity", (data) => {
    // console.log(`${socket.id} is active`);
    socket.broadcast.emit("activity", data);
  });

  // Handle socket errors
  socket.on("error", (err) => {
    console.error(`Socket error: ${err}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
