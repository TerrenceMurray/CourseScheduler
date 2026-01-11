import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import {
  User,
  Moon,
  Sun,
  Monitor,
  Shield,
  Key,
  Check,
  Palette,
  Save,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useTheme } from '@/components/theme-provider'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export const Route = createFileRoute('/app/settings')({
  component: SettingsPage,
})

const sections = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'security', label: 'Security', icon: Shield },
]

function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { user } = useAuth()
  const [activeSection, setActiveSection] = useState('profile')
  const [saving, setSaving] = useState(false)

  // Password change state
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  })
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [changingPassword, setChangingPassword] = useState(false)

  // Get user profile from Supabase auth
  const userEmail = user?.email ?? ''
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || ''
  const userRole = user?.user_metadata?.role || 'User'

  const [profile, setProfile] = useState({
    name: userName,
    department: user?.user_metadata?.department || '',
  })

  // Update profile when user changes
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.user_metadata?.full_name || user.user_metadata?.name || '',
        department: user.user_metadata?.department || '',
      })
    }
  }, [user])

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: profile.name,
          department: profile.department,
        },
      })

      if (error) {
        toast.error('Failed to update profile', { description: error.message })
      } else {
        toast.success('Profile updated successfully')
      }
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    setPasswordError(null)

    if (passwords.new !== passwords.confirm) {
      setPasswordError('New passwords do not match')
      return
    }

    if (passwords.new.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return
    }

    setChangingPassword(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.new,
      })

      if (error) {
        setPasswordError(error.message)
      } else {
        toast.success('Password updated successfully')
        setPasswords({ current: '', new: '', confirm: '' })
      }
    } catch {
      setPasswordError('An unexpected error occurred')
    } finally {
      setChangingPassword(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 animate-fade-in max-w-5xl">
      {/* Header */}
      <div className="flex flex-col gap-1 animate-slide-up">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Manage your account and preferences
        </p>
      </div>

      {/* Mobile Navigation - Horizontal scrollable tabs */}
      <div className="lg:hidden -mx-3 px-3 overflow-x-auto scrollbar-none">
        <div className="flex gap-2 pb-2 min-w-max">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap",
                activeSection === section.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <section.icon className="size-4" />
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {/* Settings Layout */}
      <div className="grid gap-6 lg:gap-8 lg:grid-cols-12">
        {/* Desktop Sidebar Navigation */}
        <nav className="hidden lg:block lg:col-span-3 space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-left transition-colors",
                activeSection === section.id
                  ? "bg-muted"
                  : "hover:bg-muted/50"
              )}
            >
              <div className={cn(
                "rounded-md p-1.5",
                activeSection === section.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted-foreground/10 text-muted-foreground"
              )}>
                <section.icon className="size-4" />
              </div>
              <span className={cn(
                "text-sm font-medium",
                activeSection === section.id ? "text-foreground" : "text-muted-foreground"
              )}>
                {section.label}
              </span>
            </button>
          ))}
        </nav>

        {/* Main Content */}
        <div className="lg:col-span-9 space-y-4 sm:space-y-6">
          {/* Profile Section */}
          {activeSection === 'profile' && (
            <>
              <Card>
                <CardHeader className="pb-4 space-y-1">
                  <CardTitle className="text-base">Personal Information</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Your account details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={userEmail}
                        disabled
                        className="bg-muted text-muted-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Input
                        id="role"
                        value={userRole}
                        disabled
                        className="bg-muted text-muted-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Select value={profile.department} onValueChange={(v) => setProfile({ ...profile, department: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Computer Science">Computer Science</SelectItem>
                          <SelectItem value="Mathematics">Mathematics</SelectItem>
                          <SelectItem value="Physics">Physics</SelectItem>
                          <SelectItem value="Engineering">Engineering</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button onClick={handleSaveProfile} disabled={saving} className="w-full sm:w-auto">
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 size-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 size-4" />
                          Save Profile
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Appearance Section */}
          {activeSection === 'appearance' && (
            <Card>
              <CardHeader className="pb-4 space-y-1">
                <CardTitle className="text-base">Theme</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Choose how the application looks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
                  {[
                    { value: 'light', label: 'Light', icon: Sun, desc: 'Always light' },
                    { value: 'dark', label: 'Dark', icon: Moon, desc: 'Always dark' },
                    { value: 'system', label: 'System', icon: Monitor, desc: 'Match device' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setTheme(option.value as 'light' | 'dark' | 'system')}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-xl border p-3 sm:p-4 text-left transition-all",
                        theme === option.value
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      )}
                    >
                      <div className={cn(
                        "flex size-9 sm:size-10 items-center justify-center rounded-lg transition-colors shrink-0",
                        theme === option.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground group-hover:bg-muted-foreground/10"
                      )}>
                        <option.icon className="size-4 sm:size-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{option.label}</p>
                        <p className="text-xs text-muted-foreground">{option.desc}</p>
                      </div>
                      {theme === option.value && (
                        <div className="flex size-5 items-center justify-center rounded-full bg-primary shrink-0">
                          <Check className="size-3 text-primary-foreground" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Section */}
          {activeSection === 'security' && (
            <Card>
              <CardHeader className="pb-4 space-y-1">
                <CardTitle className="text-base">Change Password</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {passwordError && (
                  <Alert variant="destructive">
                    <AlertCircle className="size-4" />
                    <AlertDescription>{passwordError}</AlertDescription>
                  </Alert>
                )}
                <div className="grid gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="Enter new password"
                        value={passwords.new}
                        onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                        disabled={changingPassword}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Confirm new password"
                        value={passwords.confirm}
                        onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                        disabled={changingPassword}
                      />
                    </div>
                  </div>
                </div>
                <div className="pt-2">
                  <Button
                    onClick={handleChangePassword}
                    disabled={changingPassword || !passwords.new || !passwords.confirm}
                    className="w-full sm:w-auto"
                  >
                    {changingPassword ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Key className="mr-2 size-4" />
                        Update Password
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
