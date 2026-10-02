'use client';

import React from 'react';
import { LayoutDashboard, Calendar, ShoppingBag } from 'lucide-react';
import styles from '@/app/css/Navbar.module.css';

interface NavbarProps {
  activeTab: 'general' | 'monthly' | 'daily';
  setActiveTab: (tab: 'general' | 'monthly' | 'daily') => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  return (
    <nav className={styles.navbar}>
      <button
        className={`${styles.tabButton} ${activeTab === 'general' ? styles.active : ''}`}
        onClick={() => setActiveTab('general')}
      >
        <LayoutDashboard className={styles.icon} size={20} strokeWidth={2} />
        <span>General</span>
      </button>

      <button
        className={`${styles.tabButton} ${activeTab === 'monthly' ? styles.active : ''}`}
        onClick={() => setActiveTab('monthly')}
      >
        <Calendar className={styles.icon} size={20} strokeWidth={2} />
        <span>Fijos</span>
      </button>

      <button
        className={`${styles.tabButton} ${activeTab === 'daily' ? styles.active : ''}`}
        onClick={() => setActiveTab('daily')}
      >
        <ShoppingBag className={styles.icon} size={20} strokeWidth={2} />
        <span>Diarios</span>
      </button>
    </nav>
  );
}