const { createServer, get } = require("http");
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
  console.log(`User ${socket.id} connected`);
  // Emit a welcome message to the connected client
  socket.emit(
    "chat message",
    buildMessage({ message: "Welcome to the chat!", username: ADMIN })
  );

  // Listen for join room events from the client/Frontend
  socket.on("join room", ({ room, username }) => {
    if (!room || !username) return;

    // To ensure that the user isn't already in a room,we first check if the user has a previous room
    const prevRoom = getUser(socket.id)?.room;
    // If the user was in a previous room, remove them from that room
    if (prevRoom) {
      socket.leave(prevRoom);
      // Optionally, you can notify the room that the user has left
      io.to(prevRoom).emit(
        "chat message",
        buildMessage({
          message: `${username} has left the room.`,
          username: ADMIN,
        })
      );
      // Update the user list in the previous room
      io.to(prevRoom).emit("userList", { users: getUsersInRoom(prevRoom) });
      console.log(`${username} has left room: ${prevRoom}`);
    }

    // Activate the user in the specified room
    const user = activateUser(username, socket.id, room);
    console.log(`${user.name} has joined room: ${user.room}`);

    // Join the specified room
    socket.join(user.room);

    // Notify the user that they have joined the room
    socket.emit(
      "chat message",
      buildMessage({
        message: `You have joined the room: ${user.room}`,
        username: ADMIN,
      })
    );

    // Notify all clients in the room about the new user
    socket.broadcast.to(user.room).emit(
      "chat message",
      buildMessage({
        message: `${user.name} has joined the room!`,
        username: ADMIN,
      })
    );

    // Optionally, you can send the list of users in the room to the client
    const usersInRoom = getUsersInRoom(user.room);
    io.to(user.room).emit("userList", { users: usersInRoom });

    // Emit the updated list of active rooms to all clients
    io.emit("activeRooms", { rooms: getAllActiveRooms() });


  });

  // Listen for chat messages from the client/Frontend
  socket.on("chat message", ({ message, username }) => {
    const user = getUser(socket.id);

    if(!user) {
      // If the user is not found, we can ignore the message
      console.warn(`User with ID ${socket.id} not found. Ignoring message.`);
      return;
    }

    
    if (!message || !username) { 
      console.warn("Message or username is empty. Ignoring message.");
      return;
    }

    // Build and emit the chat message to all clients in the user's room
    io.to(user.room).emit(
      "chat message",
      buildMessage({ message: message, username: username })
    );
  });

  // // Notify all clients when a new user joins
  // socket.broadcast.to(user.room).emit(
  //   "chat message",
  //   buildMessage({
  //     message: `${socket.id.substring(0, 6)} has joined the chat!`,
  //     username: ADMIN,
  //   })
  // );

  socket.on("disconnect", () => {
    const user = getUser(socket.id);
    if (user) {
      // Remove the user from the UsersState
      userLeavesApp(socket.id);
      // Notify all clients in the room that the user has left
      io.to(user.room).emit(
        "chat message",
        buildMessage({
          message: `${user.name} has left the chat.`,
          username: ADMIN,
        })
      );

      // Update the user list in the room
      io.to(user.room).emit("userList", { users: getUsersInRoom(user.room) });
    }

    // Emit the updated list of active rooms to all clients in case a room is empty. i.e user was the last user in the room
    io.emit("activeRooms", { rooms: getAllActiveRooms() });

    console.log(`${socket.id} has disconnected`);
  });

  // Listen for activity detection events
  socket.on("activity", (name) => {
    // Check if the user is in a room before broadcasting activity
    const room = getUser(socket.id)?.room;
    if (!room) {
      console.warn(`User with ID ${socket.id} is not in a room. Ignoring activity.`);
      return;
    }
    socket.broadcast.to(room).emit("activity", name);
  });

  // Handle socket errors
  socket.on("error", (err) => {
    console.error(`Socket error: ${err}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
