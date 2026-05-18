'use client'
import { useEffect, useState } from 'react'
import { useStore } from '@/lib/store'
import { formatINR, calcTotals, monthLabel, prevMonth, nextMonth, getCurrentMonth, getSubscriptionsRenewingSoon } from '@/lib/utils'
import { SummaryCard } from '@/components/cards/SummaryCard'
import { deleteExpense, deleteIncome, deleteInvestment, deleteSaving } from '@/lib/data'
import {
  TrendingUp, TrendingDown, PiggyBank, DollarSign, ChevronLeft, ChevronRight,
  AlertTriangle, Bell, Plus, ArrowUpRight, ArrowDownRight, Trash2
} from 'lucide-react'
import { DonutChart } from '@/components/charts/DonutChart'
import { MonthlyBarChart } from '@/components/charts/MonthlyBarChart'
import { CATEGORY_COLORS } from '@/lib/constants'
import Link from 'next/link'

export default function Dashboard() {
  const { currentMonth, monthData, loading, setCurrentMonth, loadMonth, loadMembers } = useStore()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    loadMembers()
    loadMonth(getCurrentMonth())
  }, [])

  const totals = calcTotals(monthData)

  const expenseByCategory = Object.entries(
    monthData.expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount
      return acc
    }, {} as Record<string, number>)
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)

  const donutData = expenseByCategory.map(([name, value]) => ({
    name, value, color: CATEGORY_COLORS[name] || '#6b7280'
  }))

  const renewingSoon = getSubscriptionsRenewingSoon(monthData.subscriptions)

  const overBudgetCategories = Object.entries(monthData.budgets).filter(([cat, budget]) => {
    const spent = monthData.expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0)
    return spent > budget * 0.9
  })

  const recentTransactions = [
    ...monthData.expenses.map(e => ({ ...e, txType: 'expense' as const })),
    ...monthData.income.map(e => ({ ...e, txType: 'income' as const })),
    ...monthData.investments.map(e => ({ ...e, txType: 'investment' as const })),
    ...monthData.savings.map(e => ({ ...e, txType: 'saving' as const })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)

  const handleDeleteTransaction = async (id: string, txType: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return
    
    setDeletingId(id)
    try {
      let success = false
      
      switch(txType) {
        case 'expense':
          success = await deleteExpense(currentMonth, id)
          break
        case 'income':
          success = await deleteIncome(currentMonth, id)
          break
        case 'investment':
          success = await deleteInvestment(currentMonth, id)
          break
        case 'saving':
          success = await deleteSaving(currentMonth, id)
          break
      }
      
      if (success) {
        await loadMonth(currentMonth) // Refresh data
      } else {
        alert('Failed to delete transaction')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete transaction')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <h1 className="text-xl sm:text-2xl font-bold text-blue-900">Dashboard</h1>
        <div className="flex items-center justify-between w-full sm:w-auto gap-2">
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentMonth(prevMonth(currentMonth))}
              className="w-8 h-8 rounded-lg bg-white/50 border border-blue-200 flex items-center justify-center hover:bg-blue-50 text-blue-600">
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-medium text-blue-800 min-w-[120px] text-center">
              {monthLabel(currentMonth)}
            </span>
            <button onClick={() => setCurrentMonth(nextMonth(currentMonth))}
              className="w-8 h-8 rounded-lg bg-white/50 border border-blue-200 flex items-center justify-center hover:bg-blue-50 text-blue-600"
              disabled={currentMonth >= getCurrentMonth()}>
              <ChevronRight size={16} className={currentMonth >= getCurrentMonth() ? 'opacity-30' : ''} />
            </button>
          </div>
          <Link href="/add" className="btn btn-primary text-sm py-2 px-3 whitespace-nowrap">
            <Plus size={15} /> <span className="hidden sm:inline">Add</span>
          </Link>
        </div>
      </div>

      {/* Alerts */}
      {overBudgetCategories.length > 0 && (
        <div className="card p-3 mb-4 border-red-300 bg-red-50/80 flex items-center gap-2 text-sm">
          <AlertTriangle size={15} className="text-red-600 shrink-0" />
          <span className="text-red-800 font-medium">Budget alert:</span>
          <span className="text-red-600">{overBudgetCategories.map(([c]) => c).join(', ')} near/over limit</span>
        </div>
      )}
      {renewingSoon.length > 0 && (
        <div className="card p-3 mb-4 border-amber-300 bg-amber-50/80 flex items-center gap-2 text-sm">
          <Bell size={15} className="text-amber-600 shrink-0" />
          <span className="text-amber-800 font-medium">Renewing soon:</span>
          <span className="text-amber-600">{renewingSoon.map(s => s.name).join(', ')}</span>
        </div>
      )}
      {totals.savingsRate >= 20 && (
        <div className="card p-3 mb-4 border-green-300 bg-green-50/80 flex items-center gap-2 text-sm">
          <TrendingUp size={15} className="text-green-600 shrink-0" />
          <span className="text-green-800 font-medium">Great job!</span>
          <span className="text-green-600">Savings rate is {totals.savingsRate}% this month</span>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {[1,2,3,4].map(i => <div key={i} className="card p-4 h-24 animate-pulse bg-blue-50/50" />)}
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <SummaryCard label="Income" value={formatINR(totals.totalIncome)}
              icon={<ArrowUpRight size={16} className="text-green-400" />}
              color="bg-green-500/10" />
            <SummaryCard label="Expenses" value={formatINR(totals.totalExpenses)}
              icon={<ArrowDownRight size={16} className="text-red-400" />}
              color="bg-red-500/10" />
            <SummaryCard label="Invested" value={formatINR(totals.totalInvestments)}
              icon={<TrendingUp size={16} className="text-purple-400" />}
              color="bg-purple-500/10" />
            <SummaryCard label="Net Savings" value={formatINR(totals.netSavings)}
              icon={<PiggyBank size={16} className="text-blue-400" />}
              color="bg-blue-500/10"
              sub={`${totals.savingsRate}% savings rate`} />
          </div>

          {/* EMI summary */}
          {totals.totalLoans > 0 && (
            <div className="card p-3 mb-4 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-orange-600">
                <DollarSign size={14} className="text-orange-600" />
                EMI this month
              </div>
              <span className="font-medium text-orange-700">{formatINR(totals.totalLoans)}</span>
            </div>
          )}

          {/* Charts */}
          {donutData.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <div className="card p-4">
                <h3 className="text-sm font-medium mb-3 text-blue-800">Expense Breakdown</h3>
                <DonutChart data={donutData} />
              </div>
              <div className="card p-4">
                <h3 className="text-sm font-medium mb-3 text-blue-800">Category Spending</h3>
                <div className="space-y-2">
                  {expenseByCategory.map(([cat, amt]) => {
                    const budget = monthData.budgets[cat] || 0
                    const pct = budget > 0 ? Math.min(100, Math.round((amt / budget) * 100)) : 0
                    return (
                      <div key={cat}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-blue-600">{cat}</span>
                          <span className={pct > 90 ? 'text-red-600' : 'text-blue-800 font-medium'}>{formatINR(amt)}</span>
                        </div>
                        <div className="h-1.5 bg-blue-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${pct > 90 ? 'bg-red-500' : 'bg-blue-500'}`}
                            style={{ width: `${pct}%`, backgroundColor: pct <= 90 ? (CATEGORY_COLORS[cat] || '#3b82f6') : undefined }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Recent transactions */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-blue-800">Recent Transactions</h3>
          <Link href={`/report/${currentMonth.split('-')[0]}/${currentMonth.split('-')[1]}`}
            className="text-xs text-blue-600 hover:underline">View all</Link>
        </div>
        {recentTransactions.length === 0 ? (
          <div className="text-center py-8 text-blue-600 text-sm">
            No transactions yet.{' '}
            <Link href="/add" className="text-blue-700 font-medium hover:underline">Add one →</Link>
          </div>
        ) : (
          <div className="space-y-1">
            {recentTransactions.map((tx) => {
              const colors: Record<string, string> = {
                income: 'text-green-600', expense: 'text-red-600',
                investment: 'text-purple-600', saving: 'text-blue-600'
              }
              const prefix: Record<string, string> = {
                income: '+', expense: '-', investment: '-', saving: '-'
              }
              const label = 'category' in tx ? tx.category : 'source' in tx ? tx.source : 'type' in tx ? tx.type : 'Saving'
              return (
                <div key={tx.id} className="flex items-center gap-3 py-2 border-b border-blue-200/50 last:border-0 group">
                  <div className="text-xs text-blue-600 w-14 shrink-0">
                    {new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate text-blue-800 font-medium">{label}</div>
                    <div className="text-xs text-blue-600">{tx.member}</div>
                  </div>
                  <div className={`text-sm font-semibold ${colors[tx.txType]}`}>
                    {prefix[tx.txType]}{formatINR(tx.amount)}
                  </div>
                  <button
                    onClick={() => handleDeleteTransaction(tx.id, tx.txType)}
                    disabled={deletingId === tx.id}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded text-red-500 hover:text-red-700 disabled:opacity-50"
                    title="Delete transaction"
                  >
                    {deletingId === tx.id ? (
                      <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
