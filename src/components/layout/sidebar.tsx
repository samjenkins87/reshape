'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  ListOrdered,
  AlertTriangle,
  SlidersHorizontal,
  TrendingUp,
  GraduationCap,
  Network,
  CalendarClock,
  Menu,
  X,
  LucideIcon,
  BookOpen
} from 'lucide-react'
import { useUIStore } from '@/stores/ui-store'
import { Button } from '@/components/ui/button'

interface NavItem {
  name?: string
  href?: string
  icon?: LucideIcon
  type?: 'separator'
}

const navigation: NavItem[] = [
  { name: 'Overview', href: '/overview', icon: LayoutDashboard },
  { name: 'Roles', href: '/roles', icon: Users },
  { name: 'Scorecard', href: '/scorecard', icon: ListOrdered },
  { name: 'Bottlenecks', href: '/bottlenecks', icon: AlertTriangle },
  { type: 'separator' },
  { name: 'Scenario', href: '/scenario', icon: SlidersHorizontal },
  { name: 'Hiring', href: '/hiring', icon: TrendingUp },
  { name: 'Reskilling', href: '/reskilling', icon: GraduationCap },
  { name: 'Pods', href: '/pods', icon: Network },
  { name: 'Timeline', href: '/timeline', icon: CalendarClock },
  { type: 'separator' },
  { name: 'Methodology', href: '/methodology', icon: BookOpen },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarOpen, setSidebarOpen } = useUIStore()

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 transform border-r border-border bg-card transition-transform lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 px-6 border-b border-border">
          <Image
            src="/momentus_avatar.png"
            alt="Momentus"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Momentus</span>
            <span className="text-xs text-muted-foreground">Reshape</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 p-4">
          {navigation.map((item, index) => {
            if (item.type === 'separator') {
              return (
                <div
                  key={`sep-${index}`}
                  className="my-2 border-t border-border"
                />
              )
            }

            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href!}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {item.name}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  )
}
