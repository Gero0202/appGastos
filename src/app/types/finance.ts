export interface GeneralData {
  id?: string;
  ahorros: number;
  plata_total: number;
}

export interface MonthlyExpense {
  id: string;
  title: string;
  amount: number;
  is_paid: boolean;
  created_at?: string;
}

export interface DailyExpense {
  id: string;
  description: string;
  amount: number;
  date: string; // Formato YYYY-MM-DD
  created_at?: string;
}