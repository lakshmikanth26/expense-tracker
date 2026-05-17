'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getMonthData } from '@/lib/github'
import { MonthData } from '@/lib/types'
import { emptyMonthData, calcTotals, monthLabel, formatINR } from '@/lib/utils'
import { CATEGORY_COLORS } from '@/lib/constants'
import { DonutChart } from '@/components/charts/DonutChart'
import { SummaryCard } from '@/components/cards/SummaryCard'
import { ArrowUpRight, ArrowDownRight, TrendingUp, PiggyBank, Download, Trash2 } from 'lucide-react'
import { useStore } from '@/lib/store'
import { toast } from '@/components/ui/Toaster'

export default function MonthlyReport() {
  const { year, month } = useParams<{ year: string; month: string }>()
  const monthKey = `${year}-${month}`
  const [data, setData] = useState<MonthData>(emptyMonthData(monthKey))
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('overview')
  const { saveMonth } = useStore()

  useEffect(() => {
    setLoading(true)
    getMonthData(monthKey).then(d => { setData(d); setLoading(false) })
  }, [monthKey])

  const totals = calcTotals(data)

  const expByCategory = Object.entries(
    data.expenses.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + e.amount; return acc }, {} as Record<string, number>)
  ).sort((a, b) => b[1] - a[1])

  const memberSpend = Object.entries(
    data.expenses.reduce((acc, e) => { acc[e.member] = (acc[e.member] || 0) + e.amount; return acc }, {} as Record<string, number>)
  )

  const paymentModes = Object.entries(
    data.expenses.reduce((acc, e) => { acc[e.paymentMode] = (acc[e.paymentMode] || 0) + e.amount; return acc }, {} as Record<string, number>)
  )

  const deleteExpense = async (id: string) => {
    const updated = { ...data, expenses: data.expenses.filter(e => e.id !== id) }
    setData(updated)
    await saveMonth(updated)
    toast('Deleted', 'success')
  }

  const exportCSV = () => {
    const rows = [
      ['Type', 'Date', 'Amount', 'Category/Source', 'Member', 'Note'],
      ...data.expenses.map(e => ['Expense', e.date, e.amount, e.category, e.member, e.note]),
      ...data.income.map(e => ['Income', e.date, e.amount, e.source, e.member, e.note]),
      ...data.investments.map(e => ['Investment', e.date, e.amount, e.type, e.member, e.note]),
      ...data.savings.map(e => ['Saving', e.date, e.amount, e.type, e.member, e.note]),
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${monthKey}.csv`; a.click()
  }

  const sections = ['overview', 'expenses', 'income', 'investments', 'transactions']

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-5"><div className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 card" />)}</div></div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-5">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-semibold">{monthLabel(monthKey)}</h1>
        <button onClick={exportCSV} className="btn btn-ghost text-xs py-1.5 px-3">
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Section nav */}
      <div className="flex gap-1 overflow-x-auto mb-5">
        {sections.map(s => (
          <button key={s} onClick={() => setActiveSection(s)}
            className={`px-3 py-1.5 text-xs rounded-lg capitalize whitespace-nowrap transition-colors ${
              activeSection === s ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white bg-bg-elevated'
            }`}>
            {s}
          </button>
        ))}
      </div>

      {activeSection === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <SummaryCard label="Income" value={formatINR(totals.totalIncome)} icon={<ArrowUpRight size={16} className="text-green-400" />} color="bg-green-500/10" />
            <SummaryCard label="Expenses" value={formatINR(totals.totalExpenses)} icon={<ArrowDownRight size={16} className="text-red-400" />} color="bg-red-500/10" />
            <SummaryCard label="Invested" value={formatINR(totals.totalInvestments)} icon={<TrendingUp size={16} className="text-purple-400" />} color="bg-purple-500/10" />
            <SummaryCard label="Net Savings" value={formatINR(totals.netSavings)} icon={<PiggyBank size={16} className="text-blue-400" />} color="bg-blue-500/10" sub={`${totals.savingsRate}% rate`} />
          </div>

          {expByCategory.length > 0 && (
            <div className="card p-4">
              <h3 className="text-sm font-medium mb-3">Expense Breakdown</h3>
              <DonutChart data={expByCategory.map(([name, value]) => ({ name, value, color: CATEGORY_COLORS[name] || '#6b7280' }))} />
            </div>
          )}

          {memberSpend.length > 0 && (
            <div className="card p-4">
              <h3 className="text-sm font-medium mb-3">Member Spending</h3>
              {memberSpend.map(([member, amt]) => (
                <div key={member} className="flex justify-between py-1.5 text-sm border-b border-border-subtle last:border-0">
                  <span className="text-gray-400">{member}</span>
                  <span className="text-red-400">{formatINR(amt)}</span>
                </div>
              ))}
            </div>
          )}

          {paymentModes.length > 0 && (
            <div className="card p-4">
              <h3 className="text-sm font-medium mb-3">Payment Modes</h3>
              {paymentModes.map(([mode, amt]) => (
                <div key={mode} className="flex justify-between py-1.5 text-sm border-b border-border-subtle last:border-0">
                  <span className="text-gray-400">{mode}</span>
                  <span>{formatINR(amt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeSection === 'expenses' && (
        <div className="card p-4 space-y-3">
          <h3 className="text-sm font-medium">Budget vs Actual</h3>
          {Object.entries(data.budgets).map(([cat, budget]) => {
            const spent = data.expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0)
            const pct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0
            const over = spent > budget
            return (
              <div key={cat}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">{cat}</span>
                  <span className={over ? 'text-red-400' : 'text-gray-300'}>
                    {formatINR(spent)} / {formatINR(budget)}
                    {over && <span className="text-red-400 ml-1">OVER!</span>}
                  </span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: over ? '#ef4444' : (CATEGORY_COLORS[cat] || '#3b82f6') }} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {activeSection === 'income' && (
        <div className="card p-4">
          <h3 className="text-sm font-medium mb-3">Income Sources</h3>
          {data.income.length === 0
            ? <p className="text-gray-600 text-sm">No income entries</p>
            : data.income.map(e => (
              <div key={e.id} className="flex justify-between items-center py-2 border-b border-border-subtle last:border-0">
                <div>
                  <div className="text-sm">{e.source}</div>
                  <div className="text-xs text-gray-500">{e.member} · {e.date}</div>
                </div>
                <span className="text-green-400 font-medium">{formatINR(e.amount)}</span>
              </div>
            ))
          }
        </div>
      )}

      {activeSection === 'investments' && (
        <div className="card p-4">
          <h3 className="text-sm font-medium mb-3">Investments This Month</h3>
          {data.investments.length === 0
            ? <p className="text-gray-600 text-sm">No investments recorded</p>
            : data.investments.map(e => (
              <div key={e.id} className="flex justify-between items-center py-2 border-b border-border-subtle last:border-0">
                <div>
                  <div className="text-sm">{e.type}</div>
                  <div className="text-xs text-gray-500">{e.schemeName || e.member} · {e.date}</div>
                </div>
                <span className="text-purple-400 font-medium">{formatINR(e.amount)}</span>
              </div>
            ))
          }
          <div className="mt-3 pt-3 border-t border-border-subtle flex justify-between">
            <span className="text-sm text-gray-400">Total Invested</span>
            <span className="text-purple-400 font-semibold">{formatINR(totals.totalInvestments)}</span>
          </div>
        </div>
      )}

      {activeSection === 'transactions' && (
        <div className="card p-4">
          <h3 className="text-sm font-medium mb-3">All Expenses</h3>
          {data.expenses.length === 0
            ? <p className="text-gray-600 text-sm">No expenses</p>
            : data.expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(e => (
              <div key={e.id} className="flex items-center gap-3 py-2 border-b border-border-subtle last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{e.subcategory || e.category}</div>
                  <div className="text-xs text-gray-500">{e.date} · {e.member} · {e.paymentMode}</div>
                  {e.note && <div className="text-xs text-gray-600 italic">{e.note}</div>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-400 text-sm font-medium">{formatINR(e.amount)}</span>
                  <button onClick={() => deleteExpense(e.id)} className="text-gray-600 hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          }
        </div>
      )}
    </div>
  )
}
