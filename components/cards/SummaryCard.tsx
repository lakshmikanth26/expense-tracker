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
    <div className="card p-4 flex flex-col gap-2 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs text-blue-600 uppercase tracking-wider font-medium">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color} shadow-sm`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold tracking-tight text-blue-900">{value}</div>
      {(trend !== undefined || sub) && (
        <div className="flex items-center gap-1 text-xs text-blue-600">
          {trend !== undefined && (
            <>
              {trend >= 0
                ? <TrendingUp size={12} className="text-green-600" />
                : <TrendingDown size={12} className="text-red-600" />}
              <span className={trend >= 0 ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(trend)}% vs last month
              </span>
            </>
          )}
          {sub && <span className="font-medium">{sub}</span>}
        </div>
      )}
    </div>
  )
}
