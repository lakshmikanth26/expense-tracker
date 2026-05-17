import { MonthData } from './types'
import { EMPTY_MONTH_DATA } from './constants'

export function formatINR(amount: number): string {
  return '₹' + Math.abs(amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })
}

export function formatINRCompact(amount: number): string {
  if (amount >= 10000000) return '₹' + (amount / 10000000).toFixed(1) + 'Cr'
  if (amount >= 100000) return '₹' + (amount / 100000).toFixed(1) + 'L'
  if (amount >= 1000) return '₹' + (amount / 1000).toFixed(1) + 'K'
  return '₹' + amount.toLocaleString('en-IN')
}

export function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function monthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`
}

export function parseMonthKey(key: string): { year: number; month: number } {
  const [y, m] = key.split('-')
  return { year: parseInt(y), month: parseInt(m) }
}

export function monthLabel(key: string): string {
  const { year, month } = parseMonthKey(key)
  const d = new Date(year, month - 1, 1)
  return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
}

export function shortMonthLabel(key: string): string {
  const { year, month } = parseMonthKey(key)
  const d = new Date(year, month - 1, 1)
  return d.toLocaleDateString('en-IN', { month: 'short' })
}

export function prevMonth(key: string): string {
  const { year, month } = parseMonthKey(key)
  const d = new Date(year, month - 2, 1)
  return monthKey(d.getFullYear(), d.getMonth() + 1)
}

export function nextMonth(key: string): string {
  const { year, month } = parseMonthKey(key)
  const d = new Date(year, month, 1)
  return monthKey(d.getFullYear(), d.getMonth() + 1)
}

export function isCurrentOrPast(key: string): boolean {
  return key <= getCurrentMonth()
}

export function calcTotals(data: MonthData) {
  const totalIncome = data.income.reduce((s, e) => s + e.amount, 0)
  const totalExpenses = data.expenses.reduce((s, e) => s + e.amount, 0)
  const totalInvestments = data.investments.reduce((s, e) => s + e.amount, 0)
  const totalSavings = data.savings.reduce((s, e) => s + e.amount, 0)
  const totalLoans = data.loans.reduce((s, e) => s + e.emiAmount, 0)
  const netSavings = totalIncome - totalExpenses - totalLoans
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0
  return { totalIncome, totalExpenses, totalInvestments, totalSavings, totalLoans, netSavings, savingsRate }
}

export function emptyMonthData(month: string): MonthData {
  return { month, ...JSON.parse(JSON.stringify(EMPTY_MONTH_DATA)) }
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

export function getSubscriptionsRenewingSoon(subs: MonthData['subscriptions'], days = 7): MonthData['subscriptions'] {
  const today = new Date()
  const todayDay = today.getDate()
  return subs.filter(s => {
    if (!s.isActive) return false
    const diff = s.billingDate - todayDay
    return diff >= 0 && diff <= days
  })
}
