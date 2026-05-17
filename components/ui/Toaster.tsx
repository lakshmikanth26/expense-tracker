'use client'
import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'

export type Toast = { id: string; message: string; type: 'success' | 'error' }

let addToastFn: ((t: Omit<Toast, 'id'>) => void) | null = null

export function toast(message: string, type: 'success' | 'error' = 'success') {
  addToastFn?.({ message, type })
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    addToastFn = ({ message, type }) => {
      const id = Math.random().toString(36).slice(2)
      setToasts(p => [...p, { id, message, type }])
      setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500)
    }
    return () => { addToastFn = null }
  }, [])

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-xs w-full">
      {toasts.map(t => (
        <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium shadow-lg border ${
          t.type === 'success'
            ? 'bg-green-500/10 border-green-500/20 text-green-400'
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {t.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
          <span className="flex-1">{t.message}</span>
          <button onClick={() => setToasts(p => p.filter(x => x.id !== t.id))}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
