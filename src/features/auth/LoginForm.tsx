import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CircleAlert, Eye, EyeOff, LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { ApiError } from "@/services/api-client"
import { useAuth } from "./auth-context"

// Login only checks that fields are filled. Password rules belong on sign-up.
const loginSchema = z.object({
  username: z.string().trim().min(1, "Enter your username"),
  password: z.string().min(1, "Enter your password"),
})

type LoginValues = z.infer<typeof loginSchema>

// Public demo account from the DummyJSON docs.
const DEMO_CREDENTIALS: LoginValues = { username: "emilys", password: "emilyspass" }

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError && (error.status === 400 || error.status === 401)) {
    return "Invalid username or password."
  }
  if (error instanceof TypeError) return "Can't reach the server. Check your connection."
  return "Something went wrong. Try again."
}

export function LoginForm() {
  const { signIn } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    resetField,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  })

  const onSubmit = handleSubmit(async ({ username, password }) => {
    setAuthError(null)
    try {
      await signIn(username, password)
    } catch (error) {
      setAuthError(getErrorMessage(error))
      resetField("password")
      setFocus("password")
    }
  })

  const fillDemo = () => {
    reset(DEMO_CREDENTIALS)
    setAuthError(null)
  }

  return (
    <>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        {authError && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-md bg-danger p-3 text-sm text-danger-foreground"
          >
            <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {authError}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="username" className="text-sm font-medium text-foreground">
            Username
          </label>
          <Input
            id="username"
            autoComplete="username"
            aria-invalid={!!errors.username}
            aria-describedby={errors.username ? "username-error" : undefined}
            {...register("username")}
          />
          {errors.username && (
            <p id="username-error" className="text-xs text-destructive">
              {errors.username.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium text-foreground">
            Password
          </label>
          <InputGroup>
            <InputGroupInput
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
              {...register("password")}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                size="icon-xs"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((shown) => !shown)}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          {errors.password && (
            <p id="password-error" className="text-xs text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting && <LoaderCircle className="animate-spin" aria-hidden="true" />}
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="mt-6 flex justify-end border-t border-border pt-4">
        <Button
          type="button"
          variant="link"
          size="sm"
          onClick={fillDemo}
        >
          Use demo credentials
        </Button>
      </div>
    </>
  )
}