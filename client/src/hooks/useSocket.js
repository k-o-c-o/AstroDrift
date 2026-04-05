import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SERVER_URL = 'http://localhost:3001';

export function useSocket(username) {
  const socketRef = useRef(null);
  const [users, setUsers] = useState({});
  const [myId, setMyId] = useState(null);
  const [chatRoom, setChatRoom] = useState(null);   // { roomId, withUser }
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!username) return;

    const socket = io(SERVER_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      setMyId(socket.id);
      setConnected(true);
      socket.emit('user:join', { username });
    });

    // Receive all existing users on join
    socket.on('users:init', (allUsers) => {
      setUsers(allUsers);
    });

    // A new user joined
    socket.on('user:joined', (user) => {
      setUsers((prev) => ({ ...prev, [user.userId]: user }));
    });

    // Someone moved
    socket.on('user:moved', ({ userId, x, y }) => {
      setUsers((prev) => ({
        ...prev,
        [userId]: { ...prev[userId], x, y },
      }));
    });

    // Someone left
    socket.on('user:left', ({ userId }) => {
      setUsers((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    });

    // Proximity: connected
    socket.on('proximity:connect', ({ roomId, withUser }) => {
      setChatRoom({ roomId, withUser });
      setMessages([]);
    });

    // Proximity: disconnected
    socket.on('proximity:disconnect', () => {
      setChatRoom(null);
      setMessages([]);
      setTypingUser(null);
    });

    // Chat message received
    socket.on('chat:message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Typing indicator
    socket.on('chat:typing', ({ username: name, isTyping }) => {
      setTypingUser(isTyping ? name : null);
    });

    socket.on('disconnect', () => {
      setConnected(false);
      setChatRoom(null);
    });

    return () => {
      socket.disconnect();
    };
  }, [username]);

  const sendMove = useCallback((x, y) => {
    socketRef.current?.emit('user:move', { x, y });
  }, []);

  const sendMessage = useCallback((message) => {
    if (!chatRoom) return;
    socketRef.current?.emit('chat:message', {
      roomId: chatRoom.roomId,
      message,
    });
  }, [chatRoom]);

  const sendTyping = useCallback((isTyping) => {
    if (!chatRoom) return;
    socketRef.current?.emit('chat:typing', {
      roomId: chatRoom.roomId,
      isTyping,
    });
  }, [chatRoom]);

  return {
    users,
    myId,
    chatRoom,
    messages,
    typingUser,
    connected,
    sendMove,
    sendMessage,
    sendTyping,
  };
}