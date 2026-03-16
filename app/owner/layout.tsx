'use client'

import React from "react"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Building2,
  MessageCircle,
  Calendar,
  BarChart3,
  Settings,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const sidebarNav = [
  { href: '/owner/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/owner/listings', label: 'My Listings', icon: Building2 },
  { href: '/owner/bookings', label: 'Booking Requests', icon: Calendar },
  { href: '/owner/messages', label: 'Messages', icon: MessageCircle },
  { href: '/owner/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/owner/settings', label: 'Settings', icon: Settings },
]

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r bg-card lg:block">
          <div className="flex h-full flex-col">
            <div className="p-4">
              <Button asChild className="w-full">
                <Link href="/owner/listings/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Listing
                </Link>
              </Button>
            </div>
            <nav className="flex-1 space-y-1 px-3 py-2">
              {sidebarNav.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>
        </aside>

        {/* Mobile Bottom Nav */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card lg:hidden">
          <div className="flex justify-around">
            {sidebarNav.slice(0, 5).map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center gap-1 px-3 py-2 text-xs',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label.split(' ')[0]}</span>
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-auto pb-16 lg:pb-0">{children}</main>
      </div>
    </div>
  )
}
