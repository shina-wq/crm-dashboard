import { useState } from "react"
import { Link } from "react-router-dom"
import {
  Search,
  Bell,
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
import { useTheme } from "@/hooks/use-theme"

// TODO: replace with real analyst session once auth is built
const currentUser = { name: "Jane Doe", role: "Analyst", initials: "JD" }

export function Header() {
  const [theme, toggleTheme] = useTheme()
  const [hasUnread] = useState(true) // TODO: wire to real notifications

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border bg-background px-6">
      <InputGroup className="max-w-md">
        <InputGroupAddon>
          <Search className="size-4" aria-hidden="true" />
        </InputGroupAddon>
        <InputGroupInput placeholder="Search customers, products, or anything..." />
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
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>

        <Button variant="ghost" size="icon-sm" aria-label="Notifications" className="relative">
          <Bell className="size-4" />
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
                {currentUser.initials}
              </span>
              <span className="text-left leading-tight">
                <span className="block font-medium text-foreground">{currentUser.name}</span>
                <span className="block text-xs text-muted-foreground">{currentUser.role}</span>
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
            <DropdownMenuItem variant="destructive" onSelect={() => {/* TODO: wire logout */}}>
              <LogOut className="size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}