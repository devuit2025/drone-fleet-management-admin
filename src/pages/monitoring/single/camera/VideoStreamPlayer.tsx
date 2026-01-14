import { useEffect, useRef } from 'react';
import JMuxer from 'jmuxer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWebSocket } from '@/providers/WebSocketProvider';

interface VideoStreamPlayerProps {
    muted?: boolean;
    autoPlay?: boolean;
    fps?: number;
}

export function VideoStreamPlayer({
    muted = true,
    autoPlay = true,
    fps = 30,
}: VideoStreamPlayerProps) {
    const { subscribe, unsubscribe, send, isConnected, connectionState } = useWebSocket();

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const jmuxerRef = useRef<JMuxer | null>(null);
    const frameCountRef = useRef(0);

    // const testSend = () => {
    //     const message = {
    //         action: 'video:frame',
    //         // payload: {
    //         //     droneId: drone,
    //         //     telemetry: {
    //         //         latitude: 10.76315, // ~60–70m north of center
    //         //         longitude: 106.66542, // ~70m east of center
    //         //         altitude: 48.6, // meters AGL
    //         //         heading: 132.4, // degrees (SE direction)
    //         //         speed: 11.8, // m/s (~42 km/h)
    //         //         battery: 67, // percent
    //         //     },
    //         // },
    //     };
    //     console.log('video frame')
    //     send(message);
    // };
    // setInterval(() => {
    //     testSend();
    // }, 1000);

    /* =============================
     * INIT VIDEO + JMUXER
     * =============================*/
    useEffect(() => {
        const droneId = import.meta.env.VITE_DJI_MINI_3_PRO_ID;
        const payload = {
            droneId,
            command: 'start_video_stream',
            timestamp: new Date().toISOString(),
        };

        const message = {
            action: 'drone:command',
            payload,
        };

        send(message);

        if (!videoRef.current || jmuxerRef.current) return;

        const video = videoRef.current;

        video.autoplay = autoPlay;
        video.muted = muted;
        video.playsInline = true;
        video.controls = false;

        jmuxerRef.current = new JMuxer({
            node: video,
            mode: 'video',
            fps,
            flushingTime: 0,
            clearBuffer: false,
            debug: false,
        });

        video.addEventListener('error', () => {
            console.error('Video error:', video.error);
        });

        video.addEventListener('loadedmetadata', () => {
            console.log('✅ metadata loaded', {
                width: video.videoWidth,
                height: video.videoHeight,
            });
        });

        video.addEventListener('canplay', () => {
            console.log('✅ canplay — browser has enough data');
        });

        video.addEventListener('playing', () => {
            console.log('▶️ playing');
        });

        video.addEventListener('waiting', () => {
            console.warn('⏳ buffering');
        });

        video.addEventListener('error', () => {
            console.error('❌ video error', video.error);
        });

        return () => {
            jmuxerRef.current?.destroy?.();
            jmuxerRef.current = null;
        };
    }, [autoPlay, muted, fps]);

    /* =============================
     * SOCKET → FRAME HANDLER
     * =============================*/
    useEffect(() => {
        if (!isConnected) return;

        const handleFrame = (data: any) => {
            frameCountRef.current++;

            if (!jmuxerRef.current) return;

            try {
                let buffer: ArrayBuffer;

                // base64 (your current server format)
                if (typeof data === 'string') {
                    const binary = atob(data);
                    const bytes = new Uint8Array(binary.length);
                    for (let i = 0; i < binary.length; i++) {
                        bytes[i] = binary.charCodeAt(i);
                    }
                    buffer = bytes.buffer;
                }
                // Uint8Array
                else if (data instanceof Uint8Array) {
                    buffer = data.buffer;
                }
                // ArrayBuffer
                else if (data instanceof ArrayBuffer) {
                    buffer = data;
                }
                // Blob
                else if (data instanceof Blob) {
                    data.arrayBuffer().then(ab => {
                        jmuxerRef.current?.feed({ video: new Uint8Array(ab) });
                    });
                    return;
                } else {
                    return;
                }

                const nal = new Uint8Array(buffer);

                // basic H.264 sanity check (start code)
                if (nal[0] !== 0x00 || nal[1] !== 0x00 || (nal[2] !== 0x00 && nal[2] !== 0x01)) {
                    return;
                }

                jmuxerRef.current.feed({ video: nal });
            } catch (err) {
                console.error('Frame error:', err);
            }
        };

        subscribe('video:frame', handleFrame);

        return () => {
            subscribe('video:frame', handleFrame);
        };
    }, [connectionState]);

    /* =============================
     * UI
     * =============================*/
    return (
        <Card className="w-full h-full p-0">
            <video ref={videoRef} className="bg-black rounded-md" />
        </Card>
    );
}
