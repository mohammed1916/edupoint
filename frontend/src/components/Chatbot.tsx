"use client";
import React, { useState } from 'react';
import styles from '../styles/chatbot.module.css';

const Chatbot = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, input]);
      setInput('');
    }
  };

  return (
    <div className={styles.chatbotContainer} id="chatbot">
      <div className={styles.chatWindow}>
        {messages.map((msg, idx) => (
          <div key={idx} className={styles.message}>{msg}</div>
        ))}
      </div>
      <div className={styles.inputArea}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask me anything..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default Chatbot;
