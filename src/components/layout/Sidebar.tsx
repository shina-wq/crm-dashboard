import type { ReactElement } from "react"
import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  Layers,
  Package,
  BarChart3,
  Settings,
  HelpCircle,
  type LucideIcon,
} from "lucide-react"
import { Brand } from "@/components/shared/Brand"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type NavItem = {
  label: string
  to: string
  icon: LucideIcon
}

const mainNav: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Customers", to: "/customers", icon: Users },
  { label: "Segments", to: "/segments", icon: Layers },
  { label: "Products", to: "/products", icon: Package },
  { label: "Analytics", to: "/analytics", icon: BarChart3 },
]

const bottomNav: NavItem[] = [
  { label: "Settings", to: "/settings", icon: Settings },
  { label: "Help", to: "/help", icon: HelpCircle },
]

// Icon-only rows need a tooltip. The label stays in the DOM as sr-only, so the accessible name is kept.
function NavTooltip({
  label,
  show,
  children,
}: {
  label: string
  show: boolean
  children: ReactElement
}) {
  if (!show) return children
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  )
}

type RowProps = NavItem & { collapsed: boolean; onNavigate?: () => void }

function NavRow({ label, to, icon: Icon, collapsed, onNavigate }: RowProps) {
  return (
    <NavTooltip label={label} show={collapsed}>
      <NavLink
        to={to}
        onClick={onNavigate}
        className={({ isActive }) =>
          cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
            isActive
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          )
        }
      >
        <Icon className="size-4 shrink-0" aria-hidden="true" />
        <span className={cn(collapsed && "sr-only")}>{label}</span>
      </NavLink>
    </NavTooltip>
  )
}

type SidebarProps = {
  collapsed?: boolean
  /** Mobile only. Closes the drawer after a link is clicked. */
  onNavigate?: () => void
}

export function Sidebar({ collapsed = false, onNavigate }: SidebarProps) {
  return (
    <div className="flex h-full flex-col">
      <div className={cn("py-5", collapsed ? "px-4" : "px-5")}>
        <Brand compact={collapsed} />
      </div>

      <nav aria-label="Main" className="flex flex-1 flex-col gap-1 px-3">
        {mainNav.map((item) => (
          <NavRow key={item.to} {...item} collapsed={collapsed} onNavigate={onNavigate} />
        ))}
      </nav>

      <nav
        aria-label="Secondary"
        className="flex flex-col gap-1 border-t border-sidebar-border px-3 py-3"
      >
        {bottomNav.map((item) => (
          <NavRow key={item.to} {...item} collapsed={collapsed} onNavigate={onNavigate} />
        ))}
      </nav>
    </div>
  )
}