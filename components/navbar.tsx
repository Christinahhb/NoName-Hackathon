"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, PlusCircle, Compass, User, ShoppingCart, Utensils, LogOut, Loader2 } from "lucide-react"
import { ModeToggle } from "./mode-toggle"
import { useAuth } from "@/context/auth-context"
import { useToast } from "./ui/use-toast"

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut, loading, userProfile } = useAuth()
  const { toast } = useToast()

  const handleSignOut = async () => {
    try {
      await signOut()
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      })
      router.push("/")
    } catch (error) {
      toast({
        title: "Sign Out Failed",
        description: "Could not sign out. Please try again.",
        variant: "destructive",
      })
    }
  }

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/recipes", label: "Recipes", icon: Compass, requiresAuth: true }, // Added requiresAuth
    { href: "/upload", label: "Upload", icon: PlusCircle, requiresAuth: true },
    { href: "/test-spoonacular", label: "Test API", icon: ShoppingCart }, // Test page
    // Profile link will be handled separately based on auth state
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-neutral-900 border-b dark:border-neutral-800 shadow-sm">
      <div className="container mx-auto py-3 px-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <Utensils className="h-7 w-7 text-yellow-500" />
          <span className="text-xl font-bold text-neutral-800 dark:text-white">
            NoName <span className="text-yellow-500">Recipes</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => {
            // If auth is required, user is not logged in, and auth is not loading, hide the link
            if (link.requiresAuth && !user && !loading) {
              return null
            }
            // If auth is required and auth is loading, show a loader placeholder
            if (link.requiresAuth && loading) {
              return (
                <div key={link.href} className="flex items-center space-x-1 text-neutral-400 dark:text-neutral-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{link.label}</span>
                </div>
              )
            }
            // Otherwise, render the link
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center space-x-1 transition-colors ${
                  pathname === link.href
                    ? "text-yellow-500 font-semibold"
                    : "text-neutral-600 dark:text-neutral-300 hover:text-yellow-500 dark:hover:text-yellow-400"
                }`}
              >
                <link.icon className="h-4 w-4" />
                <span>{link.label}</span>
              </Link>
            )
          })}
          {user &&
            !loading && ( // Show profile link only if user is loaded and exists
              <Link
                href="/profile"
                className={`flex items-center space-x-1 transition-colors ${
                  pathname === "/profile"
                    ? "text-yellow-500 font-semibold"
                    : "text-neutral-600 dark:text-neutral-300 hover:text-yellow-500 dark:hover:text-yellow-400"
                }`}
              >
                <User className="h-4 w-4" />
                <span>{userProfile?.firstName || "Profile"}</span>
              </Link>
            )}
        </nav>

        <div className="flex items-center space-x-3">
          <Link href="/cart">
            <Button variant="ghost" size="icon" aria-label="Shopping Cart">
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </Link>
          <ModeToggle />
          {loading ? (
            <Button variant="outline" size="sm" disabled>
              <Loader2 className="h-4 w-4 animate-spin" />
            </Button>
          ) : user ? (
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="flex items-center space-x-1">
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          ) : (
            <Link href="/signin">
              <Button className="hidden sm:inline-flex bg-yellow-500 hover:bg-yellow-600 text-black">Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
