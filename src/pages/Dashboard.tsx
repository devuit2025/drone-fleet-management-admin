import { useTodos } from '@/api/useTodos';
import { DashboardSummaryCards } from '@/components/dashboard/DashboardSummaryCards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useStore } from '@/stores/useStore';

export default function Dashboard() {
    const { count, increase } = useStore();
    const { data, isLoading, error } = useTodos();

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard Overview</h1>
            <Separator />

            <DashboardSummaryCards />

            <Card>
                <div>
                    <p>Count: {count}</p>
                    <button onClick={increase}>Increase</button>
                </div>
            </Card>

           <Card>
            {isLoading ? (
                <p>Loading...</p>
            ) : error ? (
                <p>Error occurred</p>
            ) : (
                <ul>
                {data.map((todo: any) => (
                    <li key={todo.id}>{todo.title}</li>
                ))}
                </ul>
            )}
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                    <ul className="space-y-2">
                        <li>🧾 New order #1024 received</li>
                        <li>👤 User John registered</li>
                        <li>💳 Payment processed for $120</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
