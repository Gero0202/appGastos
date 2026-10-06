'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  ReceiptText,
  TrendingDown,
} from 'lucide-react';
import { supabase } from '@/app/lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { DailyExpense } from '@/app/types/finance';
import styles from '@/app/css/DailyExpenses.module.css';

interface Props {
  onMonthTotalChange: (total: number) => void;
}

export default function DailyExpenses({ onMonthTotalChange }: Props) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<DailyExpense[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    fetchDailyExpenses();
  }, [selectedDate]);

  const fetchDailyExpenses = async () => {
    const currentYearMonth = selectedDate.slice(0, 7);

    const { data, error } = await supabase
      .from('daily_expenses')
      .select('*')
      .gte('date', `${currentYearMonth}-01`)
      .lte('date', `${currentYearMonth}-31`)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setExpenses(data);
      const totalMonth = data.reduce((sum, item) => sum + Number(item.amount), 0);
      onMonthTotalChange(totalMonth);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    const numericAmount = parseFloat(amount);

    const { data, error } = await supabase
      .from('daily_expenses')
      .insert([
        {
          description,
          amount: numericAmount,
          date: selectedDate,
          user_id: user?.id
        },
      ])
      .select()
      .single();

    if (!error && data) {
      const updated = [data, ...expenses];
      setExpenses(updated);
      const totalMonth = updated.reduce((sum, item) => sum + Number(item.amount), 0);
      onMonthTotalChange(totalMonth);
      setDescription('');
      setAmount('');
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('daily_expenses').delete().eq('id', id);
    if (!error) {
      const updated = expenses.filter((item) => item.id !== id);
      setExpenses(updated);
      const totalMonth = updated.reduce((sum, item) => sum + Number(item.amount), 0);
      onMonthTotalChange(totalMonth);
    }
  };

  const dayExpenses = expenses.filter((e) => e.date === selectedDate);
  const dayTotal = dayExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const monthTotal = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Formato amigable para mostrar la fecha seleccionada
  const formattedSelectedDate = new Date(`${selectedDate}T00:00:00`).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
  });

  return (
    <div className={styles.container}>
      {/* Encabezado con Ícono */}
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <div className={styles.headerIcon}>
            <ShoppingBag size={20} color="#f59e0b" />
          </div>
          <h2>Gastos Diarios</h2>
        </div>

        {/* Selector de Fecha Estilizado */}
        <div className={styles.dateSelector}>
          <CalendarIcon size={16} className={styles.dateIcon} />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className={styles.dateInput}
          />
        </div>
      </div>

      {/* Formulario de Carga */}
      <form onSubmit={handleAddExpense} className={styles.formCard}>
        <div className={styles.inputsRow}>
          <input
            type="text"
            placeholder="¿Qué compraste? (Ej: Super, Nafta...)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={styles.inputDesc}
            required
          />
          <div className={styles.amountWrapper}>
            <span className={styles.currencyPrefix}>$</span>
            <input
              type="number"
              placeholder="Monto"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={styles.inputAmount}
              required
            />
          </div>
        </div>
        <button type="submit" className={styles.addBtn}>
          <Plus size={18} strokeWidth={2.5} />
          <span>Anotar Gasto</span>
        </button>
      </form>

      {/* Banner de Total Diario */}
      <div className={styles.dailyHeader}>
        <span className={styles.dailyLabel}>Consumo del {formattedSelectedDate}:</span>
        <span className={styles.dayTotalVal}>{formatCurrency(dayTotal)}</span>
      </div>

      {/* Lista de Gastos */}
      <div className={styles.list}>
        {dayExpenses.length === 0 ? (
          <div className={styles.emptyState}>
            <ReceiptText size={36} className={styles.emptyIcon} />
            <p>Sin gastos anotados para este día.</p>
          </div>
        ) : (
          dayExpenses.map((item) => (
            <div key={item.id} className={styles.itemCard}>
              <div className={styles.itemLeft}>
                <div className={styles.expenseDot} />
                <span className={styles.itemDesc}>{item.description}</span>
              </div>
              <div className={styles.itemRight}>
                <span className={styles.itemAmount}>{formatCurrency(item.amount)}</span>
                <button
                  onClick={() => handleDelete(item.id)}
                  className={styles.deleteBtn}
                  aria-label="Eliminar gasto"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Banner de Acumulado Mensual */}
      <div className={styles.monthTotalBanner}>
        <div className={styles.monthInfo}>
          <TrendingDown size={20} className={styles.trendingIcon} />
          <span>Total Gastado en el Mes</span>
        </div>
        <span className={styles.monthTotalVal}>{formatCurrency(monthTotal)}</span>
      </div>
    </div>
  );
}