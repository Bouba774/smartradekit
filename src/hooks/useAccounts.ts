import { useState, useCallback, useMemo } from 'react';

export type AccountType = 'personal' | 'real' | 'demo' | 'funded' | 'prop';

export interface TradingAccount {
  id: string;
  name: string;
  type: AccountType;
  broker?: string;
  capital?: number;
  currency?: string;
  color?: string;
  emoji?: string;
  isActive: boolean;
  createdAt: string;
}

export const ACCOUNT_TYPE_CONFIG: Record<AccountType, { 
  label: string; 
  labelFr: string;
  labelEn: string; 
  color: string; 
  icon: string;
  emoji: string;
  defaultColor: string;
  description: { fr: string; en: string };
}> = {
  personal: { label: 'Personnel', labelFr: 'Personnel', labelEn: 'Personal', color: 'hsl(var(--primary))', icon: '👤', emoji: '👤', defaultColor: 'hsl(var(--primary))', description: { fr: 'Compte personnel', en: 'Personal account' } },
  real: { label: 'Réel', labelFr: 'Réel', labelEn: 'Real', color: 'hsl(var(--profit))', icon: '💰', emoji: '💰', defaultColor: 'hsl(var(--profit))', description: { fr: 'Compte réel', en: 'Real account' } },
  demo: { label: 'Démo', labelFr: 'Démo', labelEn: 'Demo', color: 'hsl(var(--primary))', icon: '🎮', emoji: '🎮', defaultColor: 'hsl(217, 91%, 60%)', description: { fr: 'Compte démo', en: 'Demo account' } },
  funded: { label: 'Funded', labelFr: 'Funded', labelEn: 'Funded', color: 'hsl(280, 70%, 50%)', icon: '🏆', emoji: '🏆', defaultColor: 'hsl(280, 70%, 50%)', description: { fr: 'Compte funded', en: 'Funded account' } },
  prop: { label: 'Prop Firm', labelFr: 'Prop Firm', labelEn: 'Prop Firm', color: 'hsl(45, 93%, 47%)', icon: '🏢', emoji: '🏢', defaultColor: 'hsl(45, 93%, 47%)', description: { fr: 'Prop firm', en: 'Prop firm' } },
};

const ACCOUNTS_KEY = 'stt_trading_accounts';

const getStoredAccounts = (): TradingAccount[] => {
  try {
    const stored = localStorage.getItem(ACCOUNTS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  const defaultAccount: TradingAccount = {
    id: 'default',
    name: 'Compte Principal',
    type: 'personal',
    capital: 10000,
    currency: 'USD',
    emoji: '👤',
    color: 'hsl(var(--primary))',
    isActive: true,
    createdAt: new Date().toISOString(),
  };
  return [defaultAccount];
};

export const useAccounts = () => {
  const [accounts, setAccounts] = useState<TradingAccount[]>(getStoredAccounts);

  const saveAccounts = useCallback((newAccounts: TradingAccount[]) => {
    setAccounts(newAccounts);
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(newAccounts));
  }, []);

  const addAccount = useCallback((account: Omit<TradingAccount, 'id' | 'createdAt' | 'isActive'>) => {
    const newAccount: TradingAccount = {
      ...account,
      id: crypto.randomUUID(),
      isActive: false,
      createdAt: new Date().toISOString(),
    };
    saveAccounts([...accounts, newAccount]);
    return newAccount;
  }, [accounts, saveAccounts]);

  const updateAccount = useCallback((id: string, updates: Partial<TradingAccount>) => {
    saveAccounts(accounts.map(a => a.id === id ? { ...a, ...updates } : a));
  }, [accounts, saveAccounts]);

  const deleteAccount = useCallback((id: string) => {
    if (accounts.length <= 1) return;
    const newAccounts = accounts.filter(a => a.id !== id);
    if (!newAccounts.some(a => a.isActive) && newAccounts.length > 0) {
      newAccounts[0].isActive = true;
    }
    saveAccounts(newAccounts);
  }, [accounts, saveAccounts]);

  const setActiveAccount = useCallback((id: string) => {
    saveAccounts(accounts.map(a => ({ ...a, isActive: a.id === id })));
  }, [accounts, saveAccounts]);

  const activeAccount = useMemo(() => accounts.find(a => a.isActive) || accounts[0], [accounts]);

  return {
    accounts,
    activeAccount,
    addAccount,
    updateAccount,
    deleteAccount,
    setActiveAccount,
  };
};

export const useActiveAccount = () => {
  const result = useAccounts();
  return result;
};
