'use client'

import { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      {children}
    </div>
  )
}

