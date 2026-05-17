'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatINRCompact } from '@/lib/utils'

interface Props {
  data: { month: string; income: number; expenses: number; investments: number }[]
}

export function MonthlyBarChart({ data }: Props) {
  return (
    <div style={{ height: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barSize={8}>
          <XAxis dataKey="month" tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={formatINRCompact} width={50} />
          <Tooltip
            contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, fontSize: 12 }}
            formatter={(v: number) => formatINRCompact(v)}
            labelStyle={{ color: '#ccc' }}
          />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#666' }} />
          <Bar dataKey="income" fill="#22c55e" radius={[4,4,0,0]} name="Income" />
          <Bar dataKey="expenses" fill="#ef4444" radius={[4,4,0,0]} name="Expenses" />
          <Bar dataKey="investments" fill="#a855f7" radius={[4,4,0,0]} name="Invested" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
