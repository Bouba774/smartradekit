import { useState, useCallback, useMemo } from 'react';

export type AccountType = 'real' | 'demo' | 'funded' | 'prop';

export interface TradingAccount {
  id: string;
  name: string;
  type: AccountType;
  broker?: string;
  isActive: boolean;
  createdAt: string;
}

export const ACCOUNT_TYPE_CONFIG: Record<AccountType, { label: string; labelEn: string; color: string; icon: string }> = {
  real: { label: 'Réel', labelEn: 'Real', color: 'hsl(var(--profit))', icon: '💰' },
  demo: { label: 'Démo', labelEn: 'Demo', color: 'hsl(var(--primary))', icon: '🎮' },
  funded: { label: 'Funded', labelEn: 'Funded', color: 'hsl(280, 70%, 50%)', icon: '🏆' },
  prop: { label: 'Prop Firm', labelEn: 'Prop Firm', color: 'hsl(45, 93%, 47%)', icon: '🏢' },
};

const ACCOUNTS_KEY = 'stt_trading_accounts';
const ACTIVE_ACCOUNT_KEY = 'stt_active_account';

const getStoredAccounts = (): TradingAccount[] => {
  try {
    const stored = localStorage.getItem(ACCOUNTS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  const defaultAccount: TradingAccount = {
    id: 'default',
    name: 'Compte Principal',
    type: 'real',
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
    localStorage.setItem(ACTIVE_ACCOUNT_KEY, id);
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
  const { activeAccount } = useAccounts();
  return activeAccount;
};
