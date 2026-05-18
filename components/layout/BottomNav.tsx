'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, PlusCircle, BarChart2, Wallet, Settings } from 'lucide-react'

const tabs = [
  { href: '/', icon: LayoutDashboard, label: 'Home' },
  { href: '/add', icon: PlusCircle, label: 'Add' },
  { href: '/report', icon: BarChart2, label: 'Reports' },
  { href: '/budget', icon: Wallet, label: 'Budget' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export function BottomNav() {
  const path = usePathname()
  return (
    <nav className="bottom-nav fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-blue-200 z-50 shadow-lg">
      <div className="flex px-2">
        {tabs.map(({ href, icon: Icon, label }) => {
          const active = path === href || (href !== '/' && path.startsWith(href))
          return (
            <Link key={href} href={href}
              className={`flex-1 flex flex-col items-center py-3 gap-1 text-[10px] transition-colors rounded-t-lg ${
                active 
                  ? 'text-blue-700 bg-blue-50 font-medium' 
                  : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50/50'
              }`}>
              <Icon size={20} />
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
