'use client'
import { useState } from 'react'
import { useStore } from '@/lib/store'
import { EXPENSE_CATEGORIES, PAYMENT_MODES, INCOME_SOURCES, INVESTMENT_TYPES, SAVING_TYPES, LOAN_TYPES } from '@/lib/constants'
import { toast } from '@/components/ui/Toaster'
import { v4 as uuid } from 'uuid'
import { getCurrentMonth } from '@/lib/utils'

const TABS = ['Expense', 'Income', 'Investment', 'Saving', 'Loan', 'Subscription'] as const
type Tab = typeof TABS[number]

function today() {
  return new Date().toISOString().split('T')[0]
}

export default function AddPage() {
  const [tab, setTab] = useState<Tab>('Expense')
  const { monthData, saveMonth, members, currentMonth } = useStore()

  const handleSave = async (entry: Record<string, unknown>, type: Tab) => {
    const data = { ...monthData }
    const month = currentMonth || getCurrentMonth()
    data.month = month

    if (type === 'Expense') data.expenses = [...data.expenses, entry as never]
    else if (type === 'Income') data.income = [...data.income, entry as never]
    else if (type === 'Investment') data.investments = [...data.investments, entry as never]
    else if (type === 'Saving') data.savings = [...data.savings, entry as never]
    else if (type === 'Loan') data.loans = [...data.loans, entry as never]
    else if (type === 'Subscription') data.subscriptions = [...data.subscriptions, entry as never]

    const ok = await saveMonth(data)
    if (ok) toast(`${type} added successfully!`, 'success')
    else toast('Saved locally (GitHub not synced)', 'error')
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-5">
      <h1 className="text-lg font-semibold mb-4">Add Entry</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-bg-elevated rounded-xl p-1 mb-5 overflow-x-auto">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              tab === t ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Expense' && <ExpenseForm members={members} onSave={d => handleSave(d, 'Expense')} />}
      {tab === 'Income' && <IncomeForm members={members} onSave={d => handleSave(d, 'Income')} />}
      {tab === 'Investment' && <InvestmentForm members={members} onSave={d => handleSave(d, 'Investment')} />}
      {tab === 'Saving' && <SavingForm members={members} onSave={d => handleSave(d, 'Saving')} />}
      {tab === 'Loan' && <LoanForm members={members} onSave={d => handleSave(d, 'Loan')} />}
      {tab === 'Subscription' && <SubscriptionForm members={members} onSave={d => handleSave(d, 'Subscription')} />}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      {children}
    </div>
  )
}

function ExpenseForm({ members, onSave }: { members: string[]; onSave: (d: Record<string, unknown>) => void }) {
  const [form, setForm] = useState({ date: today(), amount: '', category: 'Food & Dining', subcategory: '', member: members[0] || 'Self', paymentMode: 'UPI', note: '', isEMI: false })
  const set = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }))
  const subs = EXPENSE_CATEGORIES[form.category] || []

  const submit = () => {
    if (!form.amount) return toast('Enter amount', 'error')
    onSave({ id: uuid(), ...form, amount: parseFloat(form.amount), subcategory: form.subcategory || subs[0] || '' })
    setForm(p => ({ ...p, amount: '', note: '' }))
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Date"><input type="date" value={form.date} onChange={e => set('date', e.target.value)} /></Field>
        <Field label="Amount (₹)"><input type="number" placeholder="0" value={form.amount} onChange={e => set('amount', e.target.value)} /></Field>
      </div>
      <Field label="Category">
        <select value={form.category} onChange={e => { set('category', e.target.value); set('subcategory', '') }}>
          {Object.keys(EXPENSE_CATEGORIES).map(c => <option key={c}>{c}</option>)}
        </select>
      </Field>
      <Field label="Subcategory">
        <select value={form.subcategory} onChange={e => set('subcategory', e.target.value)}>
          {subs.map(s => <option key={s}>{s}</option>)}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Member">
          <select value={form.member} onChange={e => set('member', e.target.value)}>
            {members.map(m => <option key={m}>{m}</option>)}
          </select>
        </Field>
        <Field label="Payment Mode">
          <select value={form.paymentMode} onChange={e => set('paymentMode', e.target.value)}>
            {PAYMENT_MODES.map(m => <option key={m}>{m}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Note (optional)"><input placeholder="Add a note..." value={form.note} onChange={e => set('note', e.target.value)} /></Field>
      <div className="flex items-center gap-2 mb-4">
        <input type="checkbox" id="isEMI" checked={form.isEMI} onChange={e => set('isEMI', e.target.checked)} className="w-4 h-4" />
        <label htmlFor="isEMI" className="text-sm text-gray-400">This is an EMI payment</label>
      </div>
      <button onClick={submit} className="btn btn-primary w-full justify-center">Add Expense</button>
    </div>
  )
}

function IncomeForm({ members, onSave }: { members: string[]; onSave: (d: Record<string, unknown>) => void }) {
  const [form, setForm] = useState({ date: today(), amount: '', source: 'Salary', member: members[0] || 'Self', note: '' })
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))
  const submit = () => {
    if (!form.amount) return toast('Enter amount', 'error')
    onSave({ id: uuid(), ...form, amount: parseFloat(form.amount) })
    setForm(p => ({ ...p, amount: '', note: '' }))
  }
  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Date"><input type="date" value={form.date} onChange={e => set('date', e.target.value)} /></Field>
        <Field label="Amount (₹)"><input type="number" placeholder="0" value={form.amount} onChange={e => set('amount', e.target.value)} /></Field>
      </div>
      <Field label="Source">
        <select value={form.source} onChange={e => set('source', e.target.value)}>
          {INCOME_SOURCES.map(s => <option key={s}>{s}</option>)}
        </select>
      </Field>
      <Field label="Member">
        <select value={form.member} onChange={e => set('member', e.target.value)}>
          {members.map(m => <option key={m}>{m}</option>)}
        </select>
      </Field>
      <Field label="Note (optional)"><input placeholder="Add a note..." value={form.note} onChange={e => set('note', e.target.value)} /></Field>
      <button onClick={submit} className="btn btn-primary w-full justify-center">Add Income</button>
    </div>
  )
}

function InvestmentForm({ members, onSave }: { members: string[]; onSave: (d: Record<string, unknown>) => void }) {
  const [form, setForm] = useState({ date: today(), amount: '', type: 'Mutual Fund SIP', schemeName: '', member: members[0] || 'Self', isRecurring: false, note: '' })
  const set = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }))
  const submit = () => {
    if (!form.amount) return toast('Enter amount', 'error')
    onSave({ id: uuid(), ...form, amount: parseFloat(form.amount) })
    setForm(p => ({ ...p, amount: '', schemeName: '', note: '' }))
  }
  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Date"><input type="date" value={form.date} onChange={e => set('date', e.target.value)} /></Field>
        <Field label="Amount (₹)"><input type="number" placeholder="0" value={form.amount} onChange={e => set('amount', e.target.value)} /></Field>
      </div>
      <Field label="Investment Type">
        <select value={form.type} onChange={e => set('type', e.target.value)}>
          {INVESTMENT_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
      </Field>
      <Field label="Scheme / Fund Name"><input placeholder="e.g. Axis Bluechip Direct" value={form.schemeName} onChange={e => set('schemeName', e.target.value)} /></Field>
      <Field label="Member">
        <select value={form.member} onChange={e => set('member', e.target.value)}>
          {members.map(m => <option key={m}>{m}</option>)}
        </select>
      </Field>
      <div className="flex items-center gap-2 mb-4">
        <input type="checkbox" id="isRec" checked={form.isRecurring} onChange={e => set('isRecurring', e.target.checked)} className="w-4 h-4" />
        <label htmlFor="isRec" className="text-sm text-gray-400">Recurring (SIP/monthly)</label>
      </div>
      <Field label="Note (optional)"><input placeholder="Add a note..." value={form.note} onChange={e => set('note', e.target.value)} /></Field>
      <button onClick={submit} className="btn btn-primary w-full justify-center">Add Investment</button>
    </div>
  )
}

function SavingForm({ members, onSave }: { members: string[]; onSave: (d: Record<string, unknown>) => void }) {
  const [form, setForm] = useState({ date: today(), amount: '', type: 'Emergency Fund', bank: '', member: members[0] || 'Self', note: '' })
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))
  const submit = () => {
    if (!form.amount) return toast('Enter amount', 'error')
    onSave({ id: uuid(), ...form, amount: parseFloat(form.amount) })
    setForm(p => ({ ...p, amount: '', bank: '', note: '' }))
  }
  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Date"><input type="date" value={form.date} onChange={e => set('date', e.target.value)} /></Field>
        <Field label="Amount (₹)"><input type="number" placeholder="0" value={form.amount} onChange={e => set('amount', e.target.value)} /></Field>
      </div>
      <Field label="Saving Type">
        <select value={form.type} onChange={e => set('type', e.target.value)}>
          {SAVING_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
      </Field>
      <Field label="Bank / Institution"><input placeholder="e.g. SBI, HDFC" value={form.bank} onChange={e => set('bank', e.target.value)} /></Field>
      <Field label="Member">
        <select value={form.member} onChange={e => set('member', e.target.value)}>
          {members.map(m => <option key={m}>{m}</option>)}
        </select>
      </Field>
      <Field label="Note (optional)"><input placeholder="Add a note..." value={form.note} onChange={e => set('note', e.target.value)} /></Field>
      <button onClick={submit} className="btn btn-primary w-full justify-center">Add Saving</button>
    </div>
  )
}

function LoanForm({ members, onSave }: { members: string[]; onSave: (d: Record<string, unknown>) => void }) {
  const [form, setForm] = useState({ date: today(), amount: '', emiAmount: '', loanType: 'Home Loan', bank: '', member: members[0] || 'Self', dueDate: '', isPaid: false, note: '' })
  const set = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }))
  const submit = () => {
    if (!form.emiAmount) return toast('Enter EMI amount', 'error')
    onSave({ id: uuid(), ...form, amount: parseFloat(form.amount || '0'), emiAmount: parseFloat(form.emiAmount) })
    setForm(p => ({ ...p, amount: '', emiAmount: '', note: '' }))
  }
  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Date"><input type="date" value={form.date} onChange={e => set('date', e.target.value)} /></Field>
        <Field label="EMI Amount (₹)"><input type="number" placeholder="0" value={form.emiAmount} onChange={e => set('emiAmount', e.target.value)} /></Field>
      </div>
      <Field label="Loan Type">
        <select value={form.loanType} onChange={e => set('loanType', e.target.value)}>
          {LOAN_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Bank"><input placeholder="e.g. HDFC" value={form.bank} onChange={e => set('bank', e.target.value)} /></Field>
        <Field label="Due Date"><input type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} /></Field>
      </div>
      <Field label="Member">
        <select value={form.member} onChange={e => set('member', e.target.value)}>
          {members.map(m => <option key={m}>{m}</option>)}
        </select>
      </Field>
      <div className="flex items-center gap-2 mb-4">
        <input type="checkbox" id="isPaid" checked={form.isPaid} onChange={e => set('isPaid', e.target.checked)} className="w-4 h-4" />
        <label htmlFor="isPaid" className="text-sm text-gray-400">Mark as paid for this month</label>
      </div>
      <Field label="Note (optional)"><input placeholder="Add a note..." value={form.note} onChange={e => set('note', e.target.value)} /></Field>
      <button onClick={submit} className="btn btn-primary w-full justify-center">Add Loan / EMI</button>
    </div>
  )
}

function SubscriptionForm({ members, onSave }: { members: string[]; onSave: (d: Record<string, unknown>) => void }) {
  const [form, setForm] = useState({ name: '', amount: '', billingDate: '1', category: 'Entertainment', member: 'Family', isActive: true })
  const set = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }))
  const submit = () => {
    if (!form.name || !form.amount) return toast('Enter name and amount', 'error')
    onSave({ id: uuid(), ...form, amount: parseFloat(form.amount), billingDate: parseInt(form.billingDate) })
    setForm(p => ({ ...p, name: '', amount: '' }))
  }
  return (
    <div>
      <Field label="Service Name"><input placeholder="e.g. Netflix, Spotify" value={form.name} onChange={e => set('name', e.target.value)} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Amount (₹)"><input type="number" placeholder="0" value={form.amount} onChange={e => set('amount', e.target.value)} /></Field>
        <Field label="Billing Day (1-31)"><input type="number" min="1" max="31" value={form.billingDate} onChange={e => set('billingDate', e.target.value)} /></Field>
      </div>
      <Field label="Category">
        <select value={form.category} onChange={e => set('category', e.target.value)}>
          {['Entertainment', 'Education', 'Healthcare', 'Productivity', 'Shopping', 'Miscellaneous'].map(c => <option key={c}>{c}</option>)}
        </select>
      </Field>
      <Field label="Member">
        <select value={form.member} onChange={e => set('member', e.target.value)}>
          {['Family', ...members].map(m => <option key={m}>{m}</option>)}
        </select>
      </Field>
      <button onClick={submit} className="btn btn-primary w-full justify-center">Add Subscription</button>
    </div>
  )
}
