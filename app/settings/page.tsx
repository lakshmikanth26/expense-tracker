'use client'
import { useState } from 'react'
import { useStore } from '@/lib/store'
import { toast } from '@/components/ui/Toaster'
import { Plus, X } from 'lucide-react'
import DataManager from '@/components/DataManager'

export default function SettingsPage() {
  const { members, setMembers } = useStore()
  const [newMember, setNewMember] = useState('')

  const addMember = () => {
    if (!newMember.trim()) return
    if (!members.includes(newMember.trim())) {
      setMembers([...members, newMember.trim()])
    }
    setNewMember('')
  }

  const removeMember = (m: string) => setMembers(members.filter(x => x !== m))

  return (
    <div className="max-w-4xl mx-auto px-4 py-5 space-y-6">
      <h1 className="text-xl font-semibold">Settings</h1>

      {/* Data Management */}
      <div className="card p-6">
        <DataManager />
      </div>

      {/* Family Members */}
      <div className="card p-4">
        <h2 className="text-sm font-medium mb-4 text-gray-300">Family Members</h2>
        <div className="flex flex-wrap gap-2 mb-3">
          {members.map(m => (
            <div key={m} className="flex items-center gap-1.5 bg-bg-elevated border border-border rounded-lg px-3 py-1.5 text-sm">
              {m}
              <button onClick={() => removeMember(m)} className="text-gray-600 hover:text-red-400 ml-1">
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input placeholder="Add member name..." value={newMember}
            onChange={e => setNewMember(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addMember()} />
          <button onClick={addMember} className="btn btn-ghost px-3 shrink-0">
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Clear data */}
      <div className="card p-4 border-red-500/10">
        <h2 className="text-sm font-medium mb-2 text-gray-300">Clear Data</h2>
        <p className="text-xs text-gray-500 mb-3">Clear all local data from this browser. Make sure you have downloaded backups first!</p>
        <button onClick={() => {
          if (confirm('Clear all local data? This cannot be undone!')) {
            localStorage.clear()
            toast('All local data cleared', 'success')
            window.location.reload()
          }
        }} className="btn btn-danger text-sm py-2">
          Clear All Data
        </button>
      </div>
    </div>
  )
}
