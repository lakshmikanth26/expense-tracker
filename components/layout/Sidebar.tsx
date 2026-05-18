'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, PlusCircle, BarChart2, Target,
  Wallet, CreditCard, PlayCircle, Settings, TrendingUp
} from 'lucide-react'

const nav = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/add', icon: PlusCircle, label: 'Add Entry' },
  { href: '/report', icon: BarChart2, label: 'Reports' },
  { href: '/goals', icon: Target, label: 'Goals' },
  { href: '/budget', icon: Wallet, label: 'Budget' },
  { href: '/loans', icon: CreditCard, label: 'Loans & EMI' },
  { href: '/subscriptions', icon: PlayCircle, label: 'Subscriptions' },
  { href: '/investments', icon: TrendingUp, label: 'Investments' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar() {
  const path = usePathname()
  return (
    <aside className="sidebar fixed left-0 top-0 h-screen w-56 bg-white/80 backdrop-blur-md border-r border-blue-200 flex flex-col z-40 shadow-lg">
      <div className="px-5 py-5 border-b border-blue-200">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-md">FL</div>
          <span className="font-semibold text-sm tracking-wide text-blue-900">FamilyLedger</span>
        </div>
      </div>
      <nav className="flex-1 py-3 overflow-y-auto">
        {nav.map(({ href, icon: Icon, label }) => {
          const active = path === href || (href !== '/' && path.startsWith(href))
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm transition-colors ${
                active 
                  ? 'bg-blue-100 text-blue-700 font-medium border border-blue-200' 
                  : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
              }`}>
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
