import { MonthData, ExpenseEntry, IncomeEntry } from './types'

// Google Sheets API configuration
const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets'
const OAUTH2_SCOPE = 'https://www.googleapis.com/auth/spreadsheets'

export interface GoogleSheetsConfig {
  accessToken: string
  refreshToken: string
  spreadsheetId: string
  expiresAt: number
}

export function getGoogleSheetsConfig(): GoogleSheetsConfig | null {
  console.log('🔍 [DEBUG] getGoogleSheetsConfig called')
  
  if (typeof window === 'undefined') {
    console.log('❌ [DEBUG] Window is undefined (SSR)')
    return null
  }
  
  const accessToken = localStorage.getItem('gs_access_token') || ''
  const refreshToken = localStorage.getItem('gs_refresh_token') || ''
  const spreadsheetId = localStorage.getItem('gs_spreadsheet_id') || ''
  const expiresAt = parseInt(localStorage.getItem('gs_expires_at') || '0')
  
  console.log('📊 [DEBUG] Retrieved from localStorage:', {
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
    hasSpreadsheetId: !!spreadsheetId,
    expiresAt: new Date(expiresAt).toISOString()
  })
  
  if (!accessToken || !spreadsheetId) {
    console.log('❌ [DEBUG] Missing required tokens or spreadsheet ID')
    return null
  }
  
  console.log('✅ [DEBUG] Config found and valid')
  return { accessToken, refreshToken, spreadsheetId, expiresAt }
}

export function saveGoogleSheetsConfig(config: Partial<GoogleSheetsConfig>): void {
  console.log('💾 [DEBUG] saveGoogleSheetsConfig called with:', {
    hasAccessToken: !!config.accessToken,
    hasRefreshToken: !!config.refreshToken,
    hasSpreadsheetId: !!config.spreadsheetId,
    expiresAt: config.expiresAt ? new Date(config.expiresAt).toISOString() : 'none'
  })
  
  if (config.accessToken) {
    localStorage.setItem('gs_access_token', config.accessToken)
    console.log('✅ [DEBUG] Access token saved')
  }
  if (config.refreshToken) {
    localStorage.setItem('gs_refresh_token', config.refreshToken)
    console.log('✅ [DEBUG] Refresh token saved')
  }
  if (config.spreadsheetId) {
    localStorage.setItem('gs_spreadsheet_id', config.spreadsheetId)
    console.log('✅ [DEBUG] Spreadsheet ID saved:', config.spreadsheetId)
  }
  if (config.expiresAt) {
    localStorage.setItem('gs_expires_at', config.expiresAt.toString())
    console.log('✅ [DEBUG] Expires at saved:', new Date(config.expiresAt).toISOString())
  }
}

export function isGoogleSheetsSyncEnabled(): boolean {
  return localStorage.getItem('gs_sync_enabled') === 'true'
}

export function setGoogleSheetsSyncEnabled(enabled: boolean): void {
  localStorage.setItem('gs_sync_enabled', enabled.toString())
}

// Start OAuth flow
export function initiateGoogleAuth(): void {
  const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  if (!CLIENT_ID) {
    throw new Error('Google Client ID not configured')
  }

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  authUrl.searchParams.set('client_id', CLIENT_ID)
  authUrl.searchParams.set('redirect_uri', window.location.origin + '/auth/google/callback')
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('scope', OAUTH2_SCOPE)
  authUrl.searchParams.set('access_type', 'offline')
  authUrl.searchParams.set('prompt', 'consent')

  // Redirect to Google OAuth
  window.location.href = authUrl.toString()
}

// Create spreadsheet with proper structure
export async function createExpenseTracker(): Promise<string> {
  const config = getGoogleSheetsConfig()
  if (!config) throw new Error('Not authenticated with Google')

  const response = await fetch(`${SHEETS_API_BASE}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: 'Family Expense Tracker'
      },
      sheets: [
        { 
          properties: { 
            title: 'Expenses',
            gridProperties: { rowCount: 1000, columnCount: 12 }
          } 
        },
        { 
          properties: { 
            title: 'Income',
            gridProperties: { rowCount: 1000, columnCount: 8 }
          } 
        },
        { 
          properties: { 
            title: 'Summary',
            gridProperties: { rowCount: 50, columnCount: 6 }
          } 
        }
      ]
    })
  })

  if (!response.ok) {
    throw new Error(`Failed to create spreadsheet: ${response.statusText}`)
  }

  const data = await response.json()
  const spreadsheetId = data.spreadsheetId

  // Initialize headers and formulas
  await initializeSpreadsheet(spreadsheetId, config.accessToken)
  
  // Save spreadsheet ID
  saveGoogleSheetsConfig({ spreadsheetId })

  return spreadsheetId
}

async function initializeSpreadsheet(spreadsheetId: string, accessToken: string): Promise<void> {
  const requests = [
    // Expenses sheet headers
    {
      updateCells: {
        range: {
          sheetId: 0,
          startRowIndex: 0,
          endRowIndex: 1,
          startColumnIndex: 0,
          endColumnIndex: 10
        },
        rows: [{
          values: [
            'Date', 'Amount', 'Category', 'Subcategory', 'Member', 
            'Payment Mode', 'Note', 'Is EMI', 'Month', 'Year'
          ].map(header => ({
            userEnteredValue: { stringValue: header },
            userEnteredFormat: { 
              textFormat: { bold: true },
              backgroundColor: { red: 0.9, green: 0.9, blue: 1 }
            }
          }))
        }],
        fields: 'userEnteredValue,userEnteredFormat'
      }
    },
    // Income sheet headers  
    {
      updateCells: {
        range: {
          sheetId: 1,
          startRowIndex: 0,
          endRowIndex: 1,
          startColumnIndex: 0,
          endColumnIndex: 7
        },
        rows: [{
          values: [
            'Date', 'Amount', 'Source', 'Member', 'Note', 'Month', 'Year'
          ].map(header => ({
            userEnteredValue: { stringValue: header },
            userEnteredFormat: { 
              textFormat: { bold: true },
              backgroundColor: { red: 0.9, green: 1, blue: 0.9 }
            }
          }))
        }],
        fields: 'userEnteredValue,userEnteredFormat'
      }
    },
    // Summary sheet setup
    {
      updateCells: {
        range: {
          sheetId: 2,
          startRowIndex: 0,
          endRowIndex: 10,
          startColumnIndex: 0,
          endColumnIndex: 2
        },
        rows: [
          {
            values: [
              { userEnteredValue: { stringValue: 'MONTHLY SUMMARY' }, userEnteredFormat: { textFormat: { bold: true, fontSize: 14 } } },
              { userEnteredValue: { stringValue: '' } }
            ]
          },
          { values: [{ userEnteredValue: { stringValue: '' } }, { userEnteredValue: { stringValue: '' } }] },
          {
            values: [
              { userEnteredValue: { stringValue: 'Total Income' }, userEnteredFormat: { textFormat: { bold: true } } },
              { userEnteredValue: { formulaValue: '=SUMIF(Income!F:F,TEXT(TODAY(),"YYYY-MM"),Income!B:B)' } }
            ]
          },
          {
            values: [
              { userEnteredValue: { stringValue: 'Total Expenses' }, userEnteredFormat: { textFormat: { bold: true } } },
              { userEnteredValue: { formulaValue: '=SUMIF(Expenses!I:I,TEXT(TODAY(),"YYYY-MM"),Expenses!B:B)' } }
            ]
          },
          {
            values: [
              { userEnteredValue: { stringValue: 'Net Savings' }, userEnteredFormat: { textFormat: { bold: true } } },
              { userEnteredValue: { formulaValue: '=B3-B4' } }
            ]
          },
          {
            values: [
              { userEnteredValue: { stringValue: 'Savings Rate' }, userEnteredFormat: { textFormat: { bold: true } } },
              { userEnteredValue: { formulaValue: '=IF(B3>0,B5/B3*100,0)&"%"' } }
            ]
          }
        ],
        fields: 'userEnteredValue,userEnteredFormat'
      }
    }
  ]

  await fetch(`${SHEETS_API_BASE}/${spreadsheetId}:batchUpdate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ requests })
  })
}

// Sync expense to Google Sheets
export async function syncExpenseToSheet(expense: ExpenseEntry): Promise<{ ok: boolean; message: string }> {
  const config = getGoogleSheetsConfig()
  if (!config || !isGoogleSheetsSyncEnabled()) {
    return { ok: false, message: 'Google Sheets not configured or disabled' }
  }

  try {
    const date = new Date(expense.date)
    const month = date.toISOString().slice(0, 7) // YYYY-MM format
    const year = date.getFullYear().toString()

    const row = [
      expense.date,
      expense.amount,
      expense.category,
      expense.subcategory,
      expense.member,
      expense.paymentMode,
      expense.note,
      expense.isEMI ? 'Yes' : 'No',
      month,
      year
    ]

    const response = await fetch(
      `${SHEETS_API_BASE}/${config.spreadsheetId}/values/Expenses!A:J:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [row]
        })
      }
    )

    if (response.ok) {
      return { ok: true, message: 'Expense synced to Google Sheets' }
    } else {
      throw new Error(`Sync failed: ${response.statusText}`)
    }
  } catch (error) {
    return { 
      ok: false, 
      message: `Sync error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}

// Sync income to Google Sheets
export async function syncIncomeToSheet(income: IncomeEntry): Promise<{ ok: boolean; message: string }> {
  const config = getGoogleSheetsConfig()
  if (!config || !isGoogleSheetsSyncEnabled()) {
    return { ok: false, message: 'Google Sheets not configured or disabled' }
  }

  try {
    const date = new Date(income.date)
    const month = date.toISOString().slice(0, 7) // YYYY-MM format
    const year = date.getFullYear().toString()

    const row = [
      income.date,
      income.amount,
      income.source,
      income.member,
      income.note,
      month,
      year
    ]

    const response = await fetch(
      `${SHEETS_API_BASE}/${config.spreadsheetId}/values/Income!A:G:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [row]
        })
      }
    )

    if (response.ok) {
      return { ok: true, message: 'Income synced to Google Sheets' }
    } else {
      throw new Error(`Sync failed: ${response.statusText}`)
    }
  } catch (error) {
    return { 
      ok: false, 
      message: `Sync error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}

// Pull all data from Google Sheets
export async function pullDataFromSheets(): Promise<{ ok: boolean; message: string; data?: Record<string, MonthData> }> {
  const config = getGoogleSheetsConfig()
  if (!config) {
    return { ok: false, message: 'Google Sheets not configured' }
  }

  try {
    // Fetch expenses and income data
    const [expensesResponse, incomeResponse] = await Promise.all([
      fetch(`${SHEETS_API_BASE}/${config.spreadsheetId}/values/Expenses!A2:J`, {
        headers: { 'Authorization': `Bearer ${config.accessToken}` }
      }),
      fetch(`${SHEETS_API_BASE}/${config.spreadsheetId}/values/Income!A2:G`, {
        headers: { 'Authorization': `Bearer ${config.accessToken}` }
      })
    ])

    if (!expensesResponse.ok || !incomeResponse.ok) {
      throw new Error('Failed to fetch data from sheets')
    }

    const expensesData = await expensesResponse.json()
    const incomeData = await incomeResponse.json()

    // Group data by month
    const monthlyData: Record<string, MonthData> = {}

    // Process expenses
    const expenseRows = expensesData.values || []
    expenseRows.forEach((row: string[]) => {
      if (row.length >= 9 && row[8]) {
        const month = row[8]
        if (!monthlyData[month]) {
          monthlyData[month] = {
            month,
            income: [],
            expenses: [],
            investments: [],
            savings: [],
            loans: [],
            subscriptions: [],
            goals: [],
            budgets: {}
          }
        }

        monthlyData[month].expenses.push({
          id: `sheet-${Date.now()}-${Math.random()}`,
          date: row[0] || '',
          amount: parseFloat(row[1]) || 0,
          category: row[2] || '',
          subcategory: row[3] || '',
          member: row[4] || '',
          paymentMode: row[5] || '',
          note: row[6] || '',
          isEMI: row[7] === 'Yes'
        })
      }
    })

    // Process income
    const incomeRows = incomeData.values || []
    incomeRows.forEach((row: string[]) => {
      if (row.length >= 6 && row[5]) {
        const month = row[5]
        if (!monthlyData[month]) {
          monthlyData[month] = {
            month,
            income: [],
            expenses: [],
            investments: [],
            savings: [],
            loans: [],
            subscriptions: [],
            goals: [],
            budgets: {}
          }
        }

        monthlyData[month].income.push({
          id: `sheet-${Date.now()}-${Math.random()}`,
          date: row[0] || '',
          amount: parseFloat(row[1]) || 0,
          source: row[2] || '',
          member: row[3] || '',
          note: row[4] || ''
        })
      }
    })

    // Save to localStorage
    Object.entries(monthlyData).forEach(([month, data]) => {
      localStorage.setItem(`expense_data_${month}`, JSON.stringify(data, null, 2))
    })

    return {
      ok: true,
      message: `Successfully pulled ${Object.keys(monthlyData).length} months from Google Sheets`,
      data: monthlyData
    }
  } catch (error) {
    return {
      ok: false,
      message: `Pull failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

// Test connection
export async function testSheetsConnection(): Promise<{ ok: boolean; message: string }> {
  const config = getGoogleSheetsConfig()
  if (!config) {
    return { ok: false, message: 'Not configured' }
  }

  try {
    const response = await fetch(
      `${SHEETS_API_BASE}/${config.spreadsheetId}`,
      {
        headers: { 'Authorization': `Bearer ${config.accessToken}` }
      }
    )

    if (response.ok) {
      const data = await response.json()
      return { ok: true, message: `Connected to "${data.properties.title}"` }
    } else if (response.status === 404) {
      return { ok: false, message: 'Spreadsheet not found' }
    } else {
      return { ok: false, message: `Connection failed: ${response.statusText}` }
    }
  } catch (error) {
    return { ok: false, message: 'Network error' }
  }
}