import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Account {
  id: string;
  user_id: string;
  name: string;
  account_type: string;
  color: string | null;
  order_index: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

interface AccountContextType {
  accounts: Account[];
  currentAccount: Account | null;
  currentAccountId: string | null;
  isLoading: boolean;
  switchAccount: (accountId: string) => void;
  createAccount: (name: string, type: string, color?: string) => Promise<Account | null>;
  renameAccount: (accountId: string, name: string) => Promise<void>;
  deleteAccount: (accountId: string) => Promise<boolean>;
  updateAccountOrder: (accounts: { id: string; order_index: number }[]) => Promise<void>;
  updateAccountColor: (accountId: string, color: string) => Promise<void>;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

const CURRENT_ACCOUNT_KEY = 'stt-current-account-id';

export const AccountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentAccountId, setCurrentAccountId] = useState<string | null>(
    () => localStorage.getItem(CURRENT_ACCOUNT_KEY)
  );

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['accounts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('order_index', { ascending: true });
      if (error) throw error;
      return data as Account[];
    },
    enabled: !!user,
  });

  // Auto-create default account if none exist
  useEffect(() => {
    if (!user || isLoading || accounts.length > 0) return;
    
    const createDefault = async () => {
      const { data, error } = await supabase
        .from('accounts')
        .insert({
          user_id: user.id,
          name: 'Compte principal',
          account_type: 'personal',
          is_default: true,
          order_index: 0,
          color: '#3B82F6',
        })
        .select()
        .single();
      
      if (!error && data) {
        queryClient.invalidateQueries({ queryKey: ['accounts', user.id] });
      }
    };
    createDefault();
  }, [user, isLoading, accounts.length, queryClient]);

  // Auto-select current account
  useEffect(() => {
    if (accounts.length === 0) return;
    
    const stored = currentAccountId;
    const validStored = stored && accounts.find(a => a.id === stored);
    
    if (validStored) return;
    
    const defaultAccount = accounts.find(a => a.is_default) || accounts[0];
    if (defaultAccount) {
      setCurrentAccountId(defaultAccount.id);
      localStorage.setItem(CURRENT_ACCOUNT_KEY, defaultAccount.id);
    }
  }, [accounts, currentAccountId]);

  const currentAccount = accounts.find(a => a.id === currentAccountId) || null;

  const switchAccount = useCallback((accountId: string) => {
    setCurrentAccountId(accountId);
    localStorage.setItem(CURRENT_ACCOUNT_KEY, accountId);
    // Invalidate all account-dependent queries
    queryClient.invalidateQueries({ queryKey: ['trades'] });
    queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
    queryClient.invalidateQueries({ queryKey: ['user_challenges'] });
  }, [queryClient]);

  const createAccount = useCallback(async (name: string, type: string, color?: string): Promise<Account | null> => {
    if (!user) return null;
    const maxOrder = accounts.reduce((max, a) => Math.max(max, a.order_index), -1);
    
    const { data, error } = await supabase
      .from('accounts')
      .insert({
        user_id: user.id,
        name,
        account_type: type,
        color: color || '#3B82F6',
        order_index: maxOrder + 1,
        is_default: false,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    queryClient.invalidateQueries({ queryKey: ['accounts', user.id] });
    
    if (data) {
      switchAccount(data.id);
    }
    
    return data as Account;
  }, [user, accounts, queryClient, switchAccount]);

  const renameAccount = useCallback(async (accountId: string, name: string) => {
    const { error } = await supabase
      .from('accounts')
      .update({ name })
      .eq('id', accountId);
    if (error) throw error;
    queryClient.invalidateQueries({ queryKey: ['accounts', user?.id] });
  }, [user, queryClient]);

  const deleteAccount = useCallback(async (accountId: string): Promise<boolean> => {
    if (accounts.length <= 1) return false;
    
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', accountId);
    
    if (error) throw error;
    
    // Switch to another account if we deleted the current one
    if (currentAccountId === accountId) {
      const remaining = accounts.filter(a => a.id !== accountId);
      if (remaining.length > 0) {
        switchAccount(remaining[0].id);
      }
    }
    
    queryClient.invalidateQueries({ queryKey: ['accounts', user?.id] });
    return true;
  }, [accounts, currentAccountId, user, queryClient, switchAccount]);

  const updateAccountOrder = useCallback(async (updates: { id: string; order_index: number }[]) => {
    for (const update of updates) {
      await supabase
        .from('accounts')
        .update({ order_index: update.order_index })
        .eq('id', update.id);
    }
    queryClient.invalidateQueries({ queryKey: ['accounts', user?.id] });
  }, [user, queryClient]);

  const updateAccountColor = useCallback(async (accountId: string, color: string) => {
    const { error } = await supabase
      .from('accounts')
      .update({ color })
      .eq('id', accountId);
    if (error) throw error;
    queryClient.invalidateQueries({ queryKey: ['accounts', user?.id] });
  }, [user, queryClient]);

  // Clear stored account on sign out
  useEffect(() => {
    if (!user) {
      setCurrentAccountId(null);
      localStorage.removeItem(CURRENT_ACCOUNT_KEY);
    }
  }, [user]);

  return (
    <AccountContext.Provider value={{
      accounts,
      currentAccount,
      currentAccountId,
      isLoading,
      switchAccount,
      createAccount,
      renameAccount,
      deleteAccount,
      updateAccountOrder,
      updateAccountColor,
    }}>
      {children}
    </AccountContext.Provider>
  );
};

export const useAccount = () => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return context;
};
