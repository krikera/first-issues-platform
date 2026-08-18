"use client";

import Link from "next/link"
import {
  /*BarChart3,*/ /*Github,*/ Menu,
  X,
  LogIn,
  UserPlus,
  LogOut,
  Bookmark,
  User,
} from "lucide-react"
import { useState, useEffect } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import ThemeToggle from "@/components/ToggleTheme"
import { useAuth } from "@/contexts/AuthContext"

// Auth-dependent navigation content (only rendered on client)
function AuthNavContent({
  isMobile = false,
  onNavigate,
}: {
  isMobile?: boolean
  onNavigate?: (() => void) | undefined
}) {
  const { isAuthenticated, user, logout } = useAuth()

  if (isMobile) {
    return isAuthenticated && user ? (
      <div className="space-y-1 px-3">
        <div className="text-sm text-muted-foreground mb-2 px-2">
          Signed in as{" "}
          <span className="font-medium text-foreground">{user.username}</span>
        </div>
        <Link href="/bookmarks" onClick={onNavigate}>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-sm font-medium"
          >
            <Bookmark className="h-4 w-4 mr-2" />
            Bookmarks
          </Button>
        </Link>
        <Link href="/profile" onClick={onNavigate}>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-sm font-medium"
          >
            <User className="h-4 w-4 mr-2" />
            Profile
          </Button>
        </Link>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            logout()
            onNavigate?.()
          }}
          className="w-full justify-start text-sm font-medium"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    ) : (
      <div className="space-y-1 px-3">
        <Link href="/bookmarks" onClick={onNavigate}>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-sm font-medium"
          >
            <Bookmark className="h-4 w-4 mr-2" />
            Bookmarks
          </Button>
        </Link>
        <Link href="/login" onClick={onNavigate}>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-sm font-medium"
          >
            <LogIn className="h-4 w-4 mr-2" />
            Login
          </Button>
        </Link>
        <Link href="/register" onClick={onNavigate}>
          <Button
            size="sm"
            className="w-full justify-start text-sm font-medium"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Sign Up
          </Button>
        </Link>
      </div>
    )
  }

  // Desktop version
  return isAuthenticated && user ? (
    <div className="flex items-center gap-6">
      <Link
        href="/bookmarks"
        className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 text-sm"
      >
        <Bookmark className="h-4 w-4" />
        <span>Bookmarks</span>
      </Link>
      <Link
        href="/profile"
        className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 text-sm"
      >
        <User className="h-4 w-4" />
        <span>Profile</span>
      </Link>
      <button
        onClick={() => logout()}
        className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 text-sm"
      >
        <LogOut className="h-4 w-4" />
        <span>Logout</span>
      </button>
    </div>
  ) : (
    <div className="flex items-center gap-6">
      <Link
        href="/bookmarks"
        className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 text-sm"
      >
        <Bookmark className="h-4 w-4" />
        <span>Bookmarks</span>
      </Link>
      <div className="flex items-center gap-4">
        <Link href="/login">
          <Button
            variant="ghost"
            size="sm"
            className="text-sm font-medium text-muted-foreground hover:text-primary"
          >
            Login
          </Button>
        </Link>
        <Link href="/register">
          <Button
            size="sm"
            className="text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 px-6"
          >
            Sign Up
          </Button>
        </Link>
      </div>
    </div>
  )
}

// Client-only wrapper that handles hydration
function ClientAuthNav({
  isMobile = false,
  onNavigate,
}: {
  isMobile?: boolean
  onNavigate?: (() => void) | undefined
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Show placeholder during SSR/hydration
    return isMobile ? (
      <div className="space-y-2 px-3">
        <div className="h-9 w-full bg-muted/20 animate-pulse rounded" />
        <div className="h-9 w-full bg-muted/20 animate-pulse rounded" />
      </div>
    ) : (
      <div className="flex items-center gap-4">
        <div className="h-8 w-20 bg-muted/20 animate-pulse rounded" />
        <div className="h-8 w-24 bg-muted/20 animate-pulse rounded" />
      </div>
    )
  }

  return <AuthNavContent isMobile={isMobile} onNavigate={onNavigate} />
}

const NavBar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <img 
                src="/favicon.png" 
                alt="First Issues" 
                className="h-8 w-8 rounded-lg"
              />
              <span className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                First Issues
              </span>
            </Link>
            <Badge className="hidden sm:inline-flex text-[10px] px-1.5 py-0.5 h-5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
              Beta
            </Badge>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => {
                const resultsSection =
                  document.getElementById("results-section")
                if (resultsSection) {
                  resultsSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  })
                }
              }}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Browse Issues
            </button>
            <ThemeToggle />
            <ClientAuthNav />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="h-9 w-9 p-0 flex items-center justify-center text-primary hover:bg-primary/10 transition-colors"
              aria-label={
                isMobileMenuOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen ? (
          <div className="md:hidden border-t border-border mt-4 pt-4 pb-4 space-y-2">
            <button
              onClick={() => {
                const resultsSection =
                  document.getElementById("results-section")
                if (resultsSection) {
                  resultsSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  })
                }
                setIsMobileMenuOpen(false)
              }}
              className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-all duration-200 w-full text-left"
            >
              Browse Issues
            </button>
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-sm text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>
            <div className="border-t border-border my-2" />
            <ClientAuthNav
              isMobile={true}
              onNavigate={() => setIsMobileMenuOpen(false)}
            />
          </div>
        ) : null}
      </div>
    </nav>
  )
}

export default NavBar
