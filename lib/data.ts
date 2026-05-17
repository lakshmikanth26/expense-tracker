import { MonthData } from './types'
import { emptyMonthData } from './utils'

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
      const dataKey = `expense_data_${month}`
      localStorage.setItem(dataKey, JSON.stringify(data, null, 2))
      console.log(`Data saved locally for ${month}`)
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