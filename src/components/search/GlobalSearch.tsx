import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, X, ExternalLink, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import {
    searchAll,
    getSearchCounts,
    type GlobalSearchResult,
    type SearchCounts,
} from '@/api/search/searchEndpoint';

const ENTITY_ROUTES: Record<string, string> = {
    drone: '/drones',
    user: '/users',
    pilot: '/pilots',
    mission: '/missions',
};

const ENTITY_LABELS: Record<string, string> = {
    drone: 'Drones',
    user: 'Users',
    pilot: 'Pilots',
    mission: 'Missions',
};

const ENTITY_ICONS: Record<string, string> = {
    drone: '🚁',
    user: '👤',
    pilot: '✈️',
    mission: '📋',
};

export function GlobalSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<GlobalSearchResult[]>([]);
    const [counts, setCounts] = useState<SearchCounts>({});
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    // Debounce search
    useEffect(() => {
        if (!query.trim() || query.trim().length < 2) {
            setResults([]);
            setCounts({});
            setLoading(false);
            return;
        }

        setLoading(true);
        const timeoutId = setTimeout(() => {
            performSearch(query.trim());
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query]);

    const performSearch = async (searchTerm: string) => {
        try {
            const [resultsData, countsData] = await Promise.all([
                searchAll(searchTerm, { limit: 5 }),
                getSearchCounts(searchTerm),
            ]);

            // Axios interceptor returns data directly
            setResults(Array.isArray(resultsData) ? resultsData : []);
            setCounts(countsData || {});
        } catch (error) {
            console.error('Search error:', error);
            setResults([]);
            setCounts({});
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (result: GlobalSearchResult) => {
        const route = ENTITY_ROUTES[result.type];
        if (route) {
            navigate(`${route}/${result.id}`);
            setOpen(false);
            setQuery('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!open || results.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
        } else if (e.key === 'Enter' && results[selectedIndex]) {
            e.preventDefault();
            handleSelect(results[selectedIndex]);
        } else if (e.key === 'Escape') {
            setOpen(false);
            setQuery('');
        }
    };

    const groupedResults = results.reduce(
        (acc, result) => {
            if (!acc[result.type]) {
                acc[result.type] = [];
            }
            acc[result.type].push(result);
            return acc;
        },
        {} as Record<string, GlobalSearchResult[]>,
    );

    const totalResults = Object.values(counts).reduce((sum, count) => sum + count, 0);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <div className="relative flex-1">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none w-4 h-4" />
                    <Input
                        ref={inputRef}
                        placeholder="Search drones, users, missions..."
                        className="h-8 text-sm pl-7 pr-2 rounded-md"
                        value={query}
                        onChange={e => {
                            setQuery(e.target.value);
                            setOpen(true);
                            setSelectedIndex(0);
                        }}
                        onFocus={() => {
                            if (query.trim().length >= 2) {
                                setOpen(true);
                            }
                        }}
                        onKeyDown={handleKeyDown}
                    />
                    {query && (
                        <button
                            onClick={e => {
                                e.stopPropagation();
                                setQuery('');
                                setResults([]);
                                setCounts({});
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </PopoverTrigger>
            <PopoverContent
                className="w-[600px] p-0"
                align="start"
                onOpenAutoFocus={e => e.preventDefault()}
            >
                {query.trim().length < 2 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                        Type at least 2 characters to search...
                    </div>
                ) : loading ? (
                    <div className="p-8 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                        <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
                    </div>
                ) : results.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-sm font-medium">No results found</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Try a different search term
                        </p>
                    </div>
                ) : (
                    <div className="max-h-[500px] overflow-y-auto">
                        {/* Summary */}
                        <div className="px-4 py-2 border-b bg-muted/50">
                            <p className="text-xs text-muted-foreground">
                                Found{' '}
                                <span className="font-medium text-foreground">{totalResults}</span>{' '}
                                {totalResults === 1 ? 'result' : 'results'} across{' '}
                                {Object.keys(counts).filter(k => counts[k] > 0).length} {''}
                                {Object.keys(counts).filter(k => counts[k] > 0).length === 1
                                    ? 'category'
                                    : 'categories'}
                            </p>
                        </div>

                        {/* Results grouped by type */}
                        {Object.entries(groupedResults).map(([type, items]) => (
                            <div key={type} className="border-b last:border-b-0">
                                <div className="px-4 py-2 bg-muted/30">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm">
                                                {ENTITY_ICONS[type] || '📄'}
                                            </span>
                                            <span className="text-sm font-medium">
                                                {ENTITY_LABELS[type] || type}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                ({counts[type] || items.length}
                                                {counts[type] > items.length ? '+' : ''})
                                            </span>
                                        </div>
                                        {counts[type] > items.length && (
                                            <button
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    navigate(
                                                        `${ENTITY_ROUTES[type]}?global=${encodeURIComponent(query)}`,
                                                    );
                                                    setOpen(false);
                                                }}
                                                className="text-xs text-primary hover:underline flex items-center gap-1"
                                            >
                                                View all
                                                <ExternalLink className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="py-1">
                                    {items.map((result, idx) => {
                                        const globalIndex = results.indexOf(result);
                                        const isSelected = globalIndex === selectedIndex;

                                        return (
                                            <button
                                                key={`${result.type}-${result.id}`}
                                                onClick={() => handleSelect(result)}
                                                className={cn(
                                                    'w-full px-4 py-2.5 text-left hover:bg-accent transition-colors',
                                                    isSelected && 'bg-accent',
                                                )}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">
                                                            {result.title}
                                                        </p>
                                                        {result.subtitle && (
                                                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                                                                {result.subtitle}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        {/* View all results link */}
                        {totalResults > results.length && (
                            <div className="px-4 py-3 border-t bg-muted/30">
                                <button
                                    onClick={e => {
                                        e.stopPropagation();
                                        navigate(`/search?q=${encodeURIComponent(query)}`);
                                        setOpen(false);
                                    }}
                                    className="text-sm text-primary hover:underline flex items-center justify-center gap-2 w-full"
                                >
                                    View all {totalResults} results
                                    <ExternalLink className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
