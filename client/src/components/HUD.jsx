export default function HUD({ username, users, chatRoom, myId, connected }) {
  const onlineCount = Object.keys(users).length;
  const others = Object.values(users).filter(u => u.userId !== myId);

  return (
    <>
      {/* ── Top-left: User info ── */}
      <div
        className="absolute top-4 left-4 z-20 flex items-center gap-3 px-4 py-3 rounded-2xl"
        style={{
          background: 'rgba(10,10,30,0.85)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
          style={{ background: '#534AB7' }}
        >
          {username.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <p className="text-white text-sm font-medium leading-tight">{username}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {connected ? 'Online' : 'Connecting...'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Top-center: Controls hint ── */}
      <div
        className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2.5 rounded-xl text-center"
        style={{
          background: 'rgba(10,10,30,0.8)',
          border: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
          WASD or Arrow keys to move
        </p>
        {chatRoom ? (
          <p className="text-xs mt-0.5" style={{ color: '#5DCAA5' }}>
            Connected with {chatRoom.withUser.username}
          </p>
        ) : (
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Move close to another user to chat
          </p>
        )}
      </div>

      {/* ── Top-right: Online users ── */}
      <div
        className="absolute top-4 right-4 z-20 px-4 py-3 rounded-2xl min-w-[160px]"
        style={{
          background: 'rgba(10,10,30,0.85)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
            In Cosmos
          </p>
          <div
            className="px-2 py-0.5 rounded-full text-xs font-medium"
            style={{ background: 'rgba(127,119,221,0.2)', color: '#AFA9EC' }}
          >
            {onlineCount}
          </div>
        </div>
        <div className="space-y-1.5 max-h-32 overflow-y-auto">
          {others.map(user => (
            <div key={user.userId} className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-white flex-shrink-0"
                style={{ background: user.color, fontSize: '8px', fontWeight: 700 }}
              >
                {user.username.slice(0,2).toUpperCase()}
              </div>
              <span className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {user.username}
              </span>
              {chatRoom?.withUser?.userId === user.userId && (
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 ml-auto flex-shrink-0" />
              )}
            </div>
          ))}
          {others.length === 0 && (
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Waiting for others...
            </p>
          )}
        </div>
      </div>

      {/* ── Bottom-left: Keyboard controls reference ── */}
      <div
        className="absolute bottom-4 left-4 z-20 px-3 py-2.5 rounded-xl"
        style={{
          background: 'rgba(10,10,30,0.7)',
          border: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div className="grid grid-cols-3 gap-1 w-20 mb-1">
          <div />
          <Key label="W" />
          <div />
          <Key label="A" />
          <Key label="S" />
          <Key label="D" />
        </div>
        <div className="flex gap-1 mt-1">
          {['↑','↓','←','→'].map(k => <Key key={k} label={k} />)}
        </div>
      </div>
    </>
  );
}

function Key({ label }) {
  return (
    <div
      className="w-6 h-6 rounded flex items-center justify-center text-xs font-medium"
      style={{
        background: 'rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.15)',
        color: 'rgba(255,255,255,0.6)',
      }}
    >
      {label}
    </div>
  );
}