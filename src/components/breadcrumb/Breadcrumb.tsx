import * as React from "react"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps extends React.HTMLAttributes<HTMLDivElement> {
  items: BreadcrumbItem[]
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav className={cn("flex items-center text-sm text-muted-foreground", className)} aria-label="Breadcrumb">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {item.href ? (
            <a
              href={item.href}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </a>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
          {index < items.length - 1 && (
            <ChevronRight className="mx-2 h-4 w-4 text-muted-foreground" />
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}
