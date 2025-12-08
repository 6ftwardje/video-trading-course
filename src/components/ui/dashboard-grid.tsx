import { ReactNode } from "react"
import { cn } from "@/lib/utils"

type DashboardGridProps = {
  children: ReactNode
  className?: string
}

type DashboardGridItemProps = {
  children: ReactNode
  span?: 1 | 2
  className?: string
}

function DashboardGridItem({ children, span = 1, className }: DashboardGridItemProps) {
  return (
    <div
      className={cn(
        "lg:col-span-1",
        span === 2 && "lg:col-span-2",
        className
      )}
    >
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]/60 p-6 shadow-lg h-full">
        {children}
      </div>
    </div>
  )
}

function DashboardGrid({ children, className }: DashboardGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8",
        className
      )}
    >
      {children}
    </div>
  )
}

// Attach Item as a property of Grid for convenience
DashboardGrid.Item = DashboardGridItem

export { DashboardGrid, DashboardGridItem }

