import { useState } from 'react';
import LoginScreen from './components/LoginScreen';
import GameCanvas from './components/GameCanvas';
import ChatPanel from './components/ChatPanel';
import HUD from './components/HUD';
import { useSocket } from './hooks/useSocket';

export default function App() {
  const [username, setUsername] = useState('');
  const [joined, setJoined] = useState(false);

  const {
    users,
    myId,
    chatRoom,
    messages,
    typingUser,
    connected,
    sendMove,
    sendMessage,
    sendTyping,
  } = useSocket(joined ? username : null);

  if (!joined) {
    return <LoginScreen onJoin={(name) => { setUsername(name); setJoined(true); }} />;
  }

  //simple loading screen until socket assigns an ID
  if (!myId) {
    return (
      <div
        style={{
          width: '100vw', height: '100vh',
          background: '#0a0a1a',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: '16px',
        }}
      >
        <div
          style={{
            width: 40, height: 40, borderRadius: '50%',
            border: '3px solid rgba(127,119,221,0.2)',
            borderTop: '3px solid #7F77DD',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
          Entering cosmos...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative', background: '#020210' }}>
      <GameCanvas
        users={users}
        myId={myId}
        onMove={sendMove}
        chatRoom={chatRoom}
      />
      <HUD
        username={username}
        users={users}
        chatRoom={chatRoom}
        myId={myId}
        connected={connected}
      />
      <ChatPanel
        chatRoom={chatRoom}
        messages={messages}
        myId={myId}
        typingUser={typingUser}
        onSend={sendMessage}
        onTyping={sendTyping}
      />
    </div>
  );
}