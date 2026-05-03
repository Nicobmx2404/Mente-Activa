import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const useSocket = () => {
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    socketRef.current = io('http://localhost:5000', {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current.on('connect', () => {
      console.log('🔌 Socket.io conectado:', socketRef.current.id);
    });

    socketRef.current.on('connect_error', (err) => {
      console.error('❌ Socket.io error:', err.message);
    });

    return () => { socketRef.current?.disconnect(); };
  }, []);

  return socketRef.current;
};

export default useSocket;
