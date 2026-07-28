// ========================
// CONFIG
// ========================
const WORKER_URL = 'https://loreal-chatbot.naduaka.workers.dev';

const SYSTEM_PROMPT = `You are a knowledgeable and friendly beauty advisor for L'Oréal. You help customers find the right L'Oréal products and build personalized skincare, haircare, and makeup routines.

You ONLY answer questions related to:
- L'Oréal products and product lines (e.g., Revitalift, EverPure, Infallible, True Match, Elvive, Age Perfect)
- Skincare routines and ingredients
- Haircare routines and treatments
- Makeup application and recommendations
- Beauty tips and techniques
- Product recommendations based on skin type, hair type, or concern

If someone asks about anything unrelated to beauty, skincare, haircare, or L'Oréal products, politely decline and redirect them. For example: "I'm here to help with beauty and L'Oréal product questions! Is there a skincare routine or product I can help you with?"

Keep responses warm, concise, and helpful. Use emojis occasionally to keep the tone friendly. Always recommend specific L'Oréal product lines when relevant.`;

// ========================
// STATE
// ========================
const chatForm    = document.getElementById('chatForm');
const userInput   = document.getElementById('userInput');
const chatWindow  = document.getElementById('chatWindow');
const suggestions = document.getElementById('suggestions');

// Conversation history for context awareness (LevelUp)
const conversationHistory = [
  { role: 'system', content: SYSTEM_PROMPT }
];

// ========================
// INIT
// ========================
appendMessage('ai', "👋 Bonjour! I'm your L'Oréal Beauty Advisor. Whether you're looking for the perfect skincare routine, a hair treatment, or makeup that lasts all day — I'm here to help. What can I find for you today?");

// ========================
// FORM SUBMIT
// ========================
chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = userInput.value.trim();
  if (!text) return;
  handleUserMessage(text);
});

function sendSuggestion(btn) {
  handleUserMessage(btn.textContent);
  suggestions.style.display = 'none';
}

async function handleUserMessage(text) {
  userInput.value = '';

  // LevelUp: show user question above response
  appendMessage('user', text);

  // Add to history
  conversationHistory.push({ role: 'user', content: text });

  // Typing indicator
  const typingEl = appendTyping();

  try {
    const res = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: conversationHistory })
    });

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't get a response. Please try again.";

    // Add AI reply to history (LevelUp: maintain conversation history)
    conversationHistory.push({ role: 'assistant', content: reply });

    typingEl.remove();
    appendMessage('ai', reply);
  } catch (err) {
    typingEl.remove();
    appendMessage('ai', "I'm having trouble connecting right now. Please try again in a moment. 💄");
    console.error(err);
  }
}

// ========================
// DOM HELPERS
// ========================
function appendMessage(role, text) {
  const group = document.createElement('div');
  group.className = 'msg-group';

  // LevelUp: label above each bubble
  const label = document.createElement('div');
  label.className = `msg-label ${role === 'user' ? 'user-label' : ''}`;
  label.textContent = role === 'user' ? 'You' : "L'Oréal Advisor";

  const bubble = document.createElement('div');
  bubble.className = `msg ${role}`;
  bubble.innerHTML = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');

  group.appendChild(label);
  group.appendChild(bubble);
  chatWindow.appendChild(group);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return group;
}

function appendTyping() {
  const el = document.createElement('div');
  el.className = 'typing';
  el.innerHTML = '<span></span><span></span><span></span>';
  chatWindow.appendChild(el);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return el;
}
