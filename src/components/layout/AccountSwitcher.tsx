import React, { useState } from 'react';
import { ChevronDown, Plus, Check, Pencil, Trash2, Wallet } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAccounts, useActiveAccount, ACCOUNT_TYPE_CONFIG, TradingAccount } from '@/hooks/useAccounts';
import { useLanguage } from '@/contexts/LanguageContext';
import AccountFormDialog from './AccountFormDialog';

interface AccountSwitcherProps {
  compact?: boolean;
}

const AccountSwitcher: React.FC<AccountSwitcherProps> = ({ compact = false }) => {
  const { language } = useLanguage();
  const { accounts, activeAccount, setActiveAccount } = useActiveAccount();
  const { deleteAccount } = useAccounts();
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<TradingAccount | null>(null);
  const fr = language === 'fr';

  if (!activeAccount) return null;

  const config = ACCOUNT_TYPE_CONFIG[activeAccount.type];

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size={compact ? 'sm' : 'default'}
            className={cn(
              'flex items-center gap-2 border border-border/50 rounded-lg px-3 py-1.5 h-auto',
              'hover:bg-primary/10 hover:border-primary/40 transition-all'
            )}
          >
            {/* Indicateur couleur + emoji */}
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: activeAccount.color }}
            />
            <span className="text-sm font-medium text-foreground truncate max-w-[120px]">
              {compact ? activeAccount.emoji : `${activeAccount.emoji} ${activeAccount.name}`}
            </span>
            {accounts.length > 1 && (
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-64 bg-card border-border shadow-xl">
          {/* Liste des comptes */}
          <div className="px-2 py-1.5">
            <p className="text-xs text-muted-foreground font-medium px-2 mb-1">
              {fr ? 'Mes comptes' : 'My accounts'}
            </p>
            {accounts.map(account => {
              const acConfig = ACCOUNT_TYPE_CONFIG[account.type];
              const isActive = account.id === activeAccount.id;
              return (
                <div key={account.id} className="flex items-center gap-1 group">
                  <DropdownMenuItem
                    className={cn(
                      'flex-1 flex items-center gap-2.5 rounded-lg px-2 py-2 cursor-pointer',
                      isActive && 'bg-primary/10'
                    )}
                    onClick={() => setActiveAccount(account.id)}
                  >
                    {/* Couleur dot */}
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: account.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium truncate">{account.emoji} {account.name}</span>
                        {isActive && <Check className="w-3 h-3 text-primary flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {fr ? acConfig.labelFr : acConfig.labelEn} • ${account.capital.toLocaleString()}
                      </p>
                    </div>
                  </DropdownMenuItem>

                  {/* Actions edit/delete */}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingAccount(account);
                        setShowForm(true);
                      }}
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                    {accounts.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteAccount(account.id);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <DropdownMenuSeparator />

          {/* Ajouter un compte */}
          <DropdownMenuItem
            className="flex items-center gap-2 px-4 py-2.5 cursor-pointer text-primary"
            onClick={() => {
              setEditingAccount(null);
              setShowForm(true);
            }}
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">
              {fr ? 'Ajouter un compte' : 'Add account'}
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog création / édition */}
      {showForm && (
        <AccountFormDialog
          account={editingAccount}
          onClose={() => {
            setShowForm(false);
            setEditingAccount(null);
          }}
        />
      )}
    </>
  );
};

export default AccountSwitcher;
