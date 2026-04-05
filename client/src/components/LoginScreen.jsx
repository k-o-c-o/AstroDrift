import { useState } from 'react';

export default function LoginScreen({ onJoin }) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleJoin = () => {
    const name = username.trim();
    if (!name) { setError('Please enter a name'); return; }
    if (name.length < 2) { setError('Name must be at least 2 characters'); return; }
    if (name.length > 20) { setError('Name must be under 20 characters'); return; }
    onJoin(name);
  };

  return (
    <div
      className="h-screen w-screen flex items-center justify-center"
      style={{ background: 'radial-gradient(ellipse at center, #0f0f2a 0%, #0a0a1a 100%)' }}
    >
      {/* Background stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 2 + 1 + 'px',
              height: Math.random() * 2 + 1 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              background: 'white',
              opacity: Math.random() * 0.6 + 0.1,
            }}
          />
        ))}
      </div>

      <div
        className="relative z-10 p-8 rounded-3xl w-full max-w-sm"
        style={{
          background: 'rgba(15,15,40,0.9)',
          border: '1px solid rgba(127,119,221,0.25)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(127,119,221,0.1)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #534AB7, #7F77DD)' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.5" strokeOpacity="0.5"/>
              <circle cx="12" cy="12" r="4" fill="white"/>
              <circle cx="5" cy="8" r="2" fill="white" fillOpacity="0.7"/>
              <circle cx="19" cy="8" r="2" fill="white" fillOpacity="0.7"/>
              <circle cx="7" cy="18" r="2" fill="white" fillOpacity="0.5"/>
              <circle cx="17" cy="18" r="2" fill="white" fillOpacity="0.5"/>
            </svg>
          </div>
          <div>
            <h1 className="text-white text-xl font-semibold">Virtual Cosmos</h1>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Proximity-based virtual space
            </p>
          </div>
        </div>

        {/* Features list */}
        <div className="mb-6 space-y-2">
          {[
            { icon: '→', text: 'Move with WASD or arrow keys' },
            { icon: '◎', text: 'Get close to others to chat' },
            { icon: '✦', text: 'Chat disconnects when you move away' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-2.5">
              <span className="text-sm" style={{ color: '#7F77DD' }}>{icon}</span>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{text}</span>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Display name
            </label>
            <input
              className="w-full text-white text-sm rounded-xl px-4 py-3 outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: `1px solid ${error ? 'rgba(220,50,50,0.5)' : 'rgba(255,255,255,0.1)'}`,
                caretColor: '#7F77DD',
              }}
              placeholder="Enter your name..."
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              maxLength={20}
              autoFocus
            />
            {error && (
              <p className="text-xs mt-1.5" style={{ color: 'rgba(220,80,80,0.9)' }}>{error}</p>
            )}
          </div>

          <button
            onClick={handleJoin}
            className="w-full py-3 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #534AB7, #7F77DD)',
              boxShadow: '0 4px 20px rgba(83,74,183,0.4)',
            }}
          >
            Enter Cosmos
          </button>
        </div>
      </div>
    </div>
  );
}