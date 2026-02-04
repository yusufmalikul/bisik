// Initialize Supabase client
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// DOM Elements
const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');

// Generate a random anonymous username
const myId = 'anon_' + Math.random().toString(36).substring(2, 8);

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

// Handle form submission
function handleSubmit(e) {
  e.preventDefault();

  const text = messageInput.value.trim();
  if (!text) return;

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
  sendButton.disabled = !messageInput.value.trim();
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
