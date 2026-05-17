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
    <nav className="bottom-nav fixed bottom-0 left-0 right-0 bg-bg-secondary border-t border-border-subtle z-50">
      <div className="flex">
        {tabs.map(({ href, icon: Icon, label }) => {
          const active = path === href || (href !== '/' && path.startsWith(href))
          return (
            <Link key={href} href={href}
              className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 text-[10px] transition-colors ${
                active ? 'text-blue-400' : 'text-gray-500'
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
