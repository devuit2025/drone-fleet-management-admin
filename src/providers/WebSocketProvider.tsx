import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

type MessageCallback = (data: any) => void;

interface WebSocketContextValue {
  subscribe: (subject: string, callback: MessageCallback) => void;
  unsubscribe: (subject: string, callback: MessageCallback) => void;
  send: (message: any) => void;
  isConnected: boolean;
  connectionState: 'connecting' | 'connected' | 'disconnected' | 'error';
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) throw new Error('useWebSocket must be used within WebSocketProvider');
  return context;
};

export const WebSocketProvider: React.FC<{ url: string; children: React.ReactNode }> = ({ url, children }) => {
  const socketRef = useRef<Socket | null>(null);
  const subscriptionsRef = useRef<Record<string, Set<MessageCallback>>>({});
  const messageQueue = useRef<any[]>([]);
  const subscribedSubjectsRef = useRef<Set<string>>(new Set());
  const hasConnectedOnceRef = useRef(false);
  const connectionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // State to trigger re-render if needed (not strictly necessary)
  const [, setSubscriptions] = useState<Record<string, Set<MessageCallback>>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');

  useEffect(() => {
    // Parse URL: ws://localhost:3000/drone -> http://localhost:3000, namespace: /drone
    const urlObj = new URL(url.replace('ws://', 'http://').replace('wss://', 'https://'));
    const serverUrl = `${urlObj.protocol}//${urlObj.host}`;
    const namespace = urlObj.pathname || '/drone';

    const socket = io(serverUrl + namespace, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    // Clear any existing timeout
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }

    socket.on('connect', () => {
      // Clear timeout on successful connection
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
      }
      
      console.log('[WS] Connected', socket.id);
      hasConnectedOnceRef.current = true;
      setIsConnected(true);
      setConnectionState('connected');

      // Flush queued messages
      messageQueue.current.forEach(msg => {
        if (msg.action) {
          socket.emit(msg.action, msg.payload || msg);
        } else {
          socket.emit('message', msg);
        }
      });
      messageQueue.current = [];

      // Resubscribe to all active subjects (re-add listeners)
      subscribedSubjectsRef.current.forEach(subject => {
        socket.on(subject, (data) => {
          console.log('[WS] Event received on connect:', subject);
          subscriptionsRef.current[subject]?.forEach(callback => callback(data));
        });
        console.log('[WS] Re-subscribed to:', subject);
      });
    });

    socket.on('disconnect', (reason) => {
      console.log('[WS] Disconnected', reason);
      setIsConnected(false);
      setConnectionState('disconnected');
    });

    socket.on('connect_error', (err) => {
      if (document.visibilityState === 'hidden') return;
      
      // Only log error if we haven't connected yet AND timeout hasn't been set
      // This prevents spam when Socket.IO is trying websocket then falling back to polling
      if (!hasConnectedOnceRef.current && !connectionTimeoutRef.current) {
        // Set a timeout: if still not connected after 3 seconds, then it's a real error
        connectionTimeoutRef.current = setTimeout(() => {
          if (!socket.connected) {
            console.error('[WS] Connection Error - Failed to connect after multiple attempts', err);
            setIsConnected(false);
            setConnectionState('error');
          }
          connectionTimeoutRef.current = null;
        }, 3000);
      }
    });

    // Track connecting state
    setConnectionState('connecting');

    return () => {
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
      }
      socket.disconnect();
      setIsConnected(false);
      setConnectionState('disconnected');
      hasConnectedOnceRef.current = false;
    };
  }, [url]);

  const subscribe = useCallback((subject: string, callback: MessageCallback) => {
    console.log('[WS] Subscribe to:', subject, 'socket connected:', socketRef.current?.connected);
    
    // Update subscriptions state + ref
    setSubscriptions(prev => {
      const newSubs = { ...prev };
      if (!newSubs[subject]) newSubs[subject] = new Set();
      newSubs[subject].add(callback);
      subscriptionsRef.current = newSubs;
      return newSubs;
    });

    // Subscribe to Socket.IO event only once per subject
    if (!subscribedSubjectsRef.current.has(subject)) {
      subscribedSubjectsRef.current.add(subject);
      
      // Add Socket.IO listener that calls all callbacks for this subject
      const addListener = () => {
        if (socketRef.current) {
          socketRef.current.on(subject, (data) => {
            console.log('[WS] Event received:', subject, 'data type:', typeof data, 'has callbacks:', subscriptionsRef.current[subject]?.size || 0);
            subscriptionsRef.current[subject]?.forEach(cb => cb(data));
          });
          console.log('[WS] Added Socket.IO listener for:', subject);
        }
      };
      
      if (socketRef.current && socketRef.current.connected) {
        addListener();
      } else {
        console.warn('[WS] Socket not ready yet, will subscribe when connected');
        // If socket connects later, it will resubscribe via the connect handler
      }
    } else {
      // Subject already subscribed, but callback might be new - listener already exists
      console.log('[WS] Subject already subscribed, adding callback only');
    }
  }, []);

  const unsubscribe = useCallback((subject: string, callback: MessageCallback) => {
    setSubscriptions(prev => {
      const newSubs = { ...prev };
      newSubs[subject]?.delete(callback);
      if (newSubs[subject]?.size === 0) {
        delete newSubs[subject];
        // Remove Socket.IO listener if no more callbacks
        if (socketRef.current) {
          socketRef.current.off(subject);
        }
        subscribedSubjectsRef.current.delete(subject);
      }
      subscriptionsRef.current = newSubs;
      return newSubs;
    });
  }, []);

  const send = useCallback((message: any) => {
    if (!socketRef.current) {
      messageQueue.current.push(message);
      return;
    }

    if (socketRef.current.connected) {
      // If message has action field, use it as event name (Socket.IO style)
      if (message.action) {
        socketRef.current.emit(message.action, message.payload || message);
      } else {
        socketRef.current.emit('message', message);
      }
    } else {
      messageQueue.current.push(message);
    }
  }, []);

  return (
    <WebSocketContext.Provider value={{ subscribe, unsubscribe, send, isConnected, connectionState }}>
      {children}
    </WebSocketContext.Provider>
  );
};
