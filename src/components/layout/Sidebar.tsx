// Sidebar.tsx
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Home, Settings, Users, BarChart, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

const items = [
  { name: "Dashboard", icon: Home },
  { name: "Users", icon: Users },
  { name: "Reports", icon: BarChart },
  { name: "Settings", icon: Settings },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "flex flex-col bg-background border-r transition-all duration-300 shadow-sm",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && <h1 className="text-lg font-semibold tracking-tight">Admin</h1>}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {items.map(({ name, icon: Icon }) => (
          <Button
            key={name}
            variant="ghost"
            className={cn(
              "w-full justify-start gap-2 text-sm font-medium",
              "hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {!collapsed && name}
          </Button>
        ))}
      </nav>

      {!collapsed && (
        <div className="p-4 border-t text-xs text-muted-foreground">
          © 2025 MyCompany
        </div>
      )}
    </aside>
  )
}
