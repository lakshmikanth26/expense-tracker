'use client'

import { useState } from 'react'
import { downloadMonthData, uploadMonthData, downloadAllData } from '@/lib/data'
import { useStore } from '@/lib/store'
import { MonthData } from '@/lib/types'

export default function DataManager() {
  const [uploading, setUploading] = useState(false)
  const { monthData, saveMonth } = useStore()

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const data = await uploadMonthData(file)
      if (data) {
        await saveMonth(data)
        alert(`Successfully uploaded data for ${data.month}`)
      } else {
        alert('Failed to parse uploaded file. Please check the format.')
      }
    } catch (error) {
      alert('Error uploading file: ' + (error as Error).message)
    }
    setUploading(false)
    
    // Clear the input
    event.target.value = ''
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Data Management</h3>
        <p className="text-sm text-gray-600 mb-4">
          Your expense data is stored locally in your browser and as downloadable JSON files. 
          Use the options below to backup and restore your data.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Download current month */}
        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-2">Download Current Month</h4>
          <p className="text-sm text-gray-600 mb-3">
            Download the current month's data as a JSON file.
          </p>
          <button
            onClick={() => downloadMonthData(monthData.month, monthData)}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Download {monthData.month}.json
          </button>
        </div>

        {/* Download all data */}
        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-2">Backup All Data</h4>
          <p className="text-sm text-gray-600 mb-3">
            Download all your expense data as a single backup file.
          </p>
          <button
            onClick={downloadAllData}
            className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
          >
            Download Full Backup
          </button>
        </div>

        {/* Upload data */}
        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-2">Upload Month Data</h4>
          <p className="text-sm text-gray-600 mb-3">
            Upload a JSON file to restore data for a specific month.
          </p>
          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              disabled={uploading}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
            />
          </div>
          {uploading && (
            <p className="text-sm text-blue-600 mt-2">Uploading...</p>
          )}
        </div>

        {/* Instructions */}
        <div className="p-4 border rounded-lg bg-yellow-50">
          <h4 className="font-medium mb-2">How to Use</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Data is automatically saved to your browser</li>
            <li>• Download files to backup your data</li>
            <li>• Store JSON files in your repository's <code className="bg-gray-200 px-1 rounded">public/data/</code> folder</li>
            <li>• Upload files to restore data on new devices</li>
          </ul>
        </div>
      </div>

      <div className="p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium mb-2">📁 Repository Setup</h4>
        <p className="text-sm text-gray-700">
          To make your data persistent across deployments, save your JSON files in the{' '}
          <code className="bg-white px-1 rounded">public/data/</code> folder of your repository. 
          The app will automatically load data from there when available.
        </p>
      </div>
    </div>
  )
}