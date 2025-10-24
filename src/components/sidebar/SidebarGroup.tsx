import { useState } from 'react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarGroupProps {
    icon: React.ReactNode;
    label: string;
    collapsed: boolean;
    items: { label: string; href: string }[];
}

export function SidebarGroup({ icon, label, collapsed, items }: SidebarGroupProps) {
    const [open, setOpen] = useState(false);

    return (
        <div className="flex flex-col">
            <Button
                variant="ghost"
                onClick={() => setOpen(!open)}
                className={cn(
                    'w-full justify-start hover:bg-accent hover:text-accent-foreground transition-colors',
                    collapsed ? 'px-2' : 'px-3',
                )}
            >
                {icon}
                {!collapsed && (
                    <>
                        <span className="ml-3 flex-1 text-left">{label}</span>
                        <ChevronRight
                            className={cn('h-4 w-4 transition-transform', open && 'rotate-90')}
                        />
                    </>
                )}
            </Button>

            <AnimatePresence initial={false}>
                {open && !collapsed && (
                    <motion.ul
                        className="ml-10 mt-1 space-y-1"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {items.map(item => (
                            <li key={item.href}>
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        'w-full justify-start text-sm font-normal transition-colors',
                                        // Hover blue for sub-items
                                        'hover:bg-accent hover:text-accent-foreground',
                                        // Active item highlight
                                        item.active &&
                                            'bg-blue-100 dark:bg-blue-800/50 text-blue-700 dark:text-blue-300 font-medium',
                                    )}
                                >
                                    {item.label}
                                </Button>
                            </li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
}
