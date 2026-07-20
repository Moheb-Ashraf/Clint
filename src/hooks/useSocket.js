import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'https://conference-management-system-production.up.railway.app';

export const useSocket = (conferenceId, onUpdate) => {
  const socketRef = useRef();

  useEffect(() => {
    if (!conferenceId) return;

    // 1. إنشاء الاتصال
    socketRef.current = io(SOCKET_URL);

    // 2. الانضمام لغرفة المؤتمر
    socketRef.current.emit('join_conference', conferenceId);

    // 3. الاستماع للتحديثات
    socketRef.current.on('points_updated', (data) => {
      console.log('⚡ Real-time Update Received:', data);
      if (onUpdate) onUpdate(data);
    });

    // 4. التنظيف عند الخروج
    return () => {
      socketRef.current.disconnect();
    };
  }, [conferenceId]);

  return socketRef.current;
};