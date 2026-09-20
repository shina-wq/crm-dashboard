import { beforeEach, describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom"
import { makeAuthUser } from "@/test/factories"
import { AuthProvider } from "./AuthProvider"
import { ProtectedRoute } from "./ProtectedRoute"
import { writeSession } from "./session"

function LoginProbe() {
  const { state } = useLocation()
  return <p>Login page, from {state?.from}</p>
}

function renderAt(path: string) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/login" element={<LoginProbe />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/customers" element={<p>Customers screen</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  )
}

beforeEach(() => localStorage.clear())

describe("ProtectedRoute", () => {
  it("redirects to /login when signed out, remembering the requested page", () => {
    renderAt("/customers?page=2")

    expect(screen.getByText("Login page, from /customers?page=2")).toBeInTheDocument()
    expect(screen.queryByText("Customers screen")).not.toBeInTheDocument()
  })

  it("renders the page when signed in", () => {
    writeSession(makeAuthUser())
    renderAt("/customers")

    expect(screen.getByText("Customers screen")).toBeInTheDocument()
  })
})