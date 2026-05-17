'use client'
import { useEffect, useState } from 'react'
import { useStore } from '@/lib/store'
import { formatINR, calcTotals, monthLabel, prevMonth, nextMonth, getCurrentMonth, getSubscriptionsRenewingSoon } from '@/lib/utils'
import { SummaryCard } from '@/components/cards/SummaryCard'
import {
  TrendingUp, TrendingDown, PiggyBank, DollarSign, ChevronLeft, ChevronRight,
  AlertTriangle, Bell, Plus, ArrowUpRight, ArrowDownRight
} from 'lucide-react'
import { DonutChart } from '@/components/charts/DonutChart'
import { MonthlyBarChart } from '@/components/charts/MonthlyBarChart'
import { CATEGORY_COLORS } from '@/lib/constants'
import Link from 'next/link'

export default function Dashboard() {
  const { currentMonth, monthData, loading, setCurrentMonth, loadMonth, loadMembers } = useStore()

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

  return (
    <div className="max-w-4xl mx-auto px-4 py-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentMonth(prevMonth(currentMonth))}
            className="w-8 h-8 rounded-lg bg-bg-elevated border border-border flex items-center justify-center hover:bg-white/5">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium text-gray-300 min-w-[120px] text-center">
            {monthLabel(currentMonth)}
          </span>
          <button onClick={() => setCurrentMonth(nextMonth(currentMonth))}
            className="w-8 h-8 rounded-lg bg-bg-elevated border border-border flex items-center justify-center hover:bg-white/5"
            disabled={currentMonth >= getCurrentMonth()}>
            <ChevronRight size={16} className={currentMonth >= getCurrentMonth() ? 'opacity-30' : ''} />
          </button>
        </div>
        <Link href="/add" className="btn btn-primary text-sm py-2 px-3">
          <Plus size={15} /> Add
        </Link>
      </div>

      {/* Alerts */}
      {overBudgetCategories.length > 0 && (
        <div className="card p-3 mb-4 border-red-500/20 bg-red-500/5 flex items-center gap-2 text-sm">
          <AlertTriangle size={15} className="text-red-400 shrink-0" />
          <span className="text-red-300">Budget alert:</span>
          <span className="text-gray-400">{overBudgetCategories.map(([c]) => c).join(', ')} near/over limit</span>
        </div>
      )}
      {renewingSoon.length > 0 && (
        <div className="card p-3 mb-4 border-amber-500/20 bg-amber-500/5 flex items-center gap-2 text-sm">
          <Bell size={15} className="text-amber-400 shrink-0" />
          <span className="text-amber-300">Renewing soon:</span>
          <span className="text-gray-400">{renewingSoon.map(s => s.name).join(', ')}</span>
        </div>
      )}
      {totals.savingsRate >= 20 && (
        <div className="card p-3 mb-4 border-green-500/20 bg-green-500/5 flex items-center gap-2 text-sm">
          <TrendingUp size={15} className="text-green-400 shrink-0" />
          <span className="text-green-300">Great job!</span>
          <span className="text-gray-400">Savings rate is {totals.savingsRate}% this month</span>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[1,2,3,4].map(i => <div key={i} className="card p-4 h-24 animate-pulse bg-white/5" />)}
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3 mb-3">
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
              <div className="flex items-center gap-2 text-gray-400">
                <DollarSign size={14} className="text-orange-400" />
                EMI this month
              </div>
              <span className="font-medium text-orange-400">{formatINR(totals.totalLoans)}</span>
            </div>
          )}

          {/* Charts */}
          {donutData.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="card p-4">
                <h3 className="text-sm font-medium mb-3 text-gray-300">Expense Breakdown</h3>
                <DonutChart data={donutData} />
              </div>
              <div className="card p-4">
                <h3 className="text-sm font-medium mb-3 text-gray-300">Category Spending</h3>
                <div className="space-y-2">
                  {expenseByCategory.map(([cat, amt]) => {
                    const budget = monthData.budgets[cat] || 0
                    const pct = budget > 0 ? Math.min(100, Math.round((amt / budget) * 100)) : 0
                    return (
                      <div key={cat}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-400">{cat}</span>
                          <span className={pct > 90 ? 'text-red-400' : 'text-gray-300'}>{formatINR(amt)}</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
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
          <h3 className="text-sm font-medium text-gray-300">Recent Transactions</h3>
          <Link href={`/report/${currentMonth.split('-')[0]}/${currentMonth.split('-')[1]}`}
            className="text-xs text-blue-400 hover:underline">View all</Link>
        </div>
        {recentTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-600 text-sm">
            No transactions yet.{' '}
            <Link href="/add" className="text-blue-400">Add one →</Link>
          </div>
        ) : (
          <div className="space-y-1">
            {recentTransactions.map((tx) => {
              const colors: Record<string, string> = {
                income: 'text-green-400', expense: 'text-red-400',
                investment: 'text-purple-400', saving: 'text-blue-400'
              }
              const prefix: Record<string, string> = {
                income: '+', expense: '-', investment: '-', saving: '-'
              }
              const label = 'category' in tx ? tx.category : 'source' in tx ? tx.source : 'type' in tx ? tx.type : 'Saving'
              return (
                <div key={tx.id} className="flex items-center gap-3 py-2 border-b border-border-subtle last:border-0">
                  <div className="text-xs text-gray-600 w-14 shrink-0">
                    {new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate">{label}</div>
                    <div className="text-xs text-gray-600">{tx.member}</div>
                  </div>
                  <div className={`text-sm font-medium ${colors[tx.txType]}`}>
                    {prefix[tx.txType]}{formatINR(tx.amount)}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
