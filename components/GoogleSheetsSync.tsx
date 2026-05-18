'use client'

import { useState, useEffect } from 'react'
import { 
  getGoogleSheetsConfig,
  saveGoogleSheetsConfig,
  initiateGoogleAuth,
  createExpenseTracker,
  testSheetsConnection,
  isGoogleSheetsSyncEnabled,
  setGoogleSheetsSyncEnabled,
  pullDataFromSheets,
  setupExistingSpreadsheet
} from '@/lib/google-sheets'
import { CheckCircle, XCircle, Download, RefreshCw, ExternalLink, Settings } from 'lucide-react'

export default function GoogleSheetsSync() {
  const [isConnected, setIsConnected] = useState(false)
  const [spreadsheetId, setSpreadsheetId] = useState('')
  const [spreadsheetUrl, setSpreadsheetUrl] = useState('')
  const [manualId, setManualId] = useState('')
  const [testing, setTesting] = useState(false)
  const [creating, setCreating] = useState(false)
  const [pulling, setPulling] = useState(false)
  const [syncEnabled, setSyncEnabled] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<{ ok: boolean; message: string } | null>(null)

  useEffect(() => {
    checkConnection()
    setSyncEnabled(isGoogleSheetsSyncEnabled())
  }, [])

  const checkConnection = () => {
    console.log('🔄 [DEBUG] checkConnection called')
    const config = getGoogleSheetsConfig()
    console.log('📊 [DEBUG] checkConnection config:', config)
    
    const isConnected = !!config?.accessToken
    console.log('🔗 [DEBUG] isConnected:', isConnected)
    setIsConnected(isConnected)
    
    if (config?.spreadsheetId) {
      console.log('📄 [DEBUG] Setting spreadsheet info:', config.spreadsheetId)
      setSpreadsheetId(config.spreadsheetId)
      setSpreadsheetUrl(`https://docs.google.com/spreadsheets/d/${config.spreadsheetId}`)
    } else {
      console.log('❌ [DEBUG] No spreadsheet ID found')
    }
  }

  const handleConnect = () => {
    initiateGoogleAuth()
  }

  const handleCreateSheet = async () => {
    setCreating(true)
    try {
      const newSpreadsheetId = await createExpenseTracker()
      setSpreadsheetId(newSpreadsheetId)
      setSpreadsheetUrl(`https://docs.google.com/spreadsheets/d/${newSpreadsheetId}`)
      alert('Expense tracker spreadsheet created successfully!')
    } catch (error) {
      alert(`Failed to create spreadsheet: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
    setCreating(false)
  }

  const handleManualConnect = async () => {
    if (!manualId.trim()) {
      alert('Please enter a spreadsheet ID')
      return
    }

    // Extract ID from URL if full URL is provided
    const id = manualId.includes('/') ? 
      manualId.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)?.[1] || manualId :
      manualId

    try {
      // Setup headers in the existing spreadsheet
      const setupResult = await setupExistingSpreadsheet(id)
      if (!setupResult.ok) {
        alert(`Failed to setup spreadsheet: ${setupResult.message}`)
        return
      }

      saveGoogleSheetsConfig({ spreadsheetId: id })
      setSpreadsheetId(id)
      setSpreadsheetUrl(`https://docs.google.com/spreadsheets/d/${id}`)
      setManualId('')
      alert('Spreadsheet connected and setup completed! Ready to sync.')
    } catch (error) {
      alert(`Error connecting spreadsheet: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleTest = async () => {
    setTesting(true)
    try {
      const result = await testSheetsConnection()
      setConnectionStatus(result)
    } catch (error) {
      setConnectionStatus({ 
        ok: false, 
        message: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      })
    }
    setTesting(false)
  }

  const handleToggleSync = () => {
    const newEnabled = !syncEnabled
    setSyncEnabled(newEnabled)
    setGoogleSheetsSyncEnabled(newEnabled)
    
    if (newEnabled && !connectionStatus?.ok) {
      alert('Please test your connection first before enabling sync.')
    }
  }

  const handlePull = async () => {
    setPulling(true)
    try {
      const result = await pullDataFromSheets()
      if (result.ok) {
        alert(result.message + '\n\nRefresh the page to see the imported data.')
      } else {
        alert(`Pull failed: ${result.message}`)
      }
    } catch (error) {
      alert(`Pull error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
    setPulling(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          📊 Google Sheets Sync
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Connect your Google Sheets to automatically sync expense data. Every time you add an expense, it will be saved to your spreadsheet in real-time.
        </p>
      </div>

      {!isConnected ? (
        /* Step 1: Authentication */
        <div className="p-4 border rounded-lg bg-blue-50">
          <h4 className="font-medium mb-3 text-blue-800">Step 1: Connect Google Account</h4>
          <p className="text-sm text-blue-700 mb-4">
            Authenticate with Google to access your spreadsheets.
          </p>
          <button
            onClick={handleConnect}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            🔗 Connect Google Account
          </button>
        </div>
      ) : !spreadsheetId ? (
        /* Step 2: Create or Connect Spreadsheet */
        <div className="space-y-4">
          <div className="p-4 border rounded-lg bg-green-50">
            <h4 className="font-medium mb-3 text-green-800">Step 2: Set Up Spreadsheet</h4>
            
            <div className="space-y-4">
              {/* Option 1: Create new */}
              <div>
                <h5 className="text-sm font-medium mb-2">Option 1: Create New Spreadsheet</h5>
                <p className="text-sm text-gray-600 mb-3">
                  Create a new spreadsheet with pre-configured structure for expenses and income.
                </p>
                <button
                  onClick={handleCreateSheet}
                  disabled={creating}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm disabled:opacity-50"
                >
                  {creating ? 'Creating...' : '📝 Create Expense Tracker Sheet'}
                </button>
              </div>

              <div className="border-t pt-4">
                {/* Option 2: Use existing */}
                <h5 className="text-sm font-medium mb-2">Option 2: Use Existing Spreadsheet</h5>
                <p className="text-sm text-gray-600 mb-3">
                  Connect to an existing Google Sheets document by providing its ID or URL.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Spreadsheet ID or full URL"
                    value={manualId}
                    onChange={(e) => setManualId(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <button
                    onClick={handleManualConnect}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    Connect
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Step 3: Manage Connected Spreadsheet */
        <div className="space-y-4">
          {/* Spreadsheet Info */}
          <div className="p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Connected Spreadsheet</h4>
              <a
                href={spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-500 hover:text-blue-700 text-sm"
              >
                Open Sheet <ExternalLink size={14} />
              </a>
            </div>
            <p className="text-sm text-gray-600 font-mono">{spreadsheetId}</p>
          </div>

          {/* Test Connection */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Connection Status</h4>
              <button
                onClick={handleTest}
                disabled={testing}
                className="text-sm bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                {testing ? 'Testing...' : 'Test Connection'}
              </button>
            </div>

            {connectionStatus && (
              <div className={`flex items-center gap-2 text-sm p-3 rounded-lg ${
                connectionStatus.ok 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {connectionStatus.ok ? <CheckCircle size={16} /> : <XCircle size={16} />}
                {connectionStatus.message}
              </div>
            )}
          </div>

          {/* Sync Controls */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-medium">Auto Sync</h4>
                <p className="text-xs text-gray-600">Automatically save expenses and income to Google Sheets</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={syncEnabled}
                  onChange={handleToggleSync}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <button
              onClick={handlePull}
              disabled={pulling || !connectionStatus?.ok}
              className="w-full flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm disabled:opacity-50"
            >
              {pulling ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
              {pulling ? 'Pulling...' : 'Import Data from Google Sheets'}
            </button>
          </div>
        </div>
      )}

      {/* Benefits */}
      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <h4 className="font-medium mb-2 text-yellow-800">✨ Benefits of Google Sheets Sync</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>📊 <strong>Real-time sync</strong> - Every expense automatically appears in your spreadsheet</li>
          <li>👥 <strong>Family collaboration</strong> - Multiple people can view and edit data</li>
          <li>📈 <strong>Advanced analytics</strong> - Create charts and pivot tables in Google Sheets</li>
          <li>📱 <strong>Mobile access</strong> - Edit from Google Sheets mobile app</li>
          <li>🔄 <strong>Automatic formulas</strong> - Pre-built summary calculations</li>
          <li>🔒 <strong>Google backup</strong> - Your data is safely stored in Google Drive</li>
        </ul>
      </div>
    </div>
  )
}