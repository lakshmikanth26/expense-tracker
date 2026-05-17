export const EXPENSE_CATEGORIES: Record<string, string[]> = {
  'Food & Dining': ['Groceries', 'Vegetables & Fruits', 'Dining Out', 'Swiggy/Zomato', 'Beverages', 'Snacks'],
  'Transport': ['Fuel', 'Auto/Cab', 'Vehicle Maintenance', 'Public Transport', 'Parking', 'Toll'],
  'Housing': ['Rent', 'Maintenance', 'Electricity', 'Water', 'Gas', 'Internet', 'Cable'],
  'Healthcare': ['Doctor', 'Medicines', 'Tests/Lab', 'Hospital', 'Insurance Premium', 'Dental'],
  'Education': ['School Fees', 'Books', 'Tuition', 'Online Courses', 'Stationery', 'Uniform'],
  'Shopping': ['Clothing', 'Electronics', 'Home Appliances', 'Furniture', 'Personal Care', 'Accessories'],
  'Children': ['School Supplies', 'Toys', 'Activities', 'Daycare', 'Baby Products'],
  'Entertainment': ['Movies', 'OTT Subscriptions', 'Events', 'Vacations', 'Hobbies', 'Sports'],
  'Loans & EMI': ['Home Loan', 'Car Loan', 'Personal Loan', 'Credit Card Bill', 'Education Loan'],
  'Gifts & Charity': ['Gifts', 'Donations', 'Celebrations', 'Festivals'],
  'Miscellaneous': ['Miscellaneous'],
}

export const PAYMENT_MODES = ['UPI', 'Cash', 'Credit Card', 'Debit Card', 'Net Banking', 'Cheque', 'Auto-debit']

export const INCOME_SOURCES = ['Salary', 'Freelance', 'Business', 'Rental Income', 'Dividend', 'Interest', 'Gift', 'Bonus', 'Reimbursement', 'Other']

export const INVESTMENT_TYPES = ['Mutual Fund SIP', 'Lumpsum MF', 'PPF', 'EPF', 'NPS', 'Stocks', 'Gold', 'FD', 'RD', 'Crypto', 'Real Estate', 'LIC/Insurance', 'ELSS']

export const SAVING_TYPES = ['Emergency Fund', 'FD', 'RD', 'Savings Account', 'Gold Savings', 'Cash at Home']

export const LOAN_TYPES = ['Home Loan', 'Car Loan', 'Personal Loan', 'Education Loan', 'Gold Loan', 'Business Loan']

export const DEFAULT_BUDGETS: Record<string, number> = {
  'Food & Dining': 15000,
  'Transport': 5000,
  'Housing': 20000,
  'Healthcare': 3000,
  'Education': 5000,
  'Shopping': 8000,
  'Children': 4000,
  'Entertainment': 3000,
  'Loans & EMI': 10000,
  'Gifts & Charity': 2000,
  'Miscellaneous': 5000,
}

export const CATEGORY_COLORS: Record<string, string> = {
  'Food & Dining': '#f97316',
  'Transport': '#3b82f6',
  'Housing': '#8b5cf6',
  'Healthcare': '#ef4444',
  'Education': '#06b6d4',
  'Shopping': '#ec4899',
  'Children': '#f59e0b',
  'Entertainment': '#10b981',
  'Loans & EMI': '#6366f1',
  'Gifts & Charity': '#14b8a6',
  'Miscellaneous': '#6b7280',
}

export const EMPTY_MONTH_DATA = {
  income: [],
  expenses: [],
  investments: [],
  savings: [],
  loans: [],
  subscriptions: [],
  goals: [],
  budgets: { ...DEFAULT_BUDGETS },
}
