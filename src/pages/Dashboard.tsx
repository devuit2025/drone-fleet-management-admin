import { DashboardSummaryCards } from '@/components/dashboard/DashboardSummaryCards';
import { Separator } from '@/components/ui/separator';

export default function Dashboard() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard Overview</h1>
            <Separator />

            <DashboardSummaryCards />

            <Separator />
        </div>
    );
}
