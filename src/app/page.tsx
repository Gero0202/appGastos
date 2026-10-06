'use client';

import React, { useState } from 'react';
import { Wallet, ShieldCheck, LogIn, Loader2 } from 'lucide-react';
import Navbar from '@/app/components/Navbar';
import GeneralSummary from '@/app/components/GeneralSummary';
import MonthlyExpenses from '@/app/components/MonthlyExpenses';
import DailyExpenses from '@/app/components/DailyExpenses';
import { useAuth } from './contexts/AuthContext';
import styles from './page.module.css';

export default function Home() {
  const { user, loading, signIn, signOut } = useAuth();

  const [activeTab, setActiveTab] = useState<'general' | 'monthly' | 'daily'>('general');
  const [monthlyTotal, setMonthlyTotal] = useState<number>(0);
  const [dailyTotalMonth, setDailyTotalMonth] = useState<number>(0);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const currentDate = new Intl.DateTimeFormat('es-AR', {
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const { error } = await signIn(email, password);

    if (error) {
      setLoginError('Email o contraseña incorrectos.');
    }
  };

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <main className={styles.mainContainer}>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Loader2 size={24} className="animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.wrapper}>
        <main className={styles.mainContainer}>
          <div
            style={{
              maxWidth: '400px',
              margin: '0 auto',
              padding: '40px 20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '20px',
              }}
            >
              <Wallet size={40} />
            </div>

            <h1 style={{ textAlign: 'center', marginBottom: '8px' }}>
              Control Finanzas
            </h1>

            <p style={{ textAlign: 'center', marginBottom: '30px' }}>
              Ingresá para continuar
            </p>

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="email">Email</label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginTop: '6px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="password">Contraseña</label>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginTop: '6px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {loginError && (
                <p style={{ color: 'red', marginBottom: '16px' }}>
                  {loginError}
                </p>
              )}

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <LogIn size={18} />
                Ingresar
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <main className={styles.mainContainer}>
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className={styles.statusBadge} title="Sincronizado con Supabase">
              <ShieldCheck size={16} />
              <span>En línea</span>
            </div>

            <button onClick={signOut} title="Cerrar sesión">
              Salir
            </button>
          </div>
        </header>

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

        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      </main>
    </div>
  );
}

