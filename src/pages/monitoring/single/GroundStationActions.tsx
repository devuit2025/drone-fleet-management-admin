import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Settings, Pause } from 'lucide-react';

export default function GroundStationActions() {
    return (
        <div className="absolute top-4 right-4 pointer-events-auto">
            <Card className="w-64 bg-white/20 backdrop-blur shadow-xl border border-white/25 rounded-xl transition-all hover:scale-105">
                <CardContent className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline">
                        <Play className="h-4 w-4 mr-1" /> Start
                    </Button>
                    <Button size="sm" variant="outline">
                        <Pause className="h-4 w-4 mr-1" /> Pause
                    </Button>
                    <Button size="sm" variant="outline">
                        <Settings className="h-4 w-4 mr-1" /> Config
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
