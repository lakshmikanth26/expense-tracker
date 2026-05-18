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
    <html lang="en">
      <body className="bg-gradient-to-br from-blue-50 via-white to-blue-100 text-gray-900 min-h-screen">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 pb-20 md:pb-0 md:ml-56 px-4 sm:px-6">
            {children}
          </main>
        </div>
        <BottomNav />
        <Toaster />
      </body>
    </html>
  )
}
