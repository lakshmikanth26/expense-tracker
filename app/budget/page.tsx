'use client'
import { useState } from 'react'
import { useStore } from '@/lib/store'
import { formatINR } from '@/lib/utils'
import { CATEGORY_COLORS } from '@/lib/constants'
import { toast } from '@/components/ui/Toaster'
import { Edit2, Check } from 'lucide-react'

export default function BudgetPage() {
  const { monthData, saveMonth } = useStore()
  const [editing, setEditing] = useState<string | null>(null)
  const [editVal, setEditVal] = useState('')

  const totalBudget = Object.values(monthData.budgets).reduce((s, v) => s + v, 0)
  const totalSpent = monthData.expenses.reduce((s, e) => s + e.amount, 0)

  const saveBudget = async (cat: string) => {
    const val = parseFloat(editVal)
    if (isNaN(val) || val < 0) return toast('Invalid amount', 'error')
    const updated = { ...monthData, budgets: { ...monthData.budgets, [cat]: val } }
    await saveMonth(updated)
    setEditing(null)
    toast('Budget updated', 'success')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-5">
      <h1 className="text-lg font-semibold mb-5">Budget Planner</h1>

      {/* Overall */}
      <div className="card p-4 mb-5">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Total Budget</span>
          <span>{formatINR(totalBudget)}</span>
        </div>
        <div className="flex justify-between text-sm mb-3">
          <span className="text-gray-400">Total Spent</span>
          <span className={totalSpent > totalBudget ? 'text-red-400' : 'text-green-400'}>{formatINR(totalSpent)}</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-blue-500 transition-all"
            style={{ width: `${Math.min(100, Math.round((totalSpent / totalBudget) * 100))}%`, backgroundColor: totalSpent > totalBudget ? '#ef4444' : '#3b82f6' }} />
        </div>
        <div className="text-xs text-gray-500 mt-2 text-right">
          {Math.round((totalSpent / totalBudget) * 100)}% of budget used
        </div>
      </div>

      {/* Per category */}
      <div className="space-y-2">
        {Object.entries(monthData.budgets).map(([cat, budget]) => {
          const spent = monthData.expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0)
          const pct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0
          const over = spent > budget
          const color = CATEGORY_COLORS[cat] || '#3b82f6'

          return (
            <div key={cat} className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-sm font-medium">{cat}</span>
                </div>
                <div className="flex items-center gap-2">
                  {editing === cat ? (
                    <>
                      <span className="text-gray-500 text-sm">₹</span>
                      <input className="w-24 text-sm py-1 px-2" type="number" value={editVal}
                        onChange={e => setEditVal(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && saveBudget(cat)} autoFocus />
                      <button onClick={() => saveBudget(cat)} className="text-green-400"><Check size={14} /></button>
                    </>
                  ) : (
                    <>
                      <span className="text-xs text-gray-400">Budget: {formatINR(budget)}</span>
                      <button onClick={() => { setEditing(cat); setEditVal(String(budget)) }} className="text-gray-600 hover:text-white">
                        <Edit2 size={13} />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-gray-500">Spent: <span className={over ? 'text-red-400' : 'text-white'}>{formatINR(spent)}</span></span>
                <span className={over ? 'text-red-400 font-medium' : 'text-gray-500'}>
                  {over ? `Over by ${formatINR(spent - budget)}` : `${formatINR(budget - spent)} left`}
                </span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: over ? '#ef4444' : color }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
