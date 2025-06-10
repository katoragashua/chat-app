const socket = io();
const form = document.querySelector("form");
const messageInput = document.getElementById("messageInput");
const messages = document.getElementById("messages");
const typingIndicator = document.getElementById("typingIndicator");

const sendMessage = (e) => {
  e.preventDefault();
  const message = messageInput.value.trim();
  if (!message) return;
  socket.emit("chat message", message);
  messageInput.value = "";
  //   typingIndicator.style.display = "none";
};

form.addEventListener("submit", sendMessage);

// Listen for chat messages from the server
socket.on("chat message", (msg) => {
  const chatMessage = document.createElement("li");
  chatMessage.textContent = msg;
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
