export interface IncomeEntry {
  id: string
  date: string
  amount: number
  source: string
  member: string
  note: string
}

export interface ExpenseEntry {
  id: string
  date: string
  amount: number
  category: string
  subcategory: string
  member: string
  paymentMode: string
  note: string
  isEMI: boolean
}

export interface InvestmentEntry {
  id: string
  date: string
  amount: number
  type: string
  schemeName: string
  member: string
  isRecurring: boolean
  note: string
}

export interface SavingEntry {
  id: string
  date: string
  amount: number
  type: string
  bank: string
  member: string
  note: string
}

export interface LoanEntry {
  id: string
  date: string
  amount: number
  emiAmount: number
  loanType: string
  bank: string
  member: string
  dueDate: string
  isPaid: boolean
  note: string
}

export interface SubscriptionEntry {
  id: string
  name: string
  amount: number
  billingDate: number
  category: string
  member: string
  isActive: boolean
}

export interface GoalEntry {
  id: string
  name: string
  targetAmount: number
  savedSoFar: number
  targetDate: string
  member: string
}

export interface MonthData {
  month: string
  income: IncomeEntry[]
  expenses: ExpenseEntry[]
  investments: InvestmentEntry[]
  savings: SavingEntry[]
  loans: LoanEntry[]
  subscriptions: SubscriptionEntry[]
  goals: GoalEntry[]
  budgets: Record<string, number>
}

export interface GitHubConfig {
  token: string
  owner: string
  repo: string
  branch: string
}

export type TransactionType = 'expense' | 'income' | 'investment' | 'saving' | 'loan' | 'subscription'
