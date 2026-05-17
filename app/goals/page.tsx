'use client'
import { useState } from 'react'
import { useStore } from '@/lib/store'
import { formatINR } from '@/lib/utils'
import { GoalEntry } from '@/lib/types'
import { toast } from '@/components/ui/Toaster'
import { Target, Plus, Trash2, X } from 'lucide-react'
import { v4 as uuid } from 'uuid'

export default function GoalsPage() {
  const { monthData, saveMonth, members } = useStore()
  const goals = monthData.goals || []
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', targetAmount: '', savedSoFar: '', targetDate: '', member: 'Family' })
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const addGoal = async () => {
    if (!form.name || !form.targetAmount) return toast('Fill required fields', 'error')
    const newGoal: GoalEntry = {
      id: uuid(), name: form.name,
      targetAmount: parseFloat(form.targetAmount),
      savedSoFar: parseFloat(form.savedSoFar || '0'),
      targetDate: form.targetDate, member: form.member
    }
    const updated = { ...monthData, goals: [...goals, newGoal] }
    await saveMonth(updated)
    toast('Goal added!', 'success')
    setShowForm(false)
    setForm({ name: '', targetAmount: '', savedSoFar: '', targetDate: '', member: 'Family' })
  }

  const deleteGoal = async (id: string) => {
    const updated = { ...monthData, goals: goals.filter(g => g.id !== id) }
    await saveMonth(updated)
    toast('Goal removed', 'success')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-5">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-semibold">Financial Goals</h1>
        <button onClick={() => setShowForm(true)} className="btn btn-primary text-sm py-2 px-3">
          <Plus size={15} /> Add Goal
        </button>
      </div>

      {showForm && (
        <div className="card p-4 mb-4 border-blue-500/20">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">New Goal</h3>
            <button onClick={() => setShowForm(false)}><X size={16} className="text-gray-500" /></button>
          </div>
          <div className="space-y-3">
            <div><label className="text-xs text-gray-400 block mb-1">Goal Name *</label><input placeholder="e.g. Europe Trip, New Car" value={form.name} onChange={e => set('name', e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-gray-400 block mb-1">Target Amount (₹) *</label><input type="number" placeholder="0" value={form.targetAmount} onChange={e => set('targetAmount', e.target.value)} /></div>
              <div><label className="text-xs text-gray-400 block mb-1">Saved So Far (₹)</label><input type="number" placeholder="0" value={form.savedSoFar} onChange={e => set('savedSoFar', e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-gray-400 block mb-1">Target Date</label><input type="date" value={form.targetDate} onChange={e => set('targetDate', e.target.value)} /></div>
              <div><label className="text-xs text-gray-400 block mb-1">For</label>
                <select value={form.member} onChange={e => set('member', e.target.value)}>
                  {['Family', ...members].map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <button onClick={addGoal} className="btn btn-primary w-full justify-center">Save Goal</button>
          </div>
        </div>
      )}

      {goals.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          <Target size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No goals yet. Add your first financial goal!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map(g => {
            const pct = Math.min(100, Math.round((g.savedSoFar / g.targetAmount) * 100))
            const remaining = g.targetAmount - g.savedSoFar
            const daysLeft = g.targetDate ? Math.ceil((new Date(g.targetDate).getTime() - Date.now()) / 86400000) : null
            const monthsLeft = daysLeft ? Math.max(1, Math.ceil(daysLeft / 30)) : null
            const monthlyNeeded = monthsLeft ? Math.ceil(remaining / monthsLeft) : null
            const status = pct >= 100 ? 'done' : daysLeft && daysLeft < 0 ? 'overdue' : pct >= 60 ? 'good' : 'behind'
            const statusColors = { done: 'text-green-400 border-green-500/20', good: 'text-blue-400 border-blue-500/20', behind: 'text-amber-400 border-amber-500/20', overdue: 'text-red-400 border-red-500/20' }
            const barColors = { done: '#22c55e', good: '#3b82f6', behind: '#f59e0b', overdue: '#ef4444' }

            return (
              <div key={g.id} className={`card p-4 border ${statusColors[status].split(' ')[1]}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium">{g.name}</h3>
                    <p className="text-xs text-gray-500">{g.member}{g.targetDate && ` · Target: ${new Date(g.targetDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}`}</p>
                  </div>
                  <button onClick={() => deleteGoal(g.id)} className="text-gray-600 hover:text-red-400"><Trash2 size={14} /></button>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">{formatINR(g.savedSoFar)} saved</span>
                  <span className={statusColors[status].split(' ')[0]}>{pct}% of {formatINR(g.targetAmount)}</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-3">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: barColors[status] }} />
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                  <span>Remaining: <span className="text-white">{formatINR(remaining)}</span></span>
                  {daysLeft !== null && <span>Days left: <span className={daysLeft < 0 ? 'text-red-400' : 'text-white'}>{daysLeft < 0 ? 'Overdue' : daysLeft}</span></span>}
                  {monthlyNeeded !== null && monthlyNeeded > 0 && <span>Need/month: <span className="text-white">{formatINR(monthlyNeeded)}</span></span>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
