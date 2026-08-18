"use client";

import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { useTheme } from "@/contexts/ThemeContext"

function ThemeToggleContent() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  // Show fallback during hydration
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="relative">
        <Sun className="h-[1.2rem] w-[1.2rem] transition-opacity duration-300 opacity-100 border-none outline-none" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative"
    >
      {theme === "light" ? (
        <Sun className="h-[1.2rem] w-[1.2rem] transition-opacity duration-300 opacity-100 border-none outline-none" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem] transition-opacity duration-300 opacity-100 border-none outline-none" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

function ThemeToggle() {
  return <ThemeToggleContent />
}

export default ThemeToggle
