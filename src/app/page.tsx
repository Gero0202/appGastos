'use client';

import React, { useState } from 'react';
import { Wallet, ShieldCheck } from 'lucide-react';
import Navbar from '@/app/components/Navbar';
import GeneralSummary from '@/app/components/GeneralSummary';
import MonthlyExpenses from '@/app/components/MonthlyExpenses';
import DailyExpenses from '@/app/components/DailyExpenses';
import styles from './page.module.css';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'general' | 'monthly' | 'daily'>('general');
  const [monthlyTotal, setMonthlyTotal] = useState<number>(0);
  const [dailyTotalMonth, setDailyTotalMonth] = useState<number>(0);

  const currentDate = new Intl.DateTimeFormat('es-AR', {
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className={styles.wrapper}>
      <main className={styles.mainContainer}>
        {/* Header Superior Estilo App */}
        <header className={styles.topHeader}>
          <div className={styles.brand}>
            <div className={styles.logoIcon}>
              <Wallet size={20} />
            </div>
            <div>
              <h1 className={styles.appTitle}>Control Finanzas</h1>
              <span className={styles.dateBadge}>{currentDate}</span>
            </div>
          </div>

          <div className={styles.statusBadge} title="Sincronizado con Supabase">
            <ShieldCheck size={16} />
            <span>En línea</span>
          </div>
        </header>

        {/* Vista dinámica según Tab */}
        <div className={styles.content}>
          {activeTab === 'general' && (
            <GeneralSummary
              monthlyTotal={monthlyTotal}
              dailyTotalMonth={dailyTotalMonth}
            />
          )}

          {activeTab === 'monthly' && (
            <MonthlyExpenses onTotalChange={setMonthlyTotal} />
          )}

          {activeTab === 'daily' && (
            <DailyExpenses onMonthTotalChange={setDailyTotalMonth} />
          )}
        </div>

        {/* Barra de Navegación Inferior */}
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      </main>
    </div>
  );
}