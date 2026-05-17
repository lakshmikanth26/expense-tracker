'use client'
import { useEffect, useState } from 'react'
import { getAvailableMonths } from '@/lib/data'
import { monthLabel, getCurrentMonth } from '@/lib/utils'
import Link from 'next/link'
import { Calendar, ChevronRight } from 'lucide-react'

export default function ReportIndex() {
  const [months, setMonths] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAvailableMonths().then(m => {
      const all = m.length > 0 ? m : [getCurrentMonth()]
      setMonths(all.sort().reverse())
      setLoading(false)
    })
  }, [])

  const years = Array.from(new Set(months.map(m => m.split('-')[0]))).sort().reverse()

  return (
    <div className="max-w-2xl mx-auto px-4 py-5">
      <h1 className="text-lg font-semibold mb-5">Reports</h1>
      {loading
        ? <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-14 card animate-pulse" />)}</div>
        : years.map(year => (
          <div key={year} className="mb-6">
            <h2 className="text-sm text-gray-500 mb-2 font-medium">{year}</h2>
            <div className="space-y-1">
              {months.filter(m => m.startsWith(year)).map(m => {
                const [y, mo] = m.split('-')
                return (
                  <Link key={m} href={`/report/${y}/${mo}`}
                    className="card flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors">
                    <Calendar size={16} className="text-blue-400 shrink-0" />
                    <span className="flex-1 text-sm">{monthLabel(m)}</span>
                    <ChevronRight size={14} className="text-gray-600" />
                  </Link>
                )
              })}
            </div>
          </div>
        ))
      }
    </div>
  )
}
