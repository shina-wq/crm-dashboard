import { Navigate, Outlet } from "react-router-dom"

// TODO: replace with real auth state once auth is built
const isAuthenticated = true

export function ProtectedRoute() {
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}