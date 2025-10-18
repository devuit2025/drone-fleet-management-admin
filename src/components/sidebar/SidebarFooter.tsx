// src/components/sidebar/SidebarFooter.tsx
import { Button } from '@/components/ui/button';
import { Moon, Sun, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface SidebarFooterProps {
    collapsed: boolean;
}

export function SidebarFooter({ collapsed }: SidebarFooterProps) {
    const [open, setOpen] = useState(false);

    return (
        <div
            className={cn(
                'p-4 border-t text-xs text-muted-foreground flex items-center justify-between transition-all',
                collapsed && 'flex-col gap-2 text-center',
            )}
        >
            {/* User Menu */}
            <DropdownMenu open={open} onOpenChange={setOpen}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className={cn(
                            'flex items-center gap-2 w-full justify-start',
                            collapsed && 'justify-center',
                        )}
                    >
                        <Avatar className="h-6 w-6">
                            <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        {!collapsed && <span className="text-sm font-medium">John Doe</span>}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="start">
                    <DropdownMenuLabel>Account</DropdownMenuLabel>
                    <DropdownMenuItem>
                        <User className="h-4 w-4 mr-2" /> Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-500">
                        <LogOut className="h-4 w-4 mr-2" /> Logout
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
