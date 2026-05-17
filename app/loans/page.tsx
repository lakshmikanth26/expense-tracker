'use client'
import { useStore } from '@/lib/store'
import { formatINR } from '@/lib/utils'
import { toast } from '@/components/ui/Toaster'
import { CreditCard, CheckCircle, Circle, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function LoansPage() {
  const { monthData, saveMonth } = useStore()
  const loans = monthData.loans || []

  const togglePaid = async (id: string) => {
    const updated = { ...monthData, loans: loans.map(l => l.id === id ? { ...l, isPaid: !l.isPaid } : l) }
    await saveMonth(updated)
    toast('Updated', 'success')
  }

  const deleteLoan = async (id: string) => {
    const updated = { ...monthData, loans: loans.filter(l => l.id !== id) }
    await saveMonth(updated)
    toast('Removed', 'success')
  }

  const totalEMI = loans.reduce((s, l) => s + l.emiAmount, 0)
  const paidEMI = loans.filter(l => l.isPaid).reduce((s, l) => s + l.emiAmount, 0)

  return (
    <div className="max-w-2xl mx-auto px-4 py-5">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-semibold">Loans & EMI</h1>
        <Link href="/add" className="btn btn-primary text-sm py-2 px-3">+ Add Loan</Link>
      </div>

      {totalEMI > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="card p-3">
            <div className="text-xs text-gray-500 mb-1">Total EMI / month</div>
            <div className="text-xl font-semibold text-orange-400">{formatINR(totalEMI)}</div>
          </div>
          <div className="card p-3">
            <div className="text-xs text-gray-500 mb-1">Paid this month</div>
            <div className="text-xl font-semibold text-green-400">{formatINR(paidEMI)}</div>
          </div>
        </div>
      )}

      {loans.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          <CreditCard size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No loans recorded. Add your EMIs to track them.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {loans.map(l => (
            <div key={l.id} className={`card p-4 flex items-center gap-3 ${l.isPaid ? 'opacity-60' : ''}`}>
              <button onClick={() => togglePaid(l.id)} className={l.isPaid ? 'text-green-400' : 'text-gray-600'}>
                {l.isPaid ? <CheckCircle size={20} /> : <Circle size={20} />}
              </button>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{l.loanType}</div>
                <div className="text-xs text-gray-500">{l.bank} · {l.member}{l.dueDate && ` · Due: ${l.dueDate}`}</div>
                {l.note && <div className="text-xs text-gray-600 italic">{l.note}</div>}
              </div>
              <div className="text-right">
                <div className="text-orange-400 font-medium text-sm">{formatINR(l.emiAmount)}/mo</div>
                {l.isPaid && <div className="text-xs text-green-400">Paid ✓</div>}
              </div>
              <button onClick={() => deleteLoan(l.id)} className="text-gray-600 hover:text-red-400">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
