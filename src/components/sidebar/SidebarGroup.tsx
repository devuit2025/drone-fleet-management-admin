import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAdminLayout } from '@/contexts/AdminLayoutContext';

interface SidebarGroupProps {
    icon: React.ReactNode;
    label: string;
    collapsed: boolean;
    items: { label: string; href: string }[];
}

export function SidebarGroup({ icon, label, collapsed, items }: SidebarGroupProps) {
    const { isActive } = useAdminLayout();
    const [open, setOpen] = useState(false);

    // Determine if any child is active
    const hasActiveChild = items.some(item => isActive(item.href));

    // Auto-open group when a child becomes active
    useEffect(() => {
        if (hasActiveChild) setOpen(true);
    }, [hasActiveChild]);

    return (
        <div className="flex flex-col">
            {/* Group header */}
            <Button
                variant="ghost"
                onClick={() => setOpen(prev => !prev)}
                className={cn(
                    'w-full justify-start transition-colors',
                    collapsed ? 'px-2' : 'px-3',
                    hasActiveChild
                        ? // 🔹 Active state (no hover override)
                          'bg-blue-100 dark:bg-blue-800/50 text-blue-700 dark:text-blue-300 font-medium hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-800/50 dark:hover:text-blue-300'
                        : // 🔹 Normal state (hover applies)
                          'hover:bg-accent hover:text-accent-foreground',
                )}
            >
                {icon}
                {!collapsed && (
                    <>
                        <span className="ml-3 flex-1 text-left">{label}</span>
                        <ChevronRight
                            className={cn(
                                'h-4 w-4 transition-transform',
                                (open || hasActiveChild) && 'rotate-90',
                            )}
                        />
                    </>
                )}
            </Button>

            {/* Animated child list */}
            <AnimatePresence initial={false}>
                {open && !collapsed && (
                    <motion.ul
                        className="ml-10 mt-1 space-y-1"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {items.map(item => {
                            const active = isActive(item.href);

                            return (
                                <li key={item.href}>
                                    <Button
                                        asChild
                                        variant="ghost"
                                        className={cn(
                                            'w-full justify-start text-sm font-normal transition-colors',
                                            active
                                                ? 'bg-blue-100 text-blue-700 font-medium pointer-events-none'
                                                : 'hover:bg-accent hover:text-accent-foreground',
                                        )}
                                    >
                                        <Link to={item.href}>{item.label}</Link>
                                    </Button>
                                </li>
                            );
                        })}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
}
