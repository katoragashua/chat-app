const socket = io();
const chatForm = document.querySelector("#chatForm");
const messageInput = document.getElementById("messageInput");
const usernameInput = document.getElementById("usernameInput");
const roomInput = document.getElementById("roomInput");
const joinButton = document.getElementById("joinButton");
const messages = document.getElementById("messagesDisplay");
const typingIndicator = document.getElementById("typingIndicator");
const message = messageInput.value.trim();
const room = roomInput.value.trim();
const username = usernameInput.value.trim();

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
  if (!room || !username) return;

  // Emit join room event
  socket.emit("join room", { room, username });

  // Clear the input fields
  roomInput.value = "";
  usernameInput.value = "";
  messageInput.focus();
  // Optionally, you can hide the join button after joining
  // joinButton.style.display = "none";
};

chatForm.addEventListener("submit", sendMessage);
joinButton.addEventListener("click", joinRoom);

// Listen for chat messages from the server/Backend
socket.on("chat message", ({ message, username, timeStamp }) => {
  console.log("Received message:", message, "from", username);

  const chatMessage = document.createElement("li");
  chatMessage.textContent = `${username}: ${message}`;
  messages.appendChild(chatMessage);
  window.scrollTo(0, document.body.scrollHeight);
  typingIndicator.style.display = "none";
});

socket.on("connect", () => {
  console.log("Connected to server with ID:", socket.id);
  // // Emit a welcome message to the connected client
  // socket.emit("chat message", "Welcome to the chat!");
});

messageInput.addEventListener("keypress", (e) => {
  socket.emit("activity", `${socket.id.substring(0, 6)} is typing...`);
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
