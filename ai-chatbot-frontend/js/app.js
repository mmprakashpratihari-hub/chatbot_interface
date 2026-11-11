// Nova AI chatbot frontend — all interactions are handled in this file.

const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const messages = document.getElementById("messages");
const welcome = document.getElementById("welcome");
const chatArea = document.getElementById("chatArea");
const historyList = document.getElementById("historyList");

let conversation = [];
let chatHistory = JSON.parse(localStorage.getItem("novaChatHistory") || "[]");

// A small local response engine for demonstrating the interface.
// Replace getBotReply() with an API request when you connect a real AI model.
function getBotReply(prompt) {
  const text = prompt.toLowerCase();

  if (text.includes("hello") || text.includes("hi") || text.includes("hey")) {
    return "Hello! 👋 I'm Nova, your AI assistant. What would you like to explore today?";
  }
  if (text.includes("javascript")) {
    return "JavaScript is a programming language used to make websites interactive.\\n\\nA good learning path is:\\n1. Variables, data types and operators\\n2. Conditions and loops\\n3. Functions and arrays\\n4. Objects and DOM manipulation\\n5. Events, fetch() and async/await\\n\\nTry building a calculator or a to-do list to practise.";
  }
  if (text.includes("artificial intelligence") || text.includes(" ai ")) {
    return "Artificial Intelligence (AI) is a field of computer science that aims to build systems that can perform tasks normally associated with human intelligence. Examples include understanding language, recognising images, making predictions and helping people solve problems.\\n\\nThis demo uses fixed sample responses; it is not connected to an AI model yet.";
  }
  if (text.includes("project idea")) {
    return "Here are three student-friendly project ideas:\\n\\n1. Smart Study Planner — organise subjects, tasks and deadlines.\\n2. Campus Helpdesk — let students submit questions and track replies.\\n3. Expense Tracker — record spending and view monthly summaries.\\n\\nStart with one core feature, make it work reliably, then add more.";
  }
  if (text.includes("study plan")) {
    return "A simple 7-day JavaScript starter plan:\\n\\nDay 1: Variables, data types and operators\\nDay 2: if/else and loops\\nDay 3: Functions and scope\\nDay 4: Arrays and objects\\nDay 5: DOM selection and events\\nDay 6: Build a small to-do app\\nDay 7: Review, debug and improve your app\\n\\nPractise for 45–60 minutes each day and write code yourself.";
  }
  return `Thanks for your message! You asked: “${prompt}”\\n\\nI'm currently running in frontend demo mode, so I can show the chat experience but I don't have a live AI model connected. To get real, context-aware answers, connect this interface to a backend API (for example, your own server that securely calls an AI provider).`;
}

function addMessage(role, text) {
  const message = document.createElement("article");
  message.className = `message ${role}`;

  const avatar = document.createElement("div");
  avatar.className = "message-avatar";
  avatar.textContent = role === "user" ? "U" : "✦";

  const content = document.createElement("div");
  content.className = "message-content";

  const name = document.createElement("div");
  name.className = "message-name";
  name.textContent = role === "user" ? "You" : "Nova Assistant";

  const bubble = document.createElement("div");
  bubble.className = "message-bubble";
  // textContent prevents user messages from being interpreted as HTML.
  bubble.textContent = text;

  content.append(name, bubble);
  message.append(avatar, content);
  messages.appendChild(message);
  chatArea.scrollTop = chatArea.scrollHeight;
}

function showTyping() {
  const typing = document.createElement("div");
  typing.className = "typing";
  typing.id = "typingIndicator";
  typing.textContent = "✦ Nova is thinking...";
  messages.appendChild(typing);
  chatArea.scrollTop = chatArea.scrollHeight;
}

function sendMessage(text) {
  const prompt = text.trim();
  if (!prompt) return;

  welcome.hidden = true;
  conversation.push({ role: "user", content: prompt });
  addMessage("user", prompt);
  messageInput.value = "";
  resizeInput();
  showTyping();

  // Simulates a network delay. Replace this with a fetch() call to your backend.
  window.setTimeout(() => {
    document.getElementById("typingIndicator")?.remove();
    const reply = getBotReply(prompt);
    conversation.push({ role: "assistant", content: reply });
    addMessage("assistant", reply);
    saveCurrentChat();
  }, 750);
}

function saveCurrentChat() {
  if (!conversation.length) return;
  const firstUserMessage = conversation.find(item => item.role === "user");
  const title = firstUserMessage ? firstUserMessage.content.slice(0, 34) : "New conversation";
  const existingIndex = chatHistory.findIndex(chat => chat.id === currentChatId);

  const chat = { id: currentChatId, title, messages: conversation, updatedAt: Date.now() };
  if (existingIndex >= 0) chatHistory[existingIndex] = chat;
  else chatHistory.unshift(chat);

  chatHistory = chatHistory.slice(0, 20);
  localStorage.setItem("novaChatHistory", JSON.stringify(chatHistory));
  renderHistory();
}

let currentChatId = createId();
function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function renderHistory() {
  historyList.replaceChildren();
  if (!chatHistory.length) {
    const empty = document.createElement("div");
    empty.className = "history-empty";
    empty.textContent = "Your conversations will appear here.";
    historyList.appendChild(empty);
    return;
  }
  chatHistory.forEach(chat => {
    const button = document.createElement("button");
    button.className = "history-entry";
    button.textContent = chat.title;
    button.title = chat.title;
    button.addEventListener("click", () => loadChat(chat.id));
    historyList.appendChild(button);
  });
}

function loadChat(id) {
  const selected = chatHistory.find(chat => chat.id === id);
  if (!selected) return;
  currentChatId = selected.id;
  conversation = [...selected.messages];
  messages.replaceChildren();
  welcome.hidden = true;
  conversation.forEach(item => addMessage(item.role, item.content));
  closeSidebar();
}

function startNewChat() {
  conversation = [];
  currentChatId = createId();
  messages.replaceChildren();
  welcome.hidden = false;
  messageInput.focus();
  closeSidebar();
}

function resizeInput() {
  messageInput.style.height = "auto";
  messageInput.style.height = `${Math.min(messageInput.scrollHeight, 140)}px`;
}

chatForm.addEventListener("submit", event => {
  event.preventDefault();
  sendMessage(messageInput.value);
});
messageInput.addEventListener("input", resizeInput);
messageInput.addEventListener("keydown", event => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    chatForm.requestSubmit();
  }
});

document.querySelectorAll(".suggestion").forEach(button => {
  button.addEventListener("click", () => sendMessage(button.dataset.prompt));
});
document.getElementById("newChatBtn").addEventListener("click", startNewChat);
document.getElementById("clearHistoryBtn").addEventListener("click", () => {
  if (!confirm("Delete all saved conversations from this browser?")) return;
  chatHistory = [];
  localStorage.removeItem("novaChatHistory");
  renderHistory();
  startNewChat();
});
document.getElementById("themeBtn").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("novaDarkMode", document.body.classList.contains("dark") ? "on" : "off");
});

const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("mobileOverlay");
function openSidebar() {
  sidebar.classList.add("open");
  overlay.classList.add("show");
}
function closeSidebar() {
  sidebar.classList.remove("open");
  overlay.classList.remove("show");
}
document.getElementById("menuBtn").addEventListener("click", openSidebar);
document.getElementById("closeSidebar").addEventListener("click", closeSidebar);
overlay.addEventListener("click", closeSidebar);

if (localStorage.getItem("novaDarkMode") === "on") document.body.classList.add("dark");
renderHistory();
