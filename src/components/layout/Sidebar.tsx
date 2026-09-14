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

function NavRow({ label, to, icon: Icon }: NavItem) {
  return (
    <NavLink
      to={to}
      aria-label={label}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
        )
      }
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      {label}
    </NavLink>
  )
}

export function Sidebar() {
  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary">
          <BarChart3 className="size-4 text-sidebar-primary-foreground" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-medium leading-none text-sidebar-foreground">CRM</p>
          <p className="mt-1 text-xs text-muted-foreground">Customer Intelligence</p>
        </div>
      </div>

      <nav aria-label="Main" className="flex flex-1 flex-col gap-1 px-3">
        {mainNav.map((item) => (
          <NavRow key={item.to} {...item} />
        ))}
      </nav>

      <nav
        aria-label="Secondary"
        className="flex flex-col gap-1 border-t border-sidebar-border px-3 py-3"
      >
        {bottomNav.map((item) => (
          <NavRow key={item.to} {...item} />
        ))}
      </nav>
    </aside>
  )
}