import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

interface PasswordInputProps extends Omit<React.ComponentProps<"input">, "type"> {
  showStrength?: boolean
}

function PasswordInput({ className, showStrength, value, ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = React.useState(false)

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          data-slot="input"
          className={cn(
            "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 pr-10 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
            className
          )}
          value={value}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
          disabled={props.disabled}
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="size-4 text-muted-foreground" aria-hidden="true" />
          ) : (
            <Eye className="size-4 text-muted-foreground" aria-hidden="true" />
          )}
          <span className="sr-only">
            {showPassword ? "Hide password" : "Show password"}
          </span>
        </Button>
      </div>
      {showStrength && value && typeof value === "string" && (
        <PasswordStrength password={value} />
      )}
    </div>
  )
}

function PasswordStrength({ password }: { password: string }) {
  const strength = React.useMemo(() => {
    let score = 0
    if (password.length >= 6) score++
    if (password.length >= 8) score++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[^a-zA-Z0-9]/.test(password)) score++
    return score
  }, [password])

  const getStrengthLabel = () => {
    if (strength <= 1) return "Weak"
    if (strength <= 2) return "Fair"
    if (strength <= 3) return "Good"
    return "Strong"
  }

  const getStrengthColor = () => {
    if (strength <= 1) return "bg-red-500"
    if (strength <= 2) return "bg-orange-500"
    if (strength <= 3) return "bg-yellow-500"
    return "bg-emerald-500"
  }

  const getStrengthTextColor = () => {
    if (strength <= 1) return "text-red-500"
    if (strength <= 2) return "text-orange-500"
    if (strength <= 3) return "text-yellow-600"
    return "text-emerald-500"
  }

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              level <= strength ? getStrengthColor() : "bg-muted"
            )}
          />
        ))}
      </div>
      <p className={cn("text-xs", getStrengthTextColor())}>
        {getStrengthLabel()} password
        {strength < 3 && (
          <span className="text-muted-foreground ml-1">
            — try adding {strength < 2 ? "numbers and" : ""} special characters
          </span>
        )}
      </p>
    </div>
  )
}

export { PasswordInput, PasswordStrength }
