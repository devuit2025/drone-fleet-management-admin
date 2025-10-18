// Dashboard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard Overview</h1>
      <Separator />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {["Users", "Orders", "Revenue", "Performance"].map((title) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">1,234</p>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>
        ))}
      </div>

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
  )
}
