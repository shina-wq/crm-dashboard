import { createBrowserRouter, Navigate } from "react-router-dom"
import { AppShell } from "@/components/layout/AppShell"
import { ProtectedRoute } from "@/features/auth/ProtectedRoute"
import { LoginPage } from "@/pages/LoginPage"
import { DashboardPage } from "@/pages/DashboardPage"
import { CustomersPage } from "@/pages/CustomersPage"
import { CustomerProfilePage } from "@/pages/CustomerProfilePage"
import { SegmentsPage } from "@/pages/SegmentsPage"
import { ProductsPage } from "@/pages/ProductsPage"
import { AnalyticsPage } from "@/pages/AnalyticsPage"
import { SettingsPage } from "@/pages/SettingsPage"
import { HelpPage } from "@/pages/HelpPage"
import { NotFoundPage } from "@/pages/NotFoundPage"

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/dashboard" replace /> },
  { path: "/login", element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/customers", element: <CustomersPage /> },
          { path: "/customers/:id", element: <CustomerProfilePage /> },
          { path: "/segments", element: <SegmentsPage /> },
          { path: "/products", element: <ProductsPage /> },
          { path: "/analytics", element: <AnalyticsPage /> },
          { path: "/settings", element: <SettingsPage /> },
          { path: "/help", element: <HelpPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
])