import { useState } from "react"
import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useSidebarCollapsed } from "@/hooks/use-sidebar-collapsed"
import { cn } from "@/lib/utils"

export function AppShell() {
  const [collapsed, toggleCollapsed] = useSidebarCollapsed()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <TooltipProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <aside
          id="sidebar"
          className={cn(
            "hidden shrink-0 border-r border-sidebar-border bg-sidebar lg:block",
            collapsed ? "w-16" : "w-60"
          )}
        >
          <Sidebar collapsed={collapsed} />
        </aside>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent
            side="left"
            aria-describedby={undefined}
            className="w-60 gap-0 border-sidebar-border bg-sidebar p-0 sm:max-w-none lg:hidden"
          >
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        <div className="flex flex-1 flex-col overflow-hidden">
          <Header
            sidebarCollapsed={collapsed}
            onToggleSidebar={toggleCollapsed}
            onOpenMobileNav={() => setMobileOpen(true)}
          />
          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}