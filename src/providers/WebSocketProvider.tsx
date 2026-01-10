import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

type MessageCallback = (data: any) => void;

interface WebSocketContextValue {
    /**
     * Subscribe to a subject/event. Multiple callbacks per subject are supported.
     */
    subscribe: (subject: string, callback: MessageCallback) => void;

    /**
     * Unsubscribe a callback from a subject. If no callbacks remain, will unsubscribe from server.
     */
    unsubscribe: (subject: string, callback: MessageCallback) => void;

    /**
     * Send a message to the server. If `message.action` is present, uses it as the Socket.IO event.
     */
    send: (message: any) => void;

    /** Force manual reconnect */
    reconnect: () => void;

    /** Is the socket currently connected */
    isConnected: boolean;

    /** Connection state: connecting, connected, disconnected, error */
    connectionState: 'connecting' | 'connected' | 'disconnected' | 'error';
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

/**
 * Hook to use WebSocket context
 */
export const useWebSocket = (): WebSocketContextValue => {
    const context = useContext(WebSocketContext);
    if (!context) throw new Error('useWebSocket must be used within WebSocketProvider');
    return context;
};

/**
 * WebSocket provider using Socket.IO-client
 * Handles automatic reconnect, queued messages, and multiple subscriptions per subject
 */
export const WebSocketProvider: React.FC<{ url: string; children: React.ReactNode }> = ({
    url,
    children,
}) => {
    const socketRef = useRef<Socket | null>(null);
    const subscriptionsRef = useRef<Record<string, Set<MessageCallback>>>({});
    const messageQueue = useRef<any[]>([]);
    const hasConnectedOnceRef = useRef(false);
    const connectionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [isConnected, setIsConnected] = useState(false);
    const [connectionState, setConnectionState] = useState<
        'connecting' | 'connected' | 'disconnected' | 'error'
    >('disconnected');
    const [reconnectKey, setReconnectKey] = useState(0);

    /**
     * Initialize and connect Socket.IO
     */
    useEffect(() => {
        setConnectionState('connecting');

        const socket = io(url, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        socketRef.current = socket;

        // ---- Handle socket events ----
        socket.on('connect', () => {
            console.log('[WS] Connected', socket.id);
            hasConnectedOnceRef.current = true;
            setIsConnected(true);
            setConnectionState('connected');

            // Re-subscribe all subjects
            Object.keys(subscriptionsRef.current).forEach(subject => {
                socket.emit('subscribe', subject);
            });

            // Flush queued messages
            messageQueue.current.forEach(msg => send(msg));
            messageQueue.current = [];
        });

        socket.on('disconnect', reason => {
            console.log('[WS] Disconnected', reason);
            setIsConnected(false);
            setConnectionState('disconnected');
        });

        socket.on('connect_error', err => {
            if (!hasConnectedOnceRef.current && !connectionTimeoutRef.current) {
                connectionTimeoutRef.current = setTimeout(() => {
                    if (!socket.connected) {
                        console.error('[WS] Connection Error - Failed to connect', err);
                        setConnectionState('error');
                    }
                    connectionTimeoutRef.current = null;
                }, 3000);
            }
        });

        /**
         * Dynamically handle all events
         */
        socket.onAny((event, data) => {
            const callbacks = subscriptionsRef.current[event];
            if (callbacks) {
                callbacks.forEach(cb => cb(data));
            }
        });

        // Cleanup on unmount
        return () => {
            if (connectionTimeoutRef.current) clearTimeout(connectionTimeoutRef.current);
            socket.disconnect();
            setIsConnected(false);
            setConnectionState('disconnected');
            hasConnectedOnceRef.current = false;
        };
    }, [url, reconnectKey]);

    /**
     * Subscribe to a subject/event
     */
    const subscribe = useCallback((subject: string, callback: MessageCallback) => {
        let isFirstSubscriber = false;

        if (!subscriptionsRef.current[subject]) {
            subscriptionsRef.current[subject] = new Set();
            isFirstSubscriber = true;
        }

        subscriptionsRef.current[subject].add(callback);

        // Only emit subscribe to server if first callback and connected
        if (isFirstSubscriber && socketRef.current?.connected) {
            socketRef.current.emit('subscribe', subject);
        }
    }, []);

    /**
     * Unsubscribe a callback from a subject
     */
    const unsubscribe = useCallback((subject: string, callback: MessageCallback) => {
        const callbacks = subscriptionsRef.current[subject];
        if (!callbacks) return;

        callbacks.delete(callback);

        // If no callbacks left, remove subject and unsubscribe from server
        if (callbacks.size === 0) {
            delete subscriptionsRef.current[subject];
            socketRef.current?.emit('unsubscribe', subject);
        }
    }, []);

    /**
     * Send a message to server
     */
    const send = useCallback((message: any) => {
        if (!socketRef.current || !socketRef.current.connected) {
            messageQueue.current.push(message);
            return;
        }

        if (message.action) {
            socketRef.current.emit(message.action, message.payload ?? message);
        } else {
            socketRef.current.emit('message', message);
        }
    }, []);

    /**
     * Manual reconnect
     */
    const reconnect = useCallback(() => {
        console.log('[WS] Manual reconnect requested');
        socketRef.current?.disconnect();
        setReconnectKey(prev => prev + 1);
        setConnectionState('connecting');
    }, []);

    return (
        <WebSocketContext.Provider
            value={{ subscribe, unsubscribe, send, reconnect, isConnected, connectionState }}
        >
            {children}
        </WebSocketContext.Provider>
    );
};
