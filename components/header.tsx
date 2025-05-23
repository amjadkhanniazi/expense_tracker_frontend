"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { DollarSign, LogOut, Menu, Moon, Sun, User } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function Header() {
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const pathname = usePathname()
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    // Check if user has a theme preference
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.classList.toggle("dark", savedTheme === "dark")
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark")
      document.documentElement.classList.add("dark")
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      })
      router.push("/login")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: "There was an error logging out",
      })
    }
  }

  // Don't render with server-side rendering to avoid hydration mismatch
  if (!isMounted) return null

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <DollarSign className="h-5 w-5" />
          <span>ExpenseTracker</span>
        </Link>
        <div className="hidden md:flex flex-1 items-center justify-end space-x-4" style={{alignItems: "right", justifyContent: "right"}}>
          {user ? (
            <>
              <nav className="flex items-center space-x-2">
                <Link
                  href="/dashboard"
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    pathname === "/dashboard" ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  Dashboard
                </Link>
                <Link
                  href="/expenses"
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    pathname === "/expenses" ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  Expenses
                </Link>
                <Link
                  href="/profile"
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    pathname === "/profile" ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  Profile
                </Link>
              </nav>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                    <span className="sr-only">User menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
        <div className="flex md:hidden flex-1 items-center justify-end">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="mr-2">
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            <span className="sr-only">Toggle theme</span>
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="grid gap-4 py-4">
                {user ? (
                  <>
                    <Link href="/dashboard" className="flex items-center py-2 text-sm font-medium">
                      Dashboard
                    </Link>
                    <Link href="/expenses" className="flex items-center py-2 text-sm font-medium">
                      Expenses
                    </Link>
                    <Link href="/profile" className="flex items-center py-2 text-sm font-medium">
                      Profile
                    </Link>
                    <Button variant="ghost" className="justify-start px-2" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login">
                      <Button variant="ghost" className="w-full justify-start">
                        Login
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button className="w-full">Sign Up</Button>
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ")
}
