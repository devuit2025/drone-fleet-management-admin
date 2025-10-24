// Header.tsx
import { Bell, Menu, PanelLeft, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAdminLayout } from '@/contexts/AdminLayoutContext';
import { cn } from '@/lib/utils';

export function Header() {
    const { toggleCollapse } = useAdminLayout();

    return (
        <header className="flex items-center justify-between px-6 py-3  bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-0">
                <button
                    onClick={toggleCollapse}
                    data-slot="sidebar-trigger"
                    className={cn(
                        // Layout & size
                        'inline-flex items-center justify-center gap-2 size-7 rounded-md text-sm font-medium transition-all',
                        'max-md:scale-125 shrink-0',

                        // SVG handling
                        "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",

                        // State & interaction
                        'disabled:pointer-events-none disabled:opacity-50',
                        'hover:bg-accent hover:text-accent-foreground',
                        'dark:hover:bg-input/50',

                        // Base style
                        'border bg-background shadow-xs dark:bg-input/30 dark:border-input',

                        // Focus & accessibility
                        'outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring',
                        'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',

                        'mr-5',
                    )}
                >
                    <PanelLeft aria-hidden="true" />
                    <span className="sr-only">Toggle Sidebar</span>
                </button>

                <div className="flex items-center gap-2 w-full max-w-xs border-l border-gray-200 dark:border-blue-800 pl-3">
                    {/* Label */}
                    <a href="/dashboard/overview" className="text-sm font-medium">
                        Search
                    </a>

                    {/* Input with icon */}
                    <div className="relative flex-1">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none w-4 h-4" />
                        <Input
                            placeholder="Drones, missions,..."
                            className="h-8 text-sm pl-7 pr-2 rounded-md"
                        />
                    </div>
                </div>
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
