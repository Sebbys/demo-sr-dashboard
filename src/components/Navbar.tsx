"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Home, BarChart3, Upload, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function GlobalNavbar() {
  const pathname = usePathname()

  const getNavContent = () => {
    if (pathname === "/") {
      return (
        <header className="flex h-16 items-center justify-between border-b border-border px-4 bg-card">
          <Link href="/" className="flex flex-row items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="instrument-serif text-xl font-semibold">Uroboros</span>
          </Link>

          <div className="flex flex-row items-center gap-3">
            <Link href="/dashboard">
              <Button variant="secondary" className="h-8 px-4 py-2 transition-all-smooth hover:scale-105">
                <span>Get Started</span>
                <Upload className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </header>
      )
    }

    if (pathname.startsWith("/dashboard")) {
      return (
        <header className="flex h-16 items-center justify-between border-b border-border px-4 bg-card">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back to Home</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <span className="jetbrains-mono text-sm font-medium">Dashboard</span>
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="flex flex-col gap-4 mt-8">
                <Link href="/" className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors">
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </Link>
                <Link href="/dashboard" className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors">
                  <BarChart3 className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <Link href="/dashboard/global" className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors">
                  <BarChart3 className="h-4 w-4" />
                  <span>Analytics</span>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </header>
      )
    }

    if (pathname.startsWith("/plan/")) {
      return (
        <header className="flex h-16 items-center justify-between border-b border-border px-4 bg-card">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back to Dashboard</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <span className="jetbrains-mono text-sm font-medium">Member Plan</span>
          </div>
        </header>
      )
    }

    return (
      <header className="flex h-16 items-center justify-between border-b border-border px-4 bg-card">
        <Link href="/" className="flex flex-row items-center gap-2">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="instrument-serif text-xl font-semibold">Uroboros</span>
        </Link>

        <div className="flex flex-row items-center gap-3">
          <Link href="/dashboard">
            <Button variant="secondary" className="h-8 px-4 py-2 transition-all-smooth hover:scale-105">
              <span>Dashboard</span>
              <BarChart3 className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>
    )
  }

  return getNavContent()
}
