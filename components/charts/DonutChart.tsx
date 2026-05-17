'use client'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { formatINR } from '@/lib/utils'

interface Props {
  data: { name: string; value: number; color: string }[]
}

export function DonutChart({ data }: Props) {
  return (
    <div style={{ height: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
            paddingAngle={2} dataKey="value">
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, fontSize: 12 }}
            formatter={(v: number) => formatINR(v)}
            labelStyle={{ color: '#ccc' }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-1 text-xs text-gray-400">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
            {d.name}
          </div>
        ))}
      </div>
    </div>
  )
}
