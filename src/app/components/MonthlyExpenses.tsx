'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  Circle,
  X,
  CreditCard,
  DollarSign,
  Check,
} from 'lucide-react';
import { supabase } from '@/app/lib/supabase';
import { MonthlyExpense } from '@/app/types/finance';
import styles from '@/app/css/MonthlyExpenses.module.css';

interface Props {
  onTotalChange: (total: number) => void;
}

export default function MonthlyExpenses({ onTotalChange }: Props) {
  const [items, setItems] = useState<MonthlyExpense[]>([]);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    const { data, error } = await supabase
      .from('monthly_expenses')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error && data) {
      setItems(data);
      calculateAndEmitTotal(data);
    }
  };

  const calculateAndEmitTotal = (data: MonthlyExpense[]) => {
    const total = data.reduce((sum, item) => sum + Number(item.amount), 0);
    onTotalChange(total);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;

    const numericAmount = parseFloat(amount);

    if (editingId) {
      const { error } = await supabase
        .from('monthly_expenses')
        .update({ title, amount: numericAmount })
        .eq('id', editingId);

      if (!error) {
        const updated = items.map((i) =>
          i.id === editingId ? { ...i, title, amount: numericAmount } : i
        );
        setItems(updated);
        calculateAndEmitTotal(updated);
        resetForm();
      }
    } else {
      const { data, error } = await supabase
        .from('monthly_expenses')
        .insert([{ title: title.trim(), amount: numericAmount, is_paid: false }])
        .select()
        .single();

      if (!error && data) {
        const updated = [...items, data];
        setItems(updated);
        calculateAndEmitTotal(updated);
        resetForm();
      }
    }
  };

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setEditingId(null);
  };

  const toggleCheck = async (id: string, currentPaid: boolean) => {
    const { error } = await supabase
      .from('monthly_expenses')
      .update({ is_paid: !currentPaid })
      .eq('id', id);

    if (!error) {
      const updated = items.map((i) => (i.id === id ? { ...i, is_paid: !currentPaid } : i));
      setItems(updated);
      calculateAndEmitTotal(updated);
    }
  };

  const handleEdit = (item: MonthlyExpense) => {
    setEditingId(item.id);
    setTitle(item.title);
    setAmount(item.amount.toString());
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('monthly_expenses').delete().eq('id', id);
    if (!error) {
      const updated = items.filter((i) => i.id !== id);
      setItems(updated);
      calculateAndEmitTotal(updated);
      if (editingId === id) resetForm();
    }
  };

  const totalSum = items.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalPaid = items.filter((i) => i.is_paid).reduce((acc, curr) => acc + Number(curr.amount), 0);
  const paidPercentage = totalSum > 0 ? Math.round((totalPaid / totalSum) * 100) : 0;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className={styles.container}>
      {/* Encabezado */}
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <div className={styles.headerIcon}>
            <Calendar size={18} />
          </div>
          <div>
            <h2>Gastos Fijos Mensuales</h2>
            <span className={styles.subtitle}>Suscripciones y servicios habituales</span>
          </div>
        </div>
      </header>

      {/* Formulario de carga / edición */}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputsRow}>
          <div className={styles.inputWrapper}>
            <CreditCard size={16} className={styles.inputIcon} />
            <input
              type="text"
              placeholder="Servicio (ej: Luz, Internet)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.inputWrapper}>
            <DollarSign size={16} className={styles.inputIcon} />
            <input
              type="number"
              placeholder="Monto"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={styles.input}
              required
            />
          </div>
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.submitBtn}>
            {editingId ? <Check size={18} /> : <Plus size={18} />}
            <span>{editingId ? 'Actualizar' : 'Agregar Gasto'}</span>
          </button>

          {editingId && (
            <button type="button" onClick={resetForm} className={styles.cancelBtn}>
              <X size={18} />
              <span>Cancelar</span>
            </button>
          )}
        </div>
      </form>

      {/* Lista de Gastos */}
      <div className={styles.list}>
        {items.length === 0 ? (
          <div className={styles.emptyState}>No hay gastos fijos registrados.</div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className={`${styles.itemCard} ${item.is_paid ? styles.paidCard : ''}`}
            >
              <button
                type="button"
                className={styles.checkBtn}
                onClick={() => toggleCheck(item.id, item.is_paid)}
                aria-label={item.is_paid ? 'Marcar como pendiente' : 'Marcar como pagado'}
              >
                {item.is_paid ? (
                  <CheckCircle2 size={22} className={styles.checkIconActive} />
                ) : (
                  <Circle size={22} className={styles.checkIconInactive} />
                )}
              </button>

              <div className={styles.itemInfo}>
                <span className={`${styles.itemTitle} ${item.is_paid ? styles.strikethrough : ''}`}>
                  {item.title}
                </span>
                <span className={styles.itemAmount}>{formatCurrency(item.amount)}</span>
              </div>

              <div className={styles.actions}>
                <button
                  type="button"
                  onClick={() => handleEdit(item)}
                  className={styles.actionBtn}
                  aria-label="Editar"
                >
                  <Pencil size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className={`${styles.actionBtn} ${styles.deleteBtn}`}
                  aria-label="Eliminar"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Resumen de Pago y Barra de Progreso */}
      <div className={styles.summaryFooter}>
        <div className={styles.progressContainer}>
          <div className={styles.progressHeader}>
            <span>Progreso de Pago</span>
            <span className={styles.progressPercent}>{paidPercentage}%</span>
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${paidPercentage}%` }} />
          </div>
        </div>

        <div className={styles.footerDetails}>
          <div className={styles.footerRow}>
            <span className={styles.footerLabel}>Pagado:</span>
            <span className={styles.paidText}>{formatCurrency(totalPaid)}</span>
          </div>
          <div className={`${styles.footerRow} ${styles.totalRow}`}>
            <span className={styles.footerLabel}>Total Fijo:</span>
            <span className={styles.totalText}>{formatCurrency(totalSum)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}