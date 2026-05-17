import type { Metadata } from 'next'
import './globals.css'
import { BottomNav } from '@/components/layout/BottomNav'
import { Sidebar } from '@/components/layout/Sidebar'
import { Toaster } from '@/components/ui/Toaster'

export const metadata: Metadata = {
  title: 'FamilyLedger',
  description: 'Family Finance Tracker',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-bg-primary text-white min-h-screen">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 pb-20 md:pb-0 md:ml-56">
            {children}
          </main>
        </div>
        <BottomNav />
        <Toaster />
      </body>
    </html>
  )
}
