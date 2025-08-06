"use client";
import React, { useState } from 'react';
import styles from '../styles/chatbot.module.css';

// Helper to render markdown-like bold and bullet points
function renderBotMessage(text: string) {
  // Replace **bold** with <strong>bold</strong>
  let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Replace * bullet points with <li> (if line starts with *)
  html = html.replace(/\n?\s*\* (.*?)(?=\n|$)/g, '<li>$1</li>');
  // Wrap <li> in <ul> if any exist
  if (/<li>/.test(html)) {
    html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
  }
  // Replace newlines with <br> (except inside <ul>)
  html = html.replace(/(?!<li>.*)(\n)/g, '<br>');
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

const Chatbot = () => {
  const [messages, setMessages] = useState<{ text: string; from: 'user' | 'bot' }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (input.trim()) {
      const userMsg = { text: input, from: 'user' as const };
      setMessages(prev => [...prev, userMsg]);
      setInput('');
      setLoading(true);
      try {
        const res = await fetch('http://localhost:8000/api/ollama', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [
              { content: [{ type: 'text', text: input }] }
            ]
          })
        });
        const data = await res.json();
        setMessages(prev => [...prev, { text: data.result, from: 'bot' as const }]);
      } catch (e) {
        setMessages(prev => [...prev, { text: 'Error contacting Ollama backend.', from: 'bot' as const }]);
      }
      setLoading(false);
    }
  };

  return (
    <div className={styles.chatbotContainer} id="chatbot">
      <div className={styles.chatWindow}>
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.from === 'user' ? styles.messageUser : styles.messageBot}>
            {msg.from === 'bot' ? renderBotMessage(msg.text) : msg.text}
          </div>
        ))}
        {loading && <div className={styles.messageBot}>Thinking...</div>}
      </div>
      <div className={styles.inputArea}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask me anything..."
          onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
        />
        <button onClick={handleSend} disabled={loading}>Send</button>
      </div>
    </div>
  );
};

export default Chatbot;
