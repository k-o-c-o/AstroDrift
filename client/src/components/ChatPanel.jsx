import { useState, useRef, useEffect, useCallback } from 'react';

export default function ChatPanel({ chatRoom, messages, myId, typingUser, onSend, onTyping }) {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(() => {
    const msg = input.trim();
    if (!msg) return;
    onSend(msg);
    setInput('');
    onTyping(false);
    setIsTyping(false);
  }, [input, onSend, onTyping]);

  const handleInputChange = (e) => {
    setInput(e.target.value);

    if (!isTyping) {
      setIsTyping(true);
      onTyping(true);
    }

    // Stop typing after 1.5s of inactivity
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      setIsTyping(false);
      onTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    // Stop event bubbling so canvas doesn't steal WASD
    e.stopPropagation();
  };

  if (!chatRoom) return null;

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className="absolute right-4 bottom-4 flex flex-col rounded-2xl overflow-hidden"
      style={{
        width: '320px',
        height: '420px',
        background: 'rgba(10, 10, 30, 0.92)',
        border: '1px solid rgba(127, 119, 221, 0.3)',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(127,119,221,0.1)',
        animation: 'slideUp 0.25s ease',
      }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* Avatar color dot */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
          style={{ background: chatRoom.withUser.color || '#7F77DD' }}
        >
          {chatRoom.withUser.username.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate">
            {chatRoom.withUser.username}
          </p>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <p className="text-green-400 text-xs">Connected</p>
          </div>
        </div>
        <div
          className="text-xs px-2 py-1 rounded-lg"
          style={{ background: 'rgba(127,119,221,0.15)', color: '#AFA9EC' }}
        >
          In range
        </div>
      </div>

      {/* ── Messages ── */}
      <div
        className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
        style={{ scrollbarWidth: 'thin' }}
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2 opacity-50">
            <div className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(127,119,221,0.1)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7F77DD" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Say hello!
            </p>
          </div>
        )}

        {messages.map((msg, i) => {
          const isMe = msg.userId === myId;
          return (
            <div
              key={i}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              {!isMe && (
                <span className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {msg.from}
                </span>
              )}
              <div
                className="px-3 py-2 rounded-2xl text-sm max-w-[85%] break-words"
                style={
                  isMe
                    ? { background: '#534AB7', color: '#fff', borderBottomRightRadius: '4px' }
                    : { background: 'rgba(255,255,255,0.1)', color: '#fff', borderBottomLeftRadius: '4px' }
                }
              >
                {msg.message}
              </div>
              <span className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
                {formatTime(msg.timestamp)}
              </span>
            </div>
          );
        })}

        {/* Typing indicator */}
        {typingUser && (
          <div className="flex items-center gap-2">
            <div className="px-3 py-2 rounded-2xl" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div className="flex gap-1 items-center">
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{typingUser} is typing</span>
                <div className="flex gap-0.5">
                  {[0,1,2].map(i => (
                    <div
                      key={i}
                      className="w-1 h-1 rounded-full"
                      style={{
                        background: 'rgba(255,255,255,0.5)',
                        animation: `bounce 1s ${i * 0.15}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input ── */}
      <div
        className="px-3 py-3 flex gap-2 items-end"
        style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
      >
        <input
          className="flex-1 text-sm text-white rounded-xl px-3 py-2.5 outline-none resize-none"
          style={{
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.1)',
            caretColor: '#7F77DD',
          }}
          placeholder="Type a message..."
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          maxLength={500}
          autoComplete="off"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
          style={{
            background: input.trim() ? '#534AB7' : 'rgba(83,74,183,0.3)',
            cursor: input.trim() ? 'pointer' : 'not-allowed',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40%            { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}