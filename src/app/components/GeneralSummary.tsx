'use client';

import React, { useState, useEffect } from 'react';
import {
  PiggyBank,
  Wallet,
  ShoppingBag,
  Receipt,
  Scale,
  Pencil,
  X,
  Check,
  Loader2,
} from 'lucide-react';
import { supabase } from '@/app/lib/supabase';
import { GeneralData } from '@/app/types/finance';
import styles from '@/app/css/GeneralSumary.module.css';

interface Props {
  monthlyTotal: number;
  dailyTotalMonth: number;
}

export default function GeneralSummary({ monthlyTotal, dailyTotalMonth }: Props) {
  const [generalData, setGeneralData] = useState<GeneralData>({ ahorros: 0, plata_total: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [ahorrosInput, setAhorrosInput] = useState('0');
  const [plataInput, setPlataInput] = useState('0');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGeneralData();
  }, []);

  const fetchGeneralData = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('general_data').select('*').limit(1).single();

    if (!error && data) {
      setGeneralData(data);
      setAhorrosInput(data.ahorros.toString());
      setPlataInput(data.plata_total.toString());
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const newAhorros = parseFloat(ahorrosInput) || 0;
    const newPlata = parseFloat(plataInput) || 0;

    const { error } = await supabase
      .from('general_data')
      .update({ ahorros: newAhorros, plata_total: newPlata, updated_at: new Date().toISOString() })
      .eq('id', generalData.id);

    if (!error) {
      setGeneralData({ ...generalData, ahorros: newAhorros, plata_total: newPlata });
      setIsEditing(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const disponibleReal = generalData.plata_total - dailyTotalMonth - monthlyTotal;

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.spinner} size={28} />
        <span>Cargando datos financieros...</span>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <h2>Resumen General</h2>
          <span className={styles.subtitle}>Estado global del mes</span>
        </div>
        <button
          className={`${styles.editBtn} ${isEditing ? styles.activeCancel : ''}`}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? (
            <>
              <X size={15} />
              <span>Cancelar</span>
            </>
          ) : (
            <>
              <Pencil size={15} />
              <span>Editar</span>
            </>
          )}
        </button>
      </header>

      {isEditing ? (
        <form onSubmit={handleSave} className={styles.editForm}>
          <div className={styles.fieldGroup}>
            <label>
              <PiggyBank size={16} className={styles.fieldIcon} />
              <span>Ahorros Totales ($)</span>
            </label>
            <input
              type="number"
              value={ahorrosInput}
              onChange={(e) => setAhorrosInput(e.target.value)}
              placeholder="0"
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label>
              <Wallet size={16} className={styles.fieldIcon} />
              <span>Plata Total Inicial ($)</span>
            </label>
            <input
              type="number"
              value={plataInput}
              onChange={(e) => setPlataInput(e.target.value)}
              placeholder="0"
              required
            />
          </div>

          <button type="submit" className={styles.saveBtn}>
            <Check size={18} />
            <span>Guardar Cambios</span>
          </button>
        </form>
      ) : (
        <div className={styles.dashboard}>
          {/* Tarjeta Hero: Disponible Restante */}
          <div
            className={`${styles.heroCard} ${
              disponibleReal < 0 ? styles.heroNegative : styles.heroPositive
            }`}
          >
            <div className={styles.heroHeader}>
              <div className={styles.heroBadge}>
                <Scale size={18} />
                <span>Disponible Real</span>
              </div>
            </div>
            <div className={styles.heroValue}>{formatCurrency(disponibleReal)}</div>
            <p className={styles.heroSubtext}>Plata inicial menos gastos acumulados del mes</p>
          </div>

          {/* Grilla de Métricas Secundarias (2 columnas) */}
          <div className={styles.grid}>
            {/* Ahorros */}
            <div className={styles.card}>
              <div className={styles.cardTop}>
                <span className={styles.cardLabel}>Ahorros</span>
                <div className={`${styles.iconBadge} ${styles.savingsIcon}`}>
                  <PiggyBank size={18} />
                </div>
              </div>
              <span className={`${styles.cardValue} ${styles.savingsValue}`}>
                {formatCurrency(generalData.ahorros)}
              </span>
            </div>

            {/* Plata Total */}
            <div className={styles.card}>
              <div className={styles.cardTop}>
                <span className={styles.cardLabel}>Plata Total</span>
                <div className={`${styles.iconBadge} ${styles.totalIcon}`}>
                  <Wallet size={18} />
                </div>
              </div>
              <span className={styles.cardValue}>{formatCurrency(generalData.plata_total)}</span>
            </div>

            {/* Gastando (Diarios) */}
            <div className={styles.card}>
              <div className={styles.cardTop}>
                <span className={styles.cardLabel}>Diarios Mes</span>
                <div className={`${styles.iconBadge} ${styles.dailyIcon}`}>
                  <ShoppingBag size={18} />
                </div>
              </div>
              <span className={`${styles.cardValue} ${styles.dailyValue}`}>
                {formatCurrency(dailyTotalMonth)}
              </span>
            </div>

            {/* Gasto Total (Fijos) */}
            <div className={styles.card}>
              <div className={styles.cardTop}>
                <span className={styles.cardLabel}>Fijos Mes</span>
                <div className={`${styles.iconBadge} ${styles.fixedIcon}`}>
                  <Receipt size={18} />
                </div>
              </div>
              <span className={`${styles.cardValue} ${styles.fixedValue}`}>
                {formatCurrency(monthlyTotal)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}