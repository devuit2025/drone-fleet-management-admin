import { useEffect, useRef, useState, useCallback } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useWebSocket } from '@/providers/WebSocketProvider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Wifi, WifiOff, AlertCircle, Play, Square, PlaneTakeoff, PlaneLanding } from 'lucide-react';
import type { DroneTelemetry } from '@/pages/monitoring/MapView';

// Declare jmuxer type for TypeScript
declare global {
    interface Window {
        JMuxer: any;
    }
}

interface VideoStreamModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    droneId: string;
    droneTelemetry?: DroneTelemetry;
}

export default function VideoStreamModal({
    open,
    onOpenChange,
    droneId,
    droneTelemetry,
}: VideoStreamModalProps) {
    const { subscribe, unsubscribe, send, isConnected, connectionState } = useWebSocket();
    const videoRef = useRef<HTMLVideoElement>(null);
    const jmuxerRef = useRef<any>(null);
    const frameCountRef = useRef(0);
    const [isStreaming, setIsStreaming] = useState(false);
    const [frameCount, setFrameCount] = useState(0);
    const [telemetry, setTelemetry] = useState<DroneTelemetry | undefined>(droneTelemetry);
    const [hasReceivedFrames, setHasReceivedFrames] = useState(false);
    const [jmuxerReady, setJmuxerReady] = useState(false);
    const [jmuxerInitialized, setJmuxerInitialized] = useState(false);

    // Load jmuxer from CDN
    useEffect(() => {
        if (typeof window === 'undefined') return;

        if (window.JMuxer) {
            setJmuxerReady(true);
            return;
        }

        const existing = document.querySelector<HTMLScriptElement>('script[data-jmuxer]');
        if (existing) {
            // Nếu script đã được inject nhưng chưa load xong, chờ onload
            existing.addEventListener('load', () => setJmuxerReady(true), { once: true });
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/jmuxer@2.1.0/dist/jmuxer.min.js';
        script.async = true;
        script.dataset.jmuxer = 'true';
        script.onload = () => {
            console.log('[VideoStream] JMuxer loaded');
            setJmuxerReady(true);
        };
        script.onerror = (e) => {
            console.error('[VideoStream] Failed to load JMuxer script', e);
        };
        document.head.appendChild(script);
    }, []);

    // Initialize video player with jmuxer
    useEffect(() => {
        if (!open || !jmuxerReady || !videoRef.current || !window.JMuxer) return;

        const video = videoRef.current;
        video.autoplay = true;
        video.muted = true;
        video.playsInline = true;

        // Add video event listeners (giống sample_connect_websocket.html)
        const handleLoadedMetadata = () => {
            console.log(`[VideoStream] Video metadata loaded: ${video.videoWidth}x${video.videoHeight}`);
        };
        
        const handleCanPlay = () => {
            console.log('[VideoStream] Video can play');
            video.play().then(() => {
                console.log('[VideoStream] Video playing started');
            }).catch((e: any) => {
                console.warn('[VideoStream] Autoplay blocked:', e.message);
            });
        };
        
        const handlePlay = () => {
            console.log('[VideoStream] Video is playing');
        };
        
        const handleError = () => {
            console.error('[VideoStream] Video element error:', video.error?.message || 'Unknown error');
        };

        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('canplay', handleCanPlay);
        video.addEventListener('play', handlePlay);
        video.addEventListener('error', handleError);

        // Initialize jmuxer (giống sample_connect_websocket.html)
        jmuxerRef.current = new window.JMuxer({
            node: video,
            mode: 'video',
            flushingTime: 0,
            clearBuffer: false,
            fps: 30,
            debug: true, // Enable debug như sample
        });

        // Mark jmuxer as initialized
        setJmuxerInitialized(true);
        console.log('[VideoStream] Video player initialized with jmuxer');

        // Listen to jmuxer events (giống sample_connect_websocket.html)
        if (jmuxerRef.current && typeof jmuxerRef.current.on === 'function') {
            jmuxerRef.current.on('ready', () => {
                console.log('[VideoStream] jmuxer ready - video should start playing');
                setTimeout(() => {
                    if (video.src) {
                        console.log(`[VideoStream] Video src set: ${video.src.substring(0, 50)}...`);
                    } else {
                        console.warn('[VideoStream] Video src not set by jmuxer');
                    }
                }, 100);
            });
            
            jmuxerRef.current.on('error', (error: any) => {
                console.error('[VideoStream] jmuxer error:', error);
            });
        }

        return () => {
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('canplay', handleCanPlay);
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('error', handleError);
            
            if (jmuxerRef.current) {
                try {
                    jmuxerRef.current.destroy();
                } catch (e) {
                    console.error('[VideoStream] Error destroying jmuxer:', e);
                }
                jmuxerRef.current = null;
            }
            
            // Reset initialized state
            setJmuxerInitialized(false);
        };
    }, [open, jmuxerReady]);

    // Join/leave drone room when modal opens/closes
    useEffect(() => {
        if (!open) {
            // Stop stream when modal closes (nếu đang streaming)
            if (isStreaming) {
                send({
                    action: 'drone:command',
                    payload: {
                        droneId,
                        command: 'stop_video_stream',
                        timestamp: new Date().toISOString(),
                    },
                });
            }
            setIsStreaming(false);
            frameCountRef.current = 0;
            setFrameCount(0);
            setHasReceivedFrames(false);
            setJmuxerInitialized(false);
            return;
        }

        // Chỉ join drone room khi modal mở (để nhận telemetry)
        // KHÔNG tự động start stream - user phải click nút Start Stream
        send({
            action: 'join:drone',
            payload: { droneId },
        });
    }, [open, droneId, isStreaming]); // Removed 'send' from dependencies - it's memoized

    // Subscribe to video frames
    const handleVideoFrame = useCallback((data: string) => {
        try {
            console.log('[VideoStream] Frame received, data type:', typeof data, 'length:', data?.length);
            setHasReceivedFrames(true);
            
            if (!data) {
                console.warn('[VideoStream] Empty frame data');
                return;
            }

            if (!jmuxerRef.current) {
                console.warn('[VideoStream] JMuxer instance is null, dropping frame. This should not happen if subscribe is called correctly.');
                return;
            }

            // Decode base64 to Uint8Array (giống sample_connect_websocket.html)
            const binaryString = atob(data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            // Check if frame is all zeros (corrupted)
            const firstBytes = bytes.slice(0, 10);
            if (firstBytes.every(b => b === 0)) {
                console.warn('[VideoStream] Received all-zero frame, skipping');
                return;
            }

            // Validate H.264 format (giống sample_connect_websocket.html)
            const isValidH264 = (firstBytes[0] === 0 && firstBytes[1] === 0 && 
                                ((firstBytes[2] === 0 && firstBytes[3] === 1) || firstBytes[2] === 1));
            
            if (frameCountRef.current === 0) {
                console.log('[VideoStream] First 10 bytes:', Array.from(firstBytes).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '));
                console.log('[VideoStream] Is valid H.264:', isValidH264);
                console.log('[VideoStream] Data size:', bytes.length);
            }

            if (!isValidH264 && frameCountRef.current < 3) {
                console.warn('[VideoStream] Data does not look like H.264 NAL unit. First bytes:', 
                    Array.from(firstBytes).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '));
                // Vẫn feed để xem có hoạt động không
            }

            // Feed to jmuxer với Uint8Array (giống sample_connect_websocket.html)
            if (jmuxerRef.current) {
                try {
                    // jmuxer expects { video: Uint8Array } hoặc { video: ArrayBuffer }
                    // Sample dùng Uint8Array nên ta cũng dùng Uint8Array
                    jmuxerRef.current.feed({
                        video: bytes, // Dùng Uint8Array thay vì bytes.buffer
                    });

                    if (frameCountRef.current === 0) {
                        console.log(`[VideoStream] First frame fed to jmuxer (${bytes.length} bytes)`);
                        
                        // Check video state after first frame (giống sample)
                        setTimeout(() => {
                            const video = videoRef.current;
                            if (video) {
                                console.log(`[VideoStream] Video state: readyState=${video.readyState}, paused=${video.paused}, currentTime=${video.currentTime}`);
                                if (video.readyState >= 2) {
                                    console.log('[VideoStream] Video has enough data to play');
                                }
                            }
                        }, 500);
                    }

                    // Đảm bảo video bắt đầu play sau khi có frame đầu tiên
                    if (videoRef.current && videoRef.current.paused) {
                        const playPromise = videoRef.current.play();
                        if (playPromise && typeof playPromise.then === 'function') {
                            playPromise.catch((err: any) => {
                                console.warn('[VideoStream] video.play() failed:', err);
                            });
                        }
                    }

                    frameCountRef.current++;
                    if (frameCountRef.current % 30 === 0) {
                        setFrameCount(frameCountRef.current);
                        console.log('[VideoStream] Frame count:', frameCountRef.current);
                        
                        // Log video state periodically (giống sample)
                        const video = videoRef.current;
                        if (video) {
                            console.log(`[VideoStream] Frame #${frameCountRef.current}: readyState=${video.readyState}, paused=${video.paused}`);
                        }
                    }
                } catch (e) {
                    console.error('[VideoStream] Error feeding to jmuxer:', e);
                }
            }
        } catch (e) {
            console.error('[VideoStream] Error processing frame:', e);
        }
    }, []);

    useEffect(() => {
        // Chỉ subscribe khi modal mở, JMuxer script đã load VÀ instance đã được init xong
        if (!open || !jmuxerReady || !jmuxerInitialized) return;

        console.log('[VideoStream] Subscribing to video:frame event for drone:', droneId, 'jmuxer initialized:', jmuxerInitialized);
        subscribe('video:frame', handleVideoFrame);

        return () => {
            console.log('[VideoStream] Unsubscribing from video:frame event');
            unsubscribe('video:frame', handleVideoFrame);
        };
    }, [open, jmuxerReady, jmuxerInitialized, droneId, subscribe, unsubscribe, handleVideoFrame]);

    // Subscribe to telemetry updates từ drone:location_updated (giống EnhancedMonitoringMap)
    const handleLocationUpdate = useCallback((data: { droneId: string; location: any }) => {
        if (data.droneId === droneId && data.location) {
            const loc = data.location;
            setTelemetry(prev => ({
                ...prev,
                id: droneId,
                lat: loc.latitude ?? loc.lat ?? prev?.lat ?? 0,
                lon: loc.longitude ?? loc.lon ?? prev?.lon ?? 0,
                altitude: loc.altitude ?? prev?.altitude,
                heading: loc.heading ?? prev?.heading,
                speed: loc.speed ?? prev?.speed,
                battery: loc.battery ?? prev?.battery,
                timestamp: Date.now(),
            }));
        }
    }, [droneId]);

    // Subscribe to telemetry:data (fallback nếu có)
    const handleTelemetryData = useCallback((data: { droneId: string; telemetry: any } | any) => {
        // Handle cả 2 formats: { droneId, telemetry } hoặc telemetry trực tiếp
        let telemetry: any;
        let targetDroneId: string;

        if (data && typeof data === 'object') {
            if (data.droneId && data.telemetry) {
                // Format: { droneId: string, telemetry: any }
                targetDroneId = data.droneId;
                telemetry = data.telemetry;
            } else if (data.latitude !== undefined || data.lat !== undefined) {
                // Format: telemetry trực tiếp
                targetDroneId = droneId;
                telemetry = data;
            } else {
                return; // Unknown format
            }
        } else {
            return; // Invalid data
        }

        if (targetDroneId === droneId && telemetry) {
            setTelemetry(prev => ({
                ...prev,
                id: droneId,
                lat: telemetry.latitude ?? telemetry.lat ?? prev?.lat ?? 0,
                lon: telemetry.longitude ?? telemetry.lon ?? prev?.lon ?? 0,
                altitude: telemetry.altitude_m ?? telemetry.altitude ?? prev?.altitude,
                heading: telemetry.heading_deg ?? telemetry.heading ?? prev?.heading,
                speed: telemetry.speed_mps ?? telemetry.speed ?? prev?.speed,
                battery: telemetry.battery_percent ?? telemetry.battery ?? prev?.battery,
                timestamp: Date.now(),
            }));
        }
    }, [droneId]);

    useEffect(() => {
        if (!open) return;

        // Subscribe cả 2 events để nhận telemetry từ nhiều nguồn
        subscribe('drone:location_updated', handleLocationUpdate);
        subscribe('telemetry:data', handleTelemetryData);

        return () => {
            unsubscribe('drone:location_updated', handleLocationUpdate);
            unsubscribe('telemetry:data', handleTelemetryData);
        };
    }, [open, droneId, subscribe, unsubscribe, handleLocationUpdate, handleTelemetryData]);

    const handleStartStream = () => {
        // Reset counters khi start stream mới
        frameCountRef.current = 0;
        setFrameCount(0);
        setHasReceivedFrames(false);
        
        send({
            action: 'drone:command',
            payload: {
                droneId,
                command: 'start_video_stream',
                timestamp: new Date().toISOString(),
            },
        });
        setIsStreaming(true);
    };

    const handleStopStream = () => {
        send({
            action: 'drone:command',
            payload: {
                droneId,
                command: 'stop_video_stream',
                timestamp: new Date().toISOString(),
            },
        });
        setIsStreaming(false);
        frameCountRef.current = 0;
        setFrameCount(0);
        setHasReceivedFrames(false);
    };

    const handleTakeoff = () => {
        send({
            action: 'drone:command',
            payload: {
                droneId,
                command: 'takeoff',
                timestamp: new Date().toISOString(),
            },
        });
    };

    const handleLand = () => {
        send({
            action: 'drone:command',
            payload: {
                droneId,
                command: 'land',
                timestamp: new Date().toISOString(),
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl w-full">
                <DialogHeader>
                    <DialogTitle>Video Stream - Drone {droneId}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Connection Status Alert */}
                    {connectionState === 'error' && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Không thể kết nối đến WebSocket server. Vui lòng kiểm tra:
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                    <li>Server WebSocket đã được bật chưa?</li>
                                    <li>URL kết nối có đúng không? (kiểm tra VITE_WS_URL trong .env)</li>
                                    <li>Firewall/network có chặn kết nối không?</li>
                                </ul>
                            </AlertDescription>
                        </Alert>
                    )}

                    {connectionState === 'connecting' && (
                        <Alert>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <AlertDescription>
                                Đang kết nối đến WebSocket server...
                            </AlertDescription>
                        </Alert>
                    )}

                    {connectionState === 'connected' && !hasReceivedFrames && (
                        <Alert>
                            <Wifi className="h-4 w-4" />
                            <AlertDescription>
                                Đã kết nối. Đang chờ video stream từ drone...
                            </AlertDescription>
                        </Alert>
                    )}

                    {connectionState === 'disconnected' && (
                        <Alert variant="destructive">
                            <WifiOff className="h-4 w-4" />
                            <AlertDescription>
                                Mất kết nối. Đang thử kết nối lại...
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Video Player */}
                    <div className="relative bg-black rounded-lg overflow-hidden min-h-[300px] flex items-center justify-center">
                        <video
                            ref={videoRef}
                            className="w-full h-auto max-h-[60vh]"
                            controls
                            playsInline
                        />
                        {(!isConnected || !hasReceivedFrames) && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white">
                                {connectionState === 'connecting' && (
                                    <>
                                        <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                        <div className="text-lg font-medium">Đang kết nối...</div>
                                        <div className="text-sm text-gray-300 mt-1">
                                            Đang thiết lập kết nối WebSocket
                                        </div>
                                    </>
                                )}
                                {connectionState === 'connected' && !hasReceivedFrames && (
                                    <>
                                        <Wifi className="w-8 h-8 mb-2" />
                                        <div className="text-lg font-medium">Đã kết nối</div>
                                        <div className="text-sm text-gray-300 mt-1">
                                            Đang chờ video stream từ drone {droneId}
                                        </div>
                                    </>
                                )}
                                {connectionState === 'error' && (
                                    <>
                                        <AlertCircle className="w-8 h-8 mb-2" />
                                        <div className="text-lg font-medium">Lỗi kết nối</div>
                                        <div className="text-sm text-gray-300 mt-1">
                                            Không thể kết nối đến server
                                        </div>
                                    </>
                                )}
                                {connectionState === 'disconnected' && (
                                    <>
                                        <WifiOff className="w-8 h-8 mb-2" />
                                        <div className="text-lg font-medium">Mất kết nối</div>
                                        <div className="text-sm text-gray-300 mt-1">
                                            Đang thử kết nối lại...
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Telemetry Info */}
                    <Card>
                        <CardContent className="pt-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <div className="text-muted-foreground">Location</div>
                                    <div className="font-medium">
                                        {typeof telemetry?.lat === 'number' ? telemetry.lat.toFixed(6) : '-'}, {typeof telemetry?.lon === 'number' ? telemetry.lon.toFixed(6) : '-'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Altitude</div>
                                    <div className="font-medium">
                                        {typeof telemetry?.altitude === 'number' ? telemetry.altitude.toFixed(2) : '-'} m
                                    </div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Speed</div>
                                    <div className="font-medium">
                                        {typeof telemetry?.speed === 'number' ? telemetry.speed.toFixed(2) : '-'} m/s
                                    </div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Battery</div>
                                    <div className="font-medium">
                                        {telemetry?.battery ?? '-'}%
                                    </div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Heading</div>
                                    <div className="font-medium">
                                        {typeof telemetry?.heading === 'number' ? telemetry.heading.toFixed(1) : '-'}°
                                    </div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Frames</div>
                                    <div className="font-medium">{frameCount}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Status</div>
                                    <div className="font-medium">
                                        {isStreaming ? (
                                            <span className="text-green-600">Streaming</span>
                                        ) : (
                                            <span className="text-gray-500">Disconnected</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Controls */}
                    <div className="flex flex-wrap justify-between gap-2">
                        <div className="flex gap-2">
                            {/* Video Stream Controls */}
                            {isStreaming ? (
                                <Button 
                                    variant="destructive" 
                                    onClick={handleStopStream}
                                    className="flex items-center gap-2"
                                >
                                    <Square className="w-4 h-4" />
                                    Stop Stream
                                </Button>
                            ) : (
                                <Button 
                                    variant="default" 
                                    onClick={handleStartStream}
                                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                                >
                                    <Play className="w-4 h-4" />
                                    Start Stream
                                </Button>
                            )}
                            
                            {/* Drone Control */}
                            <Button 
                                variant="default" 
                                onClick={handleTakeoff}
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                            >
                                <PlaneTakeoff className="w-4 h-4" />
                                Takeoff
                            </Button>
                            
                            <Button 
                                variant="destructive" 
                                onClick={handleLand}
                                className="flex items-center gap-2"
                            >
                                <PlaneLanding className="w-4 h-4" />
                                Land
                            </Button>
                        </div>
                        
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Close
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

