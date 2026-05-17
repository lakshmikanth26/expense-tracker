'use client'
import { useState, useEffect } from 'react'
import { testConnection } from '@/lib/github'
import { useStore } from '@/lib/store'
import { toast } from '@/components/ui/Toaster'
import { CheckCircle, XCircle, Eye, EyeOff, Plus, X } from 'lucide-react'

export default function SettingsPage() {
  const { members, setMembers } = useStore()
  const [token, setToken] = useState('')
  const [owner, setOwner] = useState('')
  const [repo, setRepo] = useState('')
  const [branch, setBranch] = useState('main')
  const [showToken, setShowToken] = useState(false)
  const [testing, setTesting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<{ ok: boolean; message: string } | null>(null)
  const [newMember, setNewMember] = useState('')

  useEffect(() => {
    setToken(localStorage.getItem('gh_token') || '')
    setOwner(localStorage.getItem('gh_owner') || '')
    setRepo(localStorage.getItem('gh_repo') || '')
    setBranch(localStorage.getItem('gh_branch') || 'main')
  }, [])

  const saveGitHub = () => {
    localStorage.setItem('gh_token', token)
    localStorage.setItem('gh_owner', owner)
    localStorage.setItem('gh_repo', repo)
    localStorage.setItem('gh_branch', branch)
    toast('GitHub settings saved!', 'success')
    setConnectionStatus(null)
  }

  const testConn = async () => {
    localStorage.setItem('gh_token', token)
    localStorage.setItem('gh_owner', owner)
    localStorage.setItem('gh_repo', repo)
    localStorage.setItem('gh_branch', branch)
    setTesting(true)
    const result = await testConnection()
    setConnectionStatus(result)
    setTesting(false)
    toast(result.message, result.ok ? 'success' : 'error')
  }

  const addMember = () => {
    if (!newMember.trim()) return
    if (!members.includes(newMember.trim())) {
      setMembers([...members, newMember.trim()])
    }
    setNewMember('')
  }

  const removeMember = (m: string) => setMembers(members.filter(x => x !== m))

  return (
    <div className="max-w-xl mx-auto px-4 py-5 space-y-5">
      <h1 className="text-lg font-semibold">Settings</h1>

      {/* GitHub Config */}
      <div className="card p-4">
        <h2 className="text-sm font-medium mb-4 text-gray-300">GitHub Configuration</h2>
        <p className="text-xs text-gray-500 mb-4">Your data is stored as JSON files in a GitHub repository. Create a repo and a Personal Access Token with <code className="bg-white/5 px-1 rounded">repo</code> scope.</p>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Personal Access Token *</label>
            <div className="relative">
              <input type={showToken ? 'text' : 'password'} placeholder="ghp_xxxxxxxxxxxx" value={token} onChange={e => setToken(e.target.value)} className="pr-10" />
              <button onClick={() => setShowToken(!showToken)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                {showToken ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">GitHub Username *</label>
              <input placeholder="your-username" value={owner} onChange={e => setOwner(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Repository Name *</label>
              <input placeholder="family-ledger-data" value={repo} onChange={e => setRepo(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Branch</label>
            <input placeholder="main" value={branch} onChange={e => setBranch(e.target.value)} />
          </div>

          {connectionStatus && (
            <div className={`flex items-center gap-2 text-sm p-2 rounded-lg ${connectionStatus.ok ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
              {connectionStatus.ok ? <CheckCircle size={15} /> : <XCircle size={15} />}
              {connectionStatus.message}
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={testConn} disabled={testing} className="btn btn-ghost flex-1 justify-center text-sm">
              {testing ? 'Testing...' : 'Test Connection'}
            </button>
            <button onClick={saveGitHub} className="btn btn-primary flex-1 justify-center text-sm">
              Save
            </button>
          </div>
        </div>
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

      {/* Setup Guide */}
      <div className="card p-4 border-blue-500/10 bg-blue-500/5">
        <h2 className="text-sm font-medium mb-3 text-blue-300">Setup Guide</h2>
        <ol className="text-xs text-gray-400 space-y-2 list-decimal list-inside">
          <li>Create a new <strong className="text-white">empty GitHub repository</strong> (e.g. <code className="bg-white/5 px-1 rounded">family-ledger-data</code>)</li>
          <li>Go to <strong className="text-white">github.com/settings/tokens</strong> → Generate new token (classic)</li>
          <li>Select the <code className="bg-white/5 px-1 rounded">repo</code> scope and generate</li>
          <li>Paste the token, your username, and repo name above</li>
          <li>Click <strong className="text-white">Test Connection</strong> then <strong className="text-white">Save</strong></li>
          <li>Start adding your family&apos;s transactions!</li>
        </ol>
      </div>

      {/* Clear data */}
      <div className="card p-4 border-red-500/10">
        <h2 className="text-sm font-medium mb-2 text-gray-300">Data</h2>
        <p className="text-xs text-gray-500 mb-3">Clear local settings (GitHub credentials) from this browser. Your GitHub data remains safe.</p>
        <button onClick={() => {
          if (confirm('Clear all local settings?')) {
            ['gh_token', 'gh_owner', 'gh_repo', 'gh_branch', 'family_members'].forEach(k => localStorage.removeItem(k))
            toast('Local settings cleared', 'success')
            window.location.reload()
          }
        }} className="btn btn-danger text-sm py-2">
          Clear Local Settings
        </button>
      </div>
    </div>
  )
}
