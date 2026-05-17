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
    <aside className="sidebar fixed left-0 top-0 h-screen w-56 bg-bg-secondary border-r border-border-subtle flex flex-col z-40">
      <div className="px-5 py-5 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center text-xs font-bold">FL</div>
          <span className="font-semibold text-sm tracking-wide">FamilyLedger</span>
        </div>
      </div>
      <nav className="flex-1 py-3 overflow-y-auto">
        {nav.map(({ href, icon: Icon, label }) => {
          const active = path === href || (href !== '/' && path.startsWith(href))
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm transition-colors ${
                active ? 'bg-blue-500/10 text-blue-400' : 'text-gray-400 hover:text-white hover:bg-white/5'
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
