import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes, type InitialEntry } from "react-router-dom"
import { AuthProvider } from "@/features/auth/AuthProvider"
import { readSession, writeSession } from "@/features/auth/session"
import { ApiError } from "@/services/api-client"
import { login } from "@/services/auth-api"
import { makeAuthUser } from "@/test/factories"
import { LoginPage } from "./LoginPage"

vi.mock("@/services/auth-api")

function renderLogin(entry: InitialEntry = "/login") {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[entry]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<p>Dashboard screen</p>} />
          <Route path="/customers" element={<p>Customers screen</p>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  )
}

async function fillAndSubmit(username: string, password: string) {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText("Username"), username)
  await user.type(screen.getByLabelText("Password"), password)
  await user.click(screen.getByRole("button", { name: "Sign in" }))
}

beforeEach(() => {
  vi.resetAllMocks()
  localStorage.clear()
})

describe("LoginPage", () => {
  it("shows the product name", () => {
    renderLogin()

    expect(screen.getByText("CRM")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument()
  })

  it("shows an error for each empty field and does not call the API", async () => {
    renderLogin()

    await userEvent.setup().click(screen.getByRole("button", { name: "Sign in" }))

    expect(await screen.findByText("Enter your username")).toBeInTheDocument()
    expect(screen.getByText("Enter your password")).toBeInTheDocument()
    expect(login).not.toHaveBeenCalled()
  })

  it("signs in, saves the session and opens the dashboard", async () => {
    const user = makeAuthUser()
    vi.mocked(login).mockResolvedValue(user)
    renderLogin()

    await fillAndSubmit("  emilys ", "emilyspass")

    expect(await screen.findByText("Dashboard screen")).toBeInTheDocument()
    expect(login).toHaveBeenCalledWith("emilys", "emilyspass")
    expect(readSession()).toEqual(user)
  })

  it("sends the user back to the page they were trying to open", async () => {
    vi.mocked(login).mockResolvedValue(makeAuthUser())
    renderLogin({ pathname: "/login", state: { from: "/customers" } })

    await fillAndSubmit("emilys", "emilyspass")

    expect(await screen.findByText("Customers screen")).toBeInTheDocument()
  })

  it("shows an error for wrong credentials, keeps the username and clears the password", async () => {
    vi.mocked(login).mockRejectedValue(new ApiError("Request failed: 400 Bad Request", 400))
    renderLogin()

    await fillAndSubmit("emilys", "wrong")

    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid username or password.")
    expect(screen.getByLabelText("Username")).toHaveValue("emilys")
    expect(screen.getByLabelText("Password")).toHaveValue("")
    expect(readSession()).toBeNull()
  })

  it("shows a network message when the server can't be reached", async () => {
    vi.mocked(login).mockRejectedValue(new TypeError("Failed to fetch"))
    renderLogin()

    await fillAndSubmit("emilys", "emilyspass")

    expect(await screen.findByRole("alert")).toHaveTextContent("Can't reach the server")
  })

  it("disables the button while signing in", async () => {
    vi.mocked(login).mockReturnValue(new Promise(() => {}))
    renderLogin()

    await fillAndSubmit("emilys", "emilyspass")

    expect(await screen.findByRole("button", { name: "Signing in…" })).toBeDisabled()
  })

  it("toggles password visibility", async () => {
    renderLogin()
    const user = userEvent.setup()
    const password = screen.getByLabelText("Password")
    expect(password).toHaveAttribute("type", "password")

    await user.click(screen.getByRole("button", { name: "Show password" }))
    expect(password).toHaveAttribute("type", "text")

    await user.click(screen.getByRole("button", { name: "Hide password" }))
    expect(password).toHaveAttribute("type", "password")
  })

  it("fills the demo credentials", async () => {
    renderLogin()

    await userEvent.setup().click(screen.getByRole("button", { name: "Use demo credentials" }))

    expect(screen.getByLabelText("Username")).toHaveValue("emilys")
    expect(screen.getByLabelText("Password")).toHaveValue("emilyspass")
  })

  it("skips the form when already signed in", () => {
    writeSession(makeAuthUser())
    renderLogin()

    expect(screen.getByText("Dashboard screen")).toBeInTheDocument()
  })
})