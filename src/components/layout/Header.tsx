import { useState } from "react"
import { Link } from "react-router-dom"
import {
  Search,
  Bell,
  PanelLeft,
  Moon,
  Sun,
  ChevronDown,
  LogOut,
  Settings as SettingsIcon,
  User,
} from "lucide-react"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/features/auth/auth-context"
import { useTheme } from "@/hooks/use-theme"

// TODO: replace with real role data. DummyJSON's login response has no role.
const ROLE = "Analyst"

type HeaderProps = {
  sidebarCollapsed: boolean
  onToggleSidebar: () => void
  onOpenMobileNav: () => void
}

export function Header({ onToggleSidebar, onOpenMobileNav }: HeaderProps) {
  const [theme, toggleTheme] = useTheme()
  const { user, signOut } = useAuth()
  const [hasUnread] = useState(true) // TODO: wire to real notifications

  const name = user ? `${user.firstName} ${user.lastName}` : ""
  const initials = user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}` : ""

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border bg-background px-6">
      {/* Below lg: opens the drawer. From lg up: collapses the sidebar. Only one is visible. */}
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Open navigation"
        className="-ml-2 lg:hidden"
        onClick={onOpenMobileNav}
      >
        <PanelLeft className="size-4" aria-hidden="true" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Toggle sidebar"
        aria-controls="sidebar"
        className="-ml-2 max-lg:hidden text-muted-foreground"
        onClick={onToggleSidebar}
      >
        <PanelLeft className="size-4" aria-hidden="true" />
      </Button>

      <InputGroup className="max-w-md">
        <InputGroupAddon>
          <Search className="size-4" aria-hidden="true" />
        </InputGroupAddon>
        <InputGroupInput aria-label="Search" placeholder="Search customers, products, or anything..." />
        <InputGroupAddon align="inline-end">
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
            ⌘K
          </kbd>
        </InputGroupAddon>
      </InputGroup>

      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          onClick={toggleTheme}
        >
          {theme === "dark" ? (
            <Sun className="size-4" aria-hidden="true" />
          ) : (
            <Moon className="size-4" aria-hidden="true" />
          )}
        </Button>

        <Button variant="ghost" size="icon-sm" aria-label="Notifications" className="relative">
          <Bell className="size-4" aria-hidden="true" />
          {hasUnread && (
            <span
              className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-destructive"
              aria-hidden="true"
            />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Account menu"
              className="ml-1 flex items-center gap-2 rounded-md py-1 pl-1 pr-2 text-sm transition-colors hover:bg-muted"
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                {initials}
              </span>
              <span className="text-left leading-tight">
                <span className="block font-medium text-foreground">{name}</span>
                <span className="block text-xs text-muted-foreground">{ROLE}</span>
              </span>
              <ChevronDown className="size-4 text-muted-foreground" aria-hidden="true" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to="/settings">
                <User className="size-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings">
                <SettingsIcon className="size-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={signOut}>
              <LogOut className="size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}