'use client'
import { useStore } from '@/lib/store'
import { formatINR } from '@/lib/utils'
import { toast } from '@/components/ui/Toaster'
import { PlayCircle, Trash2, Bell } from 'lucide-react'
import Link from 'next/link'

export default function SubscriptionsPage() {
  const { monthData, saveMonth } = useStore()
  const subs = monthData.subscriptions || []
  const today = new Date().getDate()

  const toggleActive = async (id: string) => {
    const updated = { ...monthData, subscriptions: subs.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s) }
    await saveMonth(updated)
    toast('Updated', 'success')
  }

  const deleteSub = async (id: string) => {
    const updated = { ...monthData, subscriptions: subs.filter(s => s.id !== id) }
    await saveMonth(updated)
    toast('Removed', 'success')
  }

  const activeSubs = subs.filter(s => s.isActive)
  const monthlyTotal = activeSubs.reduce((s, sub) => s + sub.amount, 0)
  const annualTotal = monthlyTotal * 12

  return (
    <div className="max-w-2xl mx-auto px-4 py-5">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-semibold">Subscriptions</h1>
        <Link href="/add" className="btn btn-primary text-sm py-2 px-3">+ Add</Link>
      </div>

      {monthlyTotal > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="card p-3">
            <div className="text-xs text-gray-500 mb-1">Monthly total</div>
            <div className="text-xl font-semibold">{formatINR(monthlyTotal)}</div>
          </div>
          <div className="card p-3">
            <div className="text-xs text-gray-500 mb-1">Annual cost</div>
            <div className="text-xl font-semibold text-amber-400">{formatINR(annualTotal)}</div>
          </div>
        </div>
      )}

      {subs.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          <PlayCircle size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No subscriptions. Track your recurring payments here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {subs.sort((a, b) => a.billingDate - b.billingDate).map(s => {
            const daysUntil = s.billingDate - today
            const renewingSoon = daysUntil >= 0 && daysUntil <= 7 && s.isActive
            return (
              <div key={s.id} className={`card p-4 flex items-center gap-3 ${!s.isActive ? 'opacity-50' : ''} ${renewingSoon ? 'border-amber-500/20' : ''}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold ${s.isActive ? 'bg-purple-500/10 text-purple-400' : 'bg-gray-500/10 text-gray-500'}`}>
                  {s.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{s.name}</span>
                    {renewingSoon && <Bell size={12} className="text-amber-400" />}
                  </div>
                  <div className="text-xs text-gray-500">
                    {s.category} · {s.member} · Bills on {s.billingDate}th
                    {renewingSoon && <span className="text-amber-400 ml-1">· renews in {daysUntil}d</span>}
                  </div>
                </div>
                <div className="text-sm font-medium">{formatINR(s.amount)}/mo</div>
                <button onClick={() => toggleActive(s.id)}
                  className={`text-xs px-2 py-1 rounded-md border transition-colors ${s.isActive ? 'border-green-500/30 text-green-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30' : 'border-gray-600 text-gray-500 hover:border-green-500/30 hover:text-green-400'}`}>
                  {s.isActive ? 'Active' : 'Off'}
                </button>
                <button onClick={() => deleteSub(s.id)} className="text-gray-600 hover:text-red-400">
                  <Trash2 size={14} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
