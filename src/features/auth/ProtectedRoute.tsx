import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "./auth-context"

export function ProtectedRoute() {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    // Remember where the user was going so login can send them back.
    const from = location.pathname + location.search
    return <Navigate to="/login" replace state={{ from }} />
  }

  return <Outlet />
}