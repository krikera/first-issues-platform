"use client";

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import {
  Menu,
  X,
  LogIn,
  UserPlus,
  LogOut,
  Bookmark,
  User,
  Github,
} from "lucide-react"
import { useState, useEffect } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import ThemeToggle from "@/components/ToggleTheme"
import { useAuth } from "@/contexts/AuthContext"
import { Logo } from "@/components/Logo"

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
      <div className="space-y-1 px-2">
        <div className="text-[13px] text-ink-subtle mb-2 px-2">
          Signed in as <span className="font-medium text-ink">{user.username}</span>
        </div>
        <Link href="/bookmarks" onClick={onNavigate}>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-[14px]"
          >
            <Bookmark className="h-4 w-4 mr-2 text-ink-subtle" />
            Bookmarks
          </Button>
        </Link>
        <Link href="/profile" onClick={onNavigate}>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-[14px]"
          >
            <User className="h-4 w-4 mr-2 text-ink-subtle" />
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
          className="w-full justify-start text-[14px] text-ink-muted"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    ) : (
      <div className="space-y-2 px-2 pt-2">
        <Link href="/bookmarks" onClick={onNavigate} className="block">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-[14px]"
          >
            <Bookmark className="h-4 w-4 mr-2 text-ink-subtle" />
            Bookmarks
          </Button>
        </Link>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Link href="/login" onClick={onNavigate} className="w-full">
            <Button
              variant="secondary"
              size="sm"
              className="w-full text-[14px]"
            >
              <LogIn className="h-3.5 w-3.5 mr-1.5" />
              Sign In
            </Button>
          </Link>
          <Link href="/register" onClick={onNavigate} className="w-full">
            <Button
              variant="default"
              size="sm"
              className="w-full text-[14px]"
            >
              <UserPlus className="h-3.5 w-3.5 mr-1.5" />
              Sign Up
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Desktop version
  return isAuthenticated && user ? (
    <div className="flex items-center gap-5">
      <Link
        href="/bookmarks"
        className="text-ink-subtle hover:text-ink transition-colors flex items-center gap-1.5 text-[14px]"
      >
        <Bookmark className="h-4 w-4" />
        <span>Bookmarks</span>
      </Link>
      <Link
        href="/profile"
        className="text-ink-subtle hover:text-ink transition-colors flex items-center gap-1.5 text-[14px]"
      >
        <User className="h-4 w-4" />
        <span>Profile</span>
      </Link>
      <button
        onClick={() => logout()}
        className="text-ink-subtle hover:text-ink transition-colors flex items-center gap-1.5 text-[14px] cursor-pointer"
      >
        <LogOut className="h-4 w-4" />
        <span>Logout</span>
      </button>
    </div>
  ) : (
    <div className="flex items-center gap-4">
      <Link
        href="/bookmarks"
        className="text-ink-subtle hover:text-ink transition-colors flex items-center gap-1.5 text-[14px]"
      >
        <Bookmark className="h-4 w-4" />
        <span>Bookmarks</span>
      </Link>
      <div className="flex items-center gap-2.5">
        <Link href="/login">
          <Button
            variant="secondary"
            size="sm"
            className="text-[13px] h-8 px-3"
          >
            Sign in
          </Button>
        </Link>
        <Link href="/register">
          <Button
            variant="default"
            size="sm"
            className="text-[13px] h-8 px-3.5"
          >
            Get started
          </Button>
        </Link>
      </div>
    </div>
  )
}

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
    return isMobile ? (
      <div className="space-y-2 px-3">
        <div className="h-8 w-full bg-surface-2 animate-pulse rounded-[6px]" />
      </div>
    ) : (
      <div className="flex items-center gap-2">
        <div className="h-8 w-16 bg-surface-2 animate-pulse rounded-[6px]" />
        <div className="h-8 w-20 bg-surface-2 animate-pulse rounded-[6px]" />
      </div>
    )
  }

  return <AuthNavContent isMobile={isMobile} onNavigate={onNavigate} />
}

const NavBar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const handleBrowseIssues = () => {
    if (pathname === "/") {
      const resultsSection = document.getElementById("results-section")
      if (resultsSection) {
        resultsSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    } else {
      router.push("/#results-section")
    }
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-hairline bg-canvas/85 backdrop-blur-md">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <Logo size={28} className="rounded-[6px]" />
              <span className="font-display text-[15px] font-semibold tracking-[-0.2px] text-ink group-hover:text-primary transition-colors">
                First Issues
              </span>
            </Link>
            <Badge variant="default" className="text-[11px] px-2 py-0.5 border border-hairline bg-surface-2 text-ink-muted">
              v2.0
            </Badge>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={handleBrowseIssues}
              className="text-[14px] text-ink-subtle hover:text-ink transition-colors cursor-pointer"
            >
              Browse Issues
            </button>
            <Link
              href="/analytics"
              className="text-[14px] text-ink-subtle hover:text-ink transition-colors"
            >
              Analytics
            </Link>
            <Link
              href="https://github.com/krikera/first-issues-platform"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[14px] text-ink-subtle hover:text-ink transition-colors flex items-center gap-1.5"
            >
              <Github className="h-4 w-4" />
              <span>GitHub</span>
            </Link>
            <ThemeToggle />
            <div className="h-4 w-px bg-hairline" />
            <ClientAuthNav />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="h-9 w-9 rounded-[6px] flex items-center justify-center text-ink-subtle hover:text-ink hover:bg-surface-1 border border-hairline transition-colors"
              aria-label={
                isMobileMenuOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Menu className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen ? (
          <div className="md:hidden border-t border-hairline py-3 space-y-2 bg-canvas">
            <button
              onClick={() => {
                handleBrowseIssues()
                setIsMobileMenuOpen(false)
              }}
              className="block px-3 py-2 text-[14px] text-ink-subtle hover:text-ink hover:bg-surface-1 rounded-[6px] transition-colors w-full text-left"
            >
              Browse Issues
            </button>
            <Link
              href="/analytics"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-[14px] text-ink-subtle hover:text-ink hover:bg-surface-1 rounded-[6px] transition-colors w-full text-left"
            >
              Analytics
            </Link>
            <div className="border-t border-hairline my-2" />
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
