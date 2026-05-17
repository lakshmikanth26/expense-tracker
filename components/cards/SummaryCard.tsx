import { ReactNode } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface Props {
  label: string
  value: string
  icon: ReactNode
  color: string
  trend?: number
  sub?: string
}

export function SummaryCard({ label, value, icon, color, trend, sub }: Props) {
  return (
    <div className="card p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-semibold tracking-tight">{value}</div>
      {(trend !== undefined || sub) && (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          {trend !== undefined && (
            <>
              {trend >= 0
                ? <TrendingUp size={12} className="text-green-400" />
                : <TrendingDown size={12} className="text-red-400" />}
              <span className={trend >= 0 ? 'text-green-400' : 'text-red-400'}>
                {Math.abs(trend)}% vs last month
              </span>
            </>
          )}
          {sub && <span>{sub}</span>}
        </div>
      )}
    </div>
  )
}
