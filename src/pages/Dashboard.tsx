// Dashboard.tsx
import { DashboardSummaryCards } from '@/components/dashboard/DashboardSummaryCards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function Dashboard() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard Overview</h1>
            <Separator />

            <DashboardSummaryCards />

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
