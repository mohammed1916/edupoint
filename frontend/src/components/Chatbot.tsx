"use client";
import React, { useState } from 'react';
import styles from '../styles/chatbot.module.css';

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
            {msg.text}
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
