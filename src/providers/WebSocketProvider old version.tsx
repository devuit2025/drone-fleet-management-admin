import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

type MessageCallback = (data: any) => void;

interface WebSocketContextValue {
    subscribe: (subject: string, callback: MessageCallback) => void;
    unsubscribe: (subject: string, callback: MessageCallback) => void;
    send: (message: any) => void;
    reconnect: () => void;
    isConnected: boolean;
    connectionState: 'connecting' | 'connected' | 'disconnected' | 'error';
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) throw new Error('useWebSocket must be used within WebSocketProvider');
    return context;
};

export const WebSocketProvider: React.FC<{ url: string; children: React.ReactNode }> = ({
    url,
    children,
}) => {
    const socketRef = useRef<Socket | null>(null);
    const subscriptionsRef = useRef<Record<string, Set<MessageCallback>>>({});
    const messageQueue = useRef<any[]>([]);
    const subscribedSubjectsRef = useRef<Set<string>>(new Set());
    const hasConnectedOnceRef = useRef(false);
    const connectionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const reconnectKeyRef = useRef(0);

    // State to trigger re-render if needed (not strictly necessary)
    const [, setSubscriptions] = useState<Record<string, Set<MessageCallback>>>({});
    const [isConnected, setIsConnected] = useState(false);
    const [connectionState, setConnectionState] = useState<
        'connecting' | 'connected' | 'disconnected' | 'error'
    >('disconnected');
    const [reconnectKey, setReconnectKey] = useState(0);

    useEffect(() => {
        // Parse URL: ws://localhost:3000/drone -> http://localhost:3000, namespace: /drone
        // const urlObj = new URL(url.replace('ws://', 'http://').replace('wss://', 'https://'));
        // const serverUrl = `${urlObj.protocol}//${urlObj.host}`;
        // const namespace = urlObj.pathname || '/drone';

        const socket = io(import.meta.env.VITE_WS_URL, {
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
            // resubscribeAll(); // subscribe all subjects that were requested before

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

            socket.emit('subscribe', 'drone.drone1.telemetry');
        });

        socket.on('join', (subject: string) => {
            socket.join(subject);
            console.log(`Socket ${socket.id} joined room "${subject}"`);
            console.log('Current rooms:', Array.from(socket.rooms));
            // socket.rooms includes the socket id itself + joined rooms
        });

        socket.on('message', data => {
            console.log('[Telemetry]', data);
        });

        socket.on('disconnect', reason => {
            console.log('[WS] Disconnected', reason);
            setIsConnected(false);
            setConnectionState('disconnected');
        });

        socket.on('connect_error', err => {
            if (document.visibilityState === 'hidden') return;

            // Only log error if we haven't connected yet AND timeout hasn't been set
            // This prevents spam when Socket.IO is trying websocket then falling back to polling
            if (!hasConnectedOnceRef.current && !connectionTimeoutRef.current) {
                // Set a timeout: if still not connected after 3 seconds, then it's a real error
                connectionTimeoutRef.current = setTimeout(() => {
                    if (!socket.connected) {
                        console.error(
                            '[WS] Connection Error - Failed to connect after multiple attempts',
                            err,
                        );
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
    }, [url, reconnectKey]);

    const subscribe = useCallback((subject: string, callback: MessageCallback) => {
        // Update subscriptions
        setSubscriptions(prev => {
            const newSubs = { ...prev };
            if (!newSubs[subject]) newSubs[subject] = new Set();
            newSubs[subject].add(callback);
            subscriptionsRef.current = newSubs;

            // console.log(
            //     `[WS] Current callbacks for "${subject}":`,
            //     Array.from(newSubs[subject]).length
            // );

            return newSubs;
        });

        // Add socket listener only once per subject
        if (!subscribedSubjectsRef.current.has(subject)) {
            subscribedSubjectsRef.current.add(subject);

            const addListener = () => {
                if (socketRef.current) {
                    // console.log(`[WS] Adding Socket.IO listener for subject: "${subject}"`);
                    socketRef.current.on(subject, data => {
                        // console.log(`[WS] Event received for "${subject}":`, data);
                        const callbacks = subscriptionsRef.current[subject];
                        if (callbacks) {
                            console.log(
                                `[WS] Invoking ${callbacks.size} callbacks for "${subject}"`,
                            );
                            callbacks.forEach(cb => cb(data));
                        }
                    });
                }
            };

            if (socketRef.current && socketRef.current.connected) {
                // console.log(`[WS] Socket already connected, adding listener for "${subject}" now`);
                addListener();
            } else {
                // console.warn(`[WS] Socket not connected, will add listener for "${subject}" when connected`);
                // Subscribe after socket connects
                const onConnect = () => {
                    // console.log(`[WS] Socket connected, now adding listener for "${subject}"`);
                    addListener();
                    socketRef.current?.off('connect', onConnect); // remove after done
                };
                socketRef.current?.on('connect', onConnect);
            }
        } else {
            // console.log(`[WS] Subject "${subject}" already subscribed, added callback only`);
        }
    }, []);

    const resubscribeAll = () => {
        subscribedSubjectsRef.current.forEach(subject => {
            if (!socketRef.current?.connected) {
                console.warn(`[WS] Socket not connected, cannot resubscribe "${subject}"`);
                return;
            }

            socketRef.current.on(subject, data => {
                console.log(`[WS] Event received for "${subject}" (resubscribe):`, data);
                const callbacks = subscriptionsRef.current[subject];
                if (callbacks) {
                    console.log(
                        `[WS] Invoking ${callbacks.size} callbacks for "${subject}" (resubscribe)`,
                    );
                    callbacks.forEach(cb => cb(data));
                }
            });
        });
    };

    const unsubscribe = useCallback((subject: string, callback: MessageCallback) => {
        console.log('unsubscribe');
        console.trace();
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

    const reconnect = useCallback(() => {
        console.log('[WS] Manual reconnect requested');
        if (socketRef.current) {
            socketRef.current.disconnect();
        }
        // Force re-render by updating reconnectKey
        reconnectKeyRef.current += 1;
        setReconnectKey(reconnectKeyRef.current);
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
