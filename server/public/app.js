const socket = io();
const chatForm = document.querySelector("#chatForm");
const messageInput = document.getElementById("messageInput");
const usernameInput = document.getElementById("usernameInput");
const roomInput = document.getElementById("roomInput");
const joinButton = document.getElementById("joinButton");
const messages = document.getElementById("messagesDisplay");
const typingIndicator = document.getElementById("typingIndicator");
const roomForm = document.getElementById("roomForm");
const userList = document.getElementById("userList");
const roomsList = document.getElementById("roomsList");

const sendMessage = (e) => {
  e.preventDefault();
  // Get the values from the input fields
  const message = messageInput.value.trim();
  const room = roomInput.value.trim();
  const username = usernameInput.value.trim();

  if (!message || !room || !username) return;
  socket.emit("chat message", {
    message: message,
    username: username,
  });

  messageInput.value = "";
};

const joinRoom = (e) => {
  e.preventDefault();
  const room = roomInput.value.trim();
  const username = usernameInput.value.trim();

  if (!room || !username) return;
  console.log({ username, room });
  // Emit join room event
  socket.emit("join room", { username, room });

  // Clear the input fields
  roomInput.value = "";
  usernameInput.value = "";
  messageInput.focus();
  // Optionally, you can hide the join button after joining
  // joinButton.style.display = "none";
};

chatForm.addEventListener("submit", sendMessage);
roomForm.addEventListener("submit", joinRoom);
messageInput.addEventListener("keypress", (e) => {
  socket.emit("activity", `${socket.id.substring(0, 6)} is typing...`);
});

// Listen for chat messages from the server/Backend
socket.on("chat message", ({ message, username, timeStamp }) => {
  console.log("Received message:", message, "from", username);

  const chatMessage = document.createElement("li");
  chatMessage.className = "post";
  if (username === usernameInput.value.trim())
    chatMessage.className = "post post--left";
  if (username !== usernameInput.value.trim() && username !== "Admin")
    chatMessage.className = "post post--right";
  if (username !== "Admin")
    chatMessage.innerHTML = `<div class="post__header ${
      username === usernameInput.value.trim()
        ? "post__header--user"
        : "post__header--reply"
    }">
      <span class="post__header--username">${username}</span>
      <span class="post__header--timestamp">${timeStamp}</span>
    </div>
      <div class="post__message">
      ${message}</div>`;
  else
    chatMessage.innerHTML = `<div class="post__message">
    ${message}
    </div>`;
  messages.appendChild(chatMessage);
  window.scrollTo(0, document.body.scrollHeight);
  typingIndicator.style.display = "none";
});

socket.on("connect", () => {
  console.log("Connected to server with ID:", socket.id);
  // // Emit a welcome message to the connected client
  // socket.emit("chat message", "Welcome to the chat!");
});

let typingTimeout;
// Handle the activity event to show typing indicator
socket.on("activity", (data) => {
  // Clear previous timeout only if one exists
  if (typingTimeout) clearTimeout(typingTimeout);
  typingIndicator.style.display = "block";
  typingIndicator.textContent = data;
  // Start new timeout to hide typing indicator
  typingTimeout = setTimeout(() => {
    typingIndicator.style.display = "none";
  }, 1000);
});

// Listen for user list updates from the server/Backend
socket.on("userList", ({ users }) => {
  showUsers(users);
});
// Listen for active rooms updates from the server/Backend
socket.on("activeRooms", ({ rooms }) => {
  showRooms(rooms);
});

const showUsers = (users) => {
  userList.textContent = "";
  if (users) {
    userList.innerHTML = `<em>Users in this ${roomInput.value.trim()}: </em>`;
    users.forEach((user) => {
      if (user === users[users.length - 1]) {
        userList.textContent += `${user.username}.`;
      }
      userList.textContent += `${user.username}, `;
    });
  }
};
const showRooms = (rooms) => {
  roomsList.textContent = "";
  if (rooms) {
    roomsList.innerHTML = `<em>Active Rooms:</em>`;
    rooms.forEach((room) => {
      if (room === rooms[rooms.length - 1]) {
        roomsList.textContent += `${room}.`;
      }
      roomsList.textContent += `${room}, `;
    });
  }
};
