// Header.tsx
import { Bell, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export function Header() {
    return (
        <header className="flex items-center justify-between px-6 py-3  bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-3 w-full max-w-sm">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." className="h-8" />
            </div>

            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon">
                    <Bell className="h-5 w-5" />
                </Button>

                <Avatar className="h-8 w-8">
                    <AvatarImage src="https://i.pravatar.cc/150?img=3" />
                    <AvatarFallback>JD</AvatarFallback>
                </Avatar>
            </div>
        </header>
    );
}
