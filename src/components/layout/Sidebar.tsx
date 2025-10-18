import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLocation, Link } from 'react-router-dom';
import { sidebarRoutes } from '@/routes/sidebar-routes';

export function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const [openMenus, setOpenMenus] = useState<string[]>([]);
    const location = useLocation?.();
    const currentPath = location?.pathname ?? '/';

    const toggleMenu = (name: string) => {
        setOpenMenus(prev =>
            prev.includes(name) ? prev.filter(m => m !== name) : [...prev, name],
        );
    };

    return (
        <aside
            className={cn(
                'flex flex-col h-screen bg-background border-r shadow-sm transition-all duration-300',
                collapsed ? 'w-16' : 'w-64',
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                {!collapsed && (
                    <h1 className="text-lg font-semibold tracking-tight">Admin Panel</h1>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCollapsed(!collapsed)}
                    className="text-muted-foreground hover:text-foreground"
                >
                    <Menu className="h-5 w-5" />
                </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-2 space-y-4">
                <TooltipProvider>
                    {sidebarRoutes.map(group => (
                        <div key={group.title}>
                            {!collapsed && group.title && (
                                <h2 className="px-3 text-xs font-semibold text-muted-foreground uppercase mb-2 tracking-wide">
                                    {group.title}
                                </h2>
                            )}

                            <div className="space-y-1">
                                {group.items.map(({ name, icon: Icon, path, children }) => {
                                    const isActive = currentPath === path;
                                    const isOpen = openMenus.includes(name);

                                    const content = (
                                        <Button
                                            variant={isActive ? 'secondary' : 'ghost'}
                                            className={cn(
                                                'w-full justify-start gap-3 text-sm font-medium transition-colors rounded-md',
                                                'hover:bg-accent hover:text-accent-foreground',
                                                collapsed ? 'px-2 justify-center' : 'px-3',
                                            )}
                                            onClick={() =>
                                                children ? toggleMenu(name) : undefined
                                            }
                                            asChild={!children}
                                        >
                                            {children ? (
                                                <div className="flex items-center justify-between w-full">
                                                    <div className="flex items-center gap-3">
                                                        {Icon && (
                                                            <Icon className="h-4 w-4 shrink-0" />
                                                        )}
                                                        {!collapsed && <span>{name}</span>}
                                                    </div>
                                                    {!collapsed &&
                                                        (isOpen ? (
                                                            <ChevronDown className="h-3 w-3" />
                                                        ) : (
                                                            <ChevronRight className="h-3 w-3" />
                                                        ))}
                                                </div>
                                            ) : (
                                                <Link
                                                    to={path ?? '#'}
                                                    className="flex items-center gap-3 w-full"
                                                >
                                                    {Icon && <Icon className="h-4 w-4 shrink-0" />}
                                                    {!collapsed && <span>{name}</span>}
                                                </Link>
                                            )}
                                        </Button>
                                    );

                                    return (
                                        <Tooltip key={name}>
                                            <TooltipTrigger asChild>{content}</TooltipTrigger>
                                            {collapsed && (
                                                <TooltipContent side="right">{name}</TooltipContent>
                                            )}
                                            {!collapsed && children && isOpen && (
                                                <div className="ml-6 mt-1 space-y-1">
                                                    {children.map(sub => (
                                                        <Button
                                                            key={sub.name}
                                                            variant={
                                                                currentPath === sub.path
                                                                    ? 'secondary'
                                                                    : 'ghost'
                                                            }
                                                            asChild
                                                            className="w-full justify-start text-sm pl-4"
                                                        >
                                                            <Link to={sub.path ?? '#'}>
                                                                {sub.name}
                                                            </Link>
                                                        </Button>
                                                    ))}
                                                </div>
                                            )}
                                        </Tooltip>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </TooltipProvider>
            </nav>

            {/* Footer */}
            {!collapsed && (
                <div className="p-4 border-t text-xs text-muted-foreground">© 2025 MyCompany</div>
            )}
        </aside>
    );
}
