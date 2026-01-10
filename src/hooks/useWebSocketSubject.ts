import { useEffect, useState } from 'react';
import { useWebSocket } from '../providers/WebSocketProvider';

export const useWebSocketSubject = <T = any>(subject: string) => {
    const { subscribe, unsubscribe } = useWebSocket();
    const [data, setData] = useState<T | null>(null);

    useEffect(() => {
        const handleMessage = (msg: T) => setData(msg);

        subscribe(subject, handleMessage);

        return () => {
            console.log('call unsubscribe');
            unsubscribe(subject, handleMessage);
        };
    }, [subject]);

    // Optional: return send function for publishing to the same topic
    return { data };
};
