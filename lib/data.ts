import { MonthData, ExpenseEntry, IncomeEntry, InvestmentEntry, SavingEntry, LoanEntry, SubscriptionEntry, GoalEntry } from './types'
import { emptyMonthData } from './utils'
import { syncExpenseToSheet, syncIncomeToSheet, isGoogleSheetsSyncEnabled } from './google-sheets'

/**
 * Local data management for expense tracker
 * Uses JSON files stored in the data/ directory
 */

export async function getMonthData(month: string): Promise<MonthData> {
  try {
    // First, try to load from localStorage (primary storage)
    if (typeof window !== 'undefined') {
      const dataKey = `expense_data_${month}`
      const localData = localStorage.getItem(dataKey)
      if (localData) {
        try {
          return JSON.parse(localData) as MonthData
        } catch {
          // If parsing fails, continue to other sources
        }
      }
    }

    // Fallback to public data files (for deployed static data)
    try {
      const response = await fetch(`/data/${month}.json`)
      if (response.ok) {
        const data = await response.json()
        return data as MonthData
      }
    } catch {
      // If fetch fails, continue to empty data
    }

    // Return empty data if no source is available
    return emptyMonthData(month)
  } catch (error) {
    console.warn(`Failed to load data for ${month}:`, error)
    return emptyMonthData(month)
  }
}

export async function saveMonthData(month: string, data: MonthData): Promise<boolean> {
  try {
    if (typeof window !== 'undefined') {
      // Get previous data to compare
      const dataKey = `expense_data_${month}`
      const previousDataStr = localStorage.getItem(dataKey)
      const previousData: MonthData = previousDataStr ? JSON.parse(previousDataStr) : emptyMonthData(month)
      
      // Save to localStorage first
      localStorage.setItem(dataKey, JSON.stringify(data, null, 2))
      console.log(`Data saved locally for ${month}`)

      // Sync new entries to Google Sheets if enabled
      if (isGoogleSheetsSyncEnabled()) {
        try {
          // Find new expenses (compare with previous data)
          const newExpenses = data.expenses.filter(expense => 
            !previousData.expenses.some(prev => prev.id === expense.id)
          )
          
          // Find new income (compare with previous data)
          const newIncome = data.income.filter(income => 
            !previousData.income.some(prev => prev.id === income.id)
          )

          // Sync new entries
          for (const expense of newExpenses) {
            await syncExpenseToSheet(expense)
          }
          
          for (const income of newIncome) {
            await syncIncomeToSheet(income)
          }

          if (newExpenses.length > 0 || newIncome.length > 0) {
            console.log(`Synced ${newExpenses.length} expenses and ${newIncome.length} income entries to Google Sheets`)
          }
        } catch (syncError) {
          console.warn(`Google Sheets sync error for ${month}:`, syncError)
          // Still return true since local save succeeded
        }
      }

      return true
    }
    return false
  } catch (error) {
    console.error(`Failed to save data for ${month}:`, error)
    return false
  }
}

export async function getAvailableMonths(): Promise<string[]> {
  const months: string[] = []
  
  try {
    // First, get months from localStorage
    if (typeof window !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('expense_data_')) {
          months.push(key.replace('expense_data_', ''))
        }
      }
    }

    // Also try to get months from public manifest (for static data)
    try {
      const response = await fetch('/data/manifest.json')
      if (response.ok) {
        const manifest = await response.json()
        const staticMonths = manifest.months || []
        // Merge with localStorage months, removing duplicates
        staticMonths.forEach((month: string) => {
          if (!months.includes(month)) {
            months.push(month)
          }
        })
      }
    } catch {
      // Ignore fetch errors
    }

    return months.sort()
  } catch {
    return months.sort()
  }
}

export function downloadMonthData(month: string, data: MonthData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `${month}.json`
  link.click()
  
  URL.revokeObjectURL(url)
}

export function uploadMonthData(file: File): Promise<MonthData | null> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        resolve(data as MonthData)
      } catch {
        resolve(null)
      }
    }
    reader.onerror = () => resolve(null)
    reader.readAsText(file)
  })
}

// Backup all data to a single file
export function downloadAllData(): void {
  const allData: Record<string, MonthData> = {}
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith('expense_data_')) {
      const month = key.replace('expense_data_', '')
      const data = localStorage.getItem(key)
      if (data) {
        try {
          allData[month] = JSON.parse(data)
        } catch {
          // Skip invalid data
        }
      }
    }
  }
  
  const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `expense-tracker-backup-${new Date().toISOString().split('T')[0]}.json`
  link.click()
  
  URL.revokeObjectURL(url)
}

// Delete functions for different entry types
export async function deleteExpense(month: string, expenseId: string): Promise<boolean> {
  try {
    const data = await getMonthData(month)
    data.expenses = data.expenses.filter(expense => expense.id !== expenseId)
    return await saveMonthData(month, data)
  } catch (error) {
    console.error(`Failed to delete expense ${expenseId}:`, error)
    return false
  }
}

export async function deleteIncome(month: string, incomeId: string): Promise<boolean> {
  try {
    const data = await getMonthData(month)
    data.income = data.income.filter(income => income.id !== incomeId)
    return await saveMonthData(month, data)
  } catch (error) {
    console.error(`Failed to delete income ${incomeId}:`, error)
    return false
  }
}

export async function deleteInvestment(month: string, investmentId: string): Promise<boolean> {
  try {
    const data = await getMonthData(month)
    data.investments = data.investments.filter(investment => investment.id !== investmentId)
    return await saveMonthData(month, data)
  } catch (error) {
    console.error(`Failed to delete investment ${investmentId}:`, error)
    return false
  }
}

export async function deleteSaving(month: string, savingId: string): Promise<boolean> {
  try {
    const data = await getMonthData(month)
    data.savings = data.savings.filter(saving => saving.id !== savingId)
    return await saveMonthData(month, data)
  } catch (error) {
    console.error(`Failed to delete saving ${savingId}:`, error)
    return false
  }
}

export async function deleteLoan(month: string, loanId: string): Promise<boolean> {
  try {
    const data = await getMonthData(month)
    data.loans = data.loans.filter(loan => loan.id !== loanId)
    return await saveMonthData(month, data)
  } catch (error) {
    console.error(`Failed to delete loan ${loanId}:`, error)
    return false
  }
}

export async function deleteSubscription(subscriptionId: string): Promise<boolean> {
  try {
    // Subscriptions are stored differently, need to find which month contains it
    const months = await getAvailableMonths()
    for (const month of months) {
      const data = await getMonthData(month)
      const originalLength = data.subscriptions.length
      data.subscriptions = data.subscriptions.filter(sub => sub.id !== subscriptionId)
      if (data.subscriptions.length < originalLength) {
        await saveMonthData(month, data)
        return true
      }
    }
    return false
  } catch (error) {
    console.error(`Failed to delete subscription ${subscriptionId}:`, error)
    return false
  }
}

export async function deleteGoal(goalId: string): Promise<boolean> {
  try {
    // Goals are stored differently, need to find which month contains it
    const months = await getAvailableMonths()
    for (const month of months) {
      const data = await getMonthData(month)
      const originalLength = data.goals.length
      data.goals = data.goals.filter(goal => goal.id !== goalId)
      if (data.goals.length < originalLength) {
        await saveMonthData(month, data)
        return true
      }
    }
    return false
  } catch (error) {
    console.error(`Failed to delete goal ${goalId}:`, error)
    return false
  }
}