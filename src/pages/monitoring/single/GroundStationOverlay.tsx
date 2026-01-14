import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Settings, Camera } from 'lucide-react';
import GroundStationActions from './GroundStationActions';
import { useNavigate } from 'react-router-dom';
import { VideoStreamPlayer } from './camera/VideoStreamPlayer';

export default function GroundStationOverlay() {
    const navigate = useNavigate();
    return (
        <div className="fixed inset-0 pointer-events-none">
            {/* Top-left admin navigation */}
            <div className="absolute top-4 left-4 pointer-events-auto">
                <Button
                    size="sm"
                    variant="outline"
                    onClick={e => {
                        navigate(`/monitoring`);
                        // not handle yet
                        // should go to another route
                    }}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
            </div>

            {/* Top-right ground station actions */}
            <GroundStationActions />

            {/* Bottom-right camera streaming */}
            <div className="absolute bottom-4 right-4 pointer-events-auto">
                <VideoStreamPlayer />

                {/* <Card className="w-64 bg-white/20 backdrop-blur shadow-xl border border-white/25 rounded-xl transition-all hover:scale-105">
                    <CardHeader>
                        <p className="text-sm font-semibold text-white">Camera Streaming</p>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center h-24 bg-black/30 rounded-md">
                        <Camera className="h-6 w-6 text-white" />
                        <span className="ml-2 text-white text-sm">Live Feed</span>
                    </CardContent>
                </Card> */}
            </div>
        </div>
    );
}
