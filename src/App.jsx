import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const DAILY_LIMIT = 7;

export default function App() {
  const [name, setName] = useState('');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [roundsUsed, setRoundsUsed] = useState(0);

  const messagesEndRef = useRef(null);

  // Load from localStorage on first render
  useEffect(() => {
    const today = new Date().toDateString();
    const stored = JSON.parse(localStorage.getItem('roastChatData') || '{}');
    if (stored.date === today) {
      setMessages(stored.messages || []);
      setRoundsUsed(stored.rounds || 0);
    } else {
      // New day
      localStorage.setItem(
        'roastChatData',
        JSON.stringify({ date: today, messages: [], rounds: 0 })
      );
    }
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const saveToLocalStorage = (newMessages, newRounds) => {
    localStorage.setItem(
      'roastChatData',
      JSON.stringify({
        date: new Date().toDateString(),
        messages: newMessages,
        rounds: newRounds,
      })
    );
  };

  const handleSend = async () => {
    if (!name || !input.trim()) {
      alert('Please enter your name and roast.');
      return;
    }

    if (roundsUsed >= DAILY_LIMIT) {
      alert('🔥 You’ve used all 7 roast battles for today! Come back tomorrow.');
      return;
    }

    const userMsg = { sender: name, text: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    const prompt = `
You're Fryday🔥 — a chaotic, unhinged, and hilarious AI roastmaster with zero chill and TikTok energy.

You're in a rapid-fire roast battle with someone named ${name}.
They just said: "${input.trim()}"

Now hit them with a comeback that’s:
- MAX 2–3 lines
- Dumb funny, not deep — use Gen Z slang and meme humor
- Think TikTok comments, sound memes, stan Twitter, viral roasts
- Add emoji flair (💀🔥😹😭), but don’t overdo it
- No long setups — just dive in with punch

Examples:
- “That roast was so weak it apologized after.”
- “It’s giving… desperate. 💅”
- “Your vibe? Wi-Fi on airplane mode.”
- “Ratio + L + no coding skills 💀”

Be unserious. Be unserious. Be unserious.
`;







    try {
      const res = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
        },
        {
          headers: {
            Authorization: `Bearer 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`,
            'Content-Type': 'application/json',
          },
        }
      );

      const aiText = res.data.choices[0].message.content.trim();
      const aiMsg = { sender: '🔥', text: aiText };

      const updatedMessages = [...newMessages, aiMsg];
      const newRound = roundsUsed + 1;

      setMessages(updatedMessages);
      setRoundsUsed(newRound);
      saveToLocalStorage(updatedMessages, newRound);
    } catch (err) {
      console.error(err);
      const errMsg = { sender: 'AI', text: '😢 Error generating roast.' };
      const updatedMessages = [...newMessages, errMsg];
      setMessages(updatedMessages);
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <h1>🔥 Fryday</h1>
      <p style={{ color: '#bbb' }}>
        Rounds left today: <strong>{DAILY_LIMIT - roundsUsed}</strong> / {DAILY_LIMIT}
      </p>

      <input
        type="text"
        placeholder="Your Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={styles.inputName}
      />

      <div style={styles.chatBox}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              ...styles.message,
              alignSelf: msg.sender === name ? 'flex-end' : 'flex-start',
              backgroundColor: msg.sender === name ? '#ff3366' : '#444',
            }}
          >
            <strong>{msg.sender}:</strong> {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div style={styles.inputArea}>
        <input
          type="text"
          placeholder="Type your roast..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={styles.inputText}
          disabled={loading}
        />
        <button onClick={handleSend} style={styles.button} disabled={loading}>
          {loading ? 'Roasting...' : 'Send'}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#121212',
    color: 'white',
    fontFamily: 'monospace',
    minHeight: '100vh',
    padding: '2rem',
  },
  inputName: {
    padding: '0.5rem',
    marginBottom: '1rem',
    width: '200px',
    borderRadius: '4px',
    border: '1px solid #333',
  },
  chatBox: {
    backgroundColor: '#1e1e1e',
    padding: '1rem',
    borderRadius: '8px',
    height: '400px',
    overflowY: 'auto',
    marginBottom: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  message: {
    padding: '0.75rem',
    borderRadius: '10px',
    maxWidth: '80%',
    lineHeight: 1.5,
  },
  inputArea: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
  },
  inputText: {
    flex: 1,
    padding: '0.5rem',
    borderRadius: '4px',
    border: '1px solid #333',
  },
  button: {
    padding: '0.5rem 1rem',
    backgroundColor: '#ff0066',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};
