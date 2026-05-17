'use client'
import { useStore } from '@/lib/store'
import { formatINR } from '@/lib/utils'
import { TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function InvestmentsPage() {
  const { monthData } = useStore()
  const investments = monthData.investments || []

  const byType = Object.entries(
    investments.reduce((acc, i) => { acc[i.type] = (acc[i.type] || 0) + i.amount; return acc }, {} as Record<string, number>)
  ).sort((a, b) => b[1] - a[1])

  const total = investments.reduce((s, i) => s + i.amount, 0)

  return (
    <div className="max-w-2xl mx-auto px-4 py-5">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-semibold">Investments</h1>
        <Link href="/add" className="btn btn-primary text-sm py-2 px-3">+ Add</Link>
      </div>

      {total > 0 && (
        <div className="card p-4 mb-4 flex items-center gap-4">
          <TrendingUp size={24} className="text-purple-400" />
          <div>
            <div className="text-xs text-gray-500">Total invested this month</div>
            <div className="text-2xl font-semibold text-purple-400">{formatINR(total)}</div>
          </div>
        </div>
      )}

      {byType.length > 0 && (
        <div className="card p-4 mb-4">
          <h3 className="text-sm font-medium mb-3">By Type</h3>
          {byType.map(([type, amt]) => (
            <div key={type} className="flex justify-between py-2 border-b border-border-subtle last:border-0 text-sm">
              <span className="text-gray-400">{type}</span>
              <span className="text-purple-400">{formatINR(amt)}</span>
            </div>
          ))}
        </div>
      )}

      {investments.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          <TrendingUp size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No investments this month. Start building wealth!</p>
        </div>
      ) : (
        <div className="card p-4">
          <h3 className="text-sm font-medium mb-3">All Investments</h3>
          {investments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(i => (
            <div key={i.id} className="flex items-center gap-3 py-2 border-b border-border-subtle last:border-0">
              <div className="flex-1">
                <div className="text-sm font-medium">{i.type}</div>
                <div className="text-xs text-gray-500">{i.schemeName || '-'} · {i.member} · {i.date}</div>
                {i.isRecurring && <span className="text-xs text-blue-400">Recurring</span>}
              </div>
              <span className="text-purple-400 font-medium">{formatINR(i.amount)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
