'use client'

import { ThemeSwitcher } from './theme-switcher'
import { ContextSwitcher } from './context-switcher'

interface HeaderProps {
  title?: string
  description?: string
}

export function Header({ title, description }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <ContextSwitcher />
          {title && (
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold">{title}</h1>
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  )
}
