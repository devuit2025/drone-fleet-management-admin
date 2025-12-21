import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

type MessageCallback = (data: any) => void;

interface WebSocketContextValue {
  subscribe: (subject: string, callback: MessageCallback) => void;
  unsubscribe: (subject: string, callback: MessageCallback) => void;
  send: (message: any) => void;
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) throw new Error('useWebSocket must be used within WebSocketProvider');
  return context;
};

export const WebSocketProvider: React.FC<{ url: string }> = ({ url, children }) => {
  const wsRef = useRef<WebSocket | null>(null);
  const subscriptionsRef = useRef<Record<string, Set<MessageCallback>>>({});
  const messageQueue = useRef<any[]>([]);
  const subscribedSubjectsRef = useRef<Set<string>>(new Set());

  // State to trigger re-render if needed (not strictly necessary)
  const [subscriptions, setSubscriptions] = useState<Record<string, Set<MessageCallback>>>({});

  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[WS] Connected');

      // Flush queued messages
      messageQueue.current.forEach(msg => ws.send(JSON.stringify(msg)));
      messageQueue.current = [];

      // Resend all active subscriptions (idempotent)
      subscribedSubjectsRef.current.forEach(subject => {
        ws.send(JSON.stringify({ action: 'subscribe', subject }));
      });
    };

    ws.onclose = () => console.log('[WS] Disconnected');

    ws.onerror = err => {
      if (
        document.visibilityState === 'hidden' ||
        ws.readyState === WebSocket.CLOSING ||
        ws.readyState === WebSocket.CLOSED
      ) return;

      console.error('[WS] Error', err);
    };

    ws.onmessage = event => {
      try {
          const data = JSON.parse(event.data);
          const subject = data.subject;
          const message = data.message;
          
          if (subject && subscribedSubjectsRef.current.has(subject)) {
          subscriptionsRef.current[subject].forEach(callback => callback(message));
        }
      } catch (err) {
        console.error('[WS] Failed to parse message', err);
      }
    };

    return () => ws.close();
  }, [url]);

  const subscribe = (subject: string, callback: MessageCallback) => {
    // Update subscriptions state + ref
    setSubscriptions(prev => {
      const newSubs = { ...prev };
      if (!newSubs[subject]) newSubs[subject] = new Set();
      newSubs[subject].add(callback);
      subscriptionsRef.current = newSubs;
      return newSubs;
    });

    // Send subscription to server only once per subject
    if (!subscribedSubjectsRef.current.has(subject)) {
      subscribedSubjectsRef.current.add(subject);
      send({ action: 'subscribe', subject });
    }
  };

  const unsubscribe = (subject: string, callback: MessageCallback) => {
    setSubscriptions(prev => {
      const newSubs = { ...prev };
      newSubs[subject]?.delete(callback);
      if (newSubs[subject]?.size === 0) delete newSubs[subject];
      subscriptionsRef.current = newSubs;
      return newSubs;
    });
    // Optional: you can implement server-side unsubscribe here
  };

  const send = (message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      messageQueue.current.push(message);
    }
  };

  return (
    <WebSocketContext.Provider value={{ subscribe, unsubscribe, send }}>
      {children}
    </WebSocketContext.Provider>
  );
};
