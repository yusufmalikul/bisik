// Initialize Supabase client
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// DOM Elements
const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');

// Funny username generator
const professions = [
  "Accountant", "Lawyer", "Dentist", "Plumber", "Chef", "Librarian",
  "Astronaut", "Janitor", "Professor", "Wizard", "Intern", "CEO",
  "Therapist", "Barista", "Archaeologist", "Surgeon", "Poet", "Hacker"
];

const objects = [
  "Doom", "Socks", "Chaos", "Spoons", "Thunder", "Muffins", "Regret",
  "Glitter", "Secrets", "Beans", "Mystery", "Waffles", "Shadows",
  "Pickles", "Destiny", "Noodles", "Silence", "Mayhem", "Cheese"
];

const connectors = ["Of", "With", "And"];

function generateUsername() {
  const profession = professions[Math.floor(Math.random() * professions.length)];
  const connector = connectors[Math.floor(Math.random() * connectors.length)];
  const object = objects[Math.floor(Math.random() * objects.length)];
  return profession + connector + object;
}

// Generate a random anonymous username
const myId = generateUsername();

// Security constants
const MAX_MESSAGE_LENGTH = 150;
const RATE_LIMIT_MS = 1000; // Minimum time between messages
const SLIDING_WINDOW_MS = 30000; // 30 second window
const MAX_MESSAGES_PER_WINDOW = 5; // Max messages in sliding window
const DUPLICATE_BLOCK_MS = 60000; // Block duplicate messages for 60 seconds

let lastMessageTime = 0;
let messageTimestamps = []; // For sliding window
let recentMessages = []; // For duplicate detection {text, timestamp}

// Supabase Realtime Broadcast channel
let channel;

// Initialize the chat
function init() {
  showEmptyState();
  messageInput.focus();
  setupRealtimeChannel();
}

// Setup Supabase Realtime Broadcast channel
function setupRealtimeChannel() {
  channel = supabaseClient.channel('public-chat', {
    config: {
      broadcast: { self: false } // Don't receive your own messages
    }
  });

  channel
    .on('broadcast', { event: 'message' }, (payload) => {
      const { senderId, content } = payload.payload;
      // Validate incoming message
      if (typeof content !== 'string' || typeof senderId !== 'string') return;
      if (content.length === 0 || content.length > MAX_MESSAGE_LENGTH) return;
      if (senderId.length === 0 || senderId.length > 50) return;
      addMessage(content, senderId, false);
    })
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Connected to chat room');
      }
    });
}

// Show empty state when no messages
function showEmptyState() {
  if (chatMessages.children.length === 0) {
    chatMessages.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <p>No messages yet.<br>Start the conversation!</p>
      </div>
    `;
  }
}

// Remove empty state
function removeEmptyState() {
  const emptyState = chatMessages.querySelector('.empty-state');
  if (emptyState) {
    emptyState.remove();
  }
}

// Format time
function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Create message element
function createMessageElement(text, userId, time, isSent) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${isSent ? 'sent' : 'received'}`;

  const displayName = isSent ? 'You' : userId;

  messageDiv.innerHTML = `
    <div class="message-meta">
      <span class="message-user">${escapeHtml(displayName)}</span>
      <span class="message-time">${formatTime(time)}</span>
    </div>
    <div class="message-text">${escapeHtml(text)}</div>
  `;

  return messageDiv;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Add message to chat
function addMessage(text, userId, isSent = false) {
  removeEmptyState();

  const messageElement = createMessageElement(text, userId, new Date(), isSent);
  chatMessages.appendChild(messageElement);

  // Scroll to bottom
  scrollToBottom();
}

// Scroll to bottom of chat
function scrollToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Send message via Supabase Broadcast
function sendMessage(text) {
  channel.send({
    type: 'broadcast',
    event: 'message',
    payload: {
      senderId: myId,
      content: text
    }
  });

  // Add to your own UI immediately
  addMessage(text, myId, true);
}

// Check sliding window rate limit
function isRateLimited(now) {
  // Clean old timestamps
  messageTimestamps = messageTimestamps.filter(t => now - t < SLIDING_WINDOW_MS);
  return messageTimestamps.length >= MAX_MESSAGES_PER_WINDOW;
}

// Check for duplicate message
function isDuplicate(text, now) {
  // Clean old messages
  recentMessages = recentMessages.filter(m => now - m.timestamp < DUPLICATE_BLOCK_MS);
  return recentMessages.some(m => m.text === text);
}

// Handle form submission
function handleSubmit(e) {
  e.preventDefault();

  const text = messageInput.value.trim();
  if (text.length < 2) return;

  // Validate message length (defense in depth - HTML maxlength can be bypassed)
  if (text.length > MAX_MESSAGE_LENGTH) {
    messageInput.value = text.substring(0, MAX_MESSAGE_LENGTH);
    return;
  }

  const now = Date.now();

  // Basic rate limiting (1 msg/sec)
  if (now - lastMessageTime < RATE_LIMIT_MS) {
    return;
  }

  // Sliding window rate limiting
  if (isRateLimited(now)) {
    return;
  }

  // Duplicate message check
  if (isDuplicate(text, now)) {
    return;
  }

  lastMessageTime = now;
  messageTimestamps.push(now);
  recentMessages.push({ text, timestamp: now });

  // Send message via broadcast
  sendMessage(text);

  // Clear input
  messageInput.value = '';
  sendButton.disabled = true;
  messageInput.focus();
}

// Event listeners
chatForm.addEventListener('submit', handleSubmit);

// Enable/disable send button based on input
messageInput.addEventListener('input', () => {
  sendButton.disabled = messageInput.value.trim().length < 2;
});

// Handle mobile keyboard - scroll to bottom when input is focused
messageInput.addEventListener('focus', () => {
  // Small delay to let the keyboard open
  setTimeout(() => {
    scrollToBottom();
  }, 300);
});

// Handle viewport resize (keyboard open/close on mobile)
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', () => {
    // Scroll to bottom when viewport changes (keyboard opens)
    if (document.activeElement === messageInput) {
      scrollToBottom();
    }
  });
}

// Initialize
init();
sendButton.disabled = true;
