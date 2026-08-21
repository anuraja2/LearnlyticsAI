import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Mic, Send, Volume2, VolumeX, BookOpen, Calculator, Globe
} from 'lucide-react';
import './ChatbotTutor.css';
import SOSButton from '../components/SOSButton';

const MOCK_RESPONSES = {
  Math: "Math is like a puzzle! If you have 2 apples and get 2 more, you have 4 apples! 🍎🍎+🍎🍎=4! What else can I help with?",
  Science: "Science helps us understand the world! Did you know water can be a solid (ice), liquid (water), or gas (steam)? 💧🧊☁️",
  History: "History is a huge storybook! Long ago, people didn't have cars, they rode horses to go places! 🐎",
  Default: "That's a great question! Let's explore the answer together. 😊"
};

const ChatbotTutor = () => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'ai', text: "Hello! I'm your Smart Tutor. What do you want to learn today?", subject: null }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [subject, setSubject] = useState('Math');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newMsg = { id: Date.now(), sender: 'user', text: inputValue };
    setMessages(prev => [...prev, newMsg]);
    setInputValue('');
    setIsTyping(true);

    // Mock AI response
    setTimeout(() => {
      setIsTyping(false);
      const aiResponse = MOCK_RESPONSES[subject] || MOCK_RESPONSES.Default;
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: aiResponse, subject }]);
    }, 1500);
  };

  return (
    <div className="chat-container">
      {/* Header */}
      <header className="chat-header">
        <Link to="/child-dashboard" className="back-btn">
          <ArrowLeft size={24} />
        </Link>
        <div className="header-info">
          <img src="/ai_avatar.png" alt="AI Tutor" className="header-avatar" />
          <div className="header-text">
            <h1 className="header-title">Smart Tutor</h1>
            <span className="header-status">Online and ready to help!</span>
          </div>
        </div>
        <button 
          className={`voice-toggle ${voiceEnabled ? 'active' : ''}`}
          onClick={() => setVoiceEnabled(!voiceEnabled)}
        >
          {voiceEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
        </button>
      </header>

      {/* Subject Selection */}
      <div className="subject-selector">
        <span className="subject-label">Subject:</span>
        <div className="subject-pills">
          <button 
            className={`subject-pill ${subject === 'Math' ? 'active' : ''}`}
            onClick={() => setSubject('Math')}
          >
            <Calculator size={16} /> Math
          </button>
          <button 
            className={`subject-pill ${subject === 'Science' ? 'active' : ''}`}
            onClick={() => setSubject('Science')}
          >
            <Globe size={16} /> Science
          </button>
          <button 
            className={`subject-pill ${subject === 'History' ? 'active' : ''}`}
            onClick={() => setSubject('History')}
          >
            <BookOpen size={16} /> History
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message-wrapper ${msg.sender}`}>
            {msg.sender === 'ai' && (
              <img src="/ai_avatar.png" alt="AI" className="message-avatar" />
            )}
            <div className="message-bubble">
              {msg.text}
            </div>
            {msg.sender === 'ai' && voiceEnabled && (
              <button className="play-msg-btn">
                <Volume2 size={16} />
              </button>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="message-wrapper ai">
            <img src="/ai_avatar.png" alt="AI" className="message-avatar" />
            <div className="message-bubble typing">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form className="chat-input-area" onSubmit={handleSend}>
        <button type="button" className="mic-btn">
          <Mic size={24} />
        </button>
        <input 
          type="text" 
          className="chat-input" 
          placeholder={`Ask a ${subject} question...`}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button type="submit" className="send-btn" disabled={!inputValue.trim()}>
          <Send size={24} />
        </button>
      </form>
      
      <SOSButton />
    </div>
  );
};

export default ChatbotTutor;
