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


socket.on("activity", (data) => {
  typingIndicator.style.display = "block";
  typingIndicator.textContent = data;
  setTimeout(() => {
    typingIndicator.style.display = "none";
  }, 2000);
});
