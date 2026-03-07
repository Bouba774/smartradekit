import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAccounts, TradingAccount, AccountType, ACCOUNT_TYPE_CONFIG } from '@/hooks/useAccounts';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AccountFormDialogProps {
  account?: TradingAccount | null;
  onClose: () => void;
}

const ACCOUNT_COLORS = [
  '#06b6d4', '#10b981', '#8b5cf6', '#f59e0b',
  '#ef4444', '#3b82f6', '#ec4899', '#14b8a6',
];

const ACCOUNT_EMOJIS = ['👤', '💼', '🎓', '🏆', '🚀', '💎', '⚡', '🎯'];

const AccountFormDialog: React.FC<AccountFormDialogProps> = ({ account, onClose }) => {
  const { language } = useLanguage();
  const { addAccount, updateAccount, setActiveAccount } = useAccounts();
  const fr = language === 'fr';

  const [name, setName] = useState(account?.name || '');
  const [type, setType] = useState<AccountType>(account?.type || 'personal');
  const [capital, setCapital] = useState(account?.capital?.toString() || '10000');
  const [currency, setCurrency] = useState(account?.currency || 'USD');
  const [broker, setBroker] = useState(account?.broker || '');
  const [color, setColor] = useState(account?.color || ACCOUNT_COLORS[0]);
  const [emoji, setEmoji] = useState(account?.emoji || '👤');

  const isEdit = !!account;

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error(fr ? 'Le nom du compte est requis' : 'Account name is required');
      return;
    }
    const cap = parseFloat(capital);
    if (isNaN(cap) || cap <= 0) {
      toast.error(fr ? 'Capital invalide' : 'Invalid capital');
      return;
    }

    if (isEdit) {
      updateAccount(account.id, { name: name.trim(), type, capital: cap, currency, broker, color, emoji });
      toast.success(fr ? '✅ Compte mis à jour' : '✅ Account updated');
    } else {
      const newAcc = addAccount({ name: name.trim(), type, capital: cap, currency, broker, color, emoji });
      setActiveAccount(newAcc.id);
      toast.success(fr ? '✅ Compte créé et activé' : '✅ Account created and activated');
    }
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-xl">{emoji}</span>
            {isEdit
              ? (fr ? 'Modifier le compte' : 'Edit account')
              : (fr ? 'Nouveau compte' : 'New account')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Type de compte */}
          <div>
            <Label className="text-sm mb-2 block">
              {fr ? 'Type de compte' : 'Account type'}
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(ACCOUNT_TYPE_CONFIG) as AccountType[]).map(t => {
                const cfg = ACCOUNT_TYPE_CONFIG[t];
                return (
                  <button
                    key={t}
                    onClick={() => {
                      setType(t);
                      setEmoji(cfg.emoji);
                      setColor(cfg.defaultColor);
                    }}
                    className={cn(
                      'flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all',
                      type === t
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-background hover:border-primary/40'
                    )}
                  >
                    <span className="text-lg">{cfg.emoji}</span>
                    <div>
                      <p className="text-xs font-medium leading-tight">
                        {fr ? cfg.labelFr : cfg.labelEn}
                      </p>
                      <p className="text-xs text-muted-foreground leading-tight">
                        {fr ? cfg.description.fr : cfg.description.en}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Nom */}
          <div>
            <Label className="text-sm">{fr ? 'Nom du compte' : 'Account name'}</Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={fr ? 'Ex: FTMO Challenge' : 'Ex: FTMO Challenge'}
              className="mt-1"
              maxLength={30}
            />
          </div>

          {/* Capital + Devise */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm">{fr ? 'Capital ($)' : 'Capital ($)'}</Label>
              <Input
                type="number"
                value={capital}
                onChange={e => setCapital(e.target.value)}
                placeholder="10000"
                className="mt-1"
                min={1}
              />
            </div>
            <div>
              <Label className="text-sm">{fr ? 'Devise' : 'Currency'}</Label>
              <Input
                value={currency}
                onChange={e => setCurrency(e.target.value.toUpperCase())}
                placeholder="USD"
                className="mt-1"
                maxLength={5}
              />
            </div>
          </div>

          {/* Broker (optionnel) */}
          <div>
            <Label className="text-sm">Broker <span className="text-muted-foreground text-xs">({fr ? 'optionnel' : 'optional'})</span></Label>
            <Input
              value={broker}
              onChange={e => setBroker(e.target.value)}
              placeholder="Ex: FTMO, Pepperstone..."
              className="mt-1"
              maxLength={40}
            />
          </div>

          {/* Couleur */}
          <div>
            <Label className="text-sm">{fr ? 'Couleur' : 'Color'}</Label>
            <div className="flex gap-2 mt-2 flex-wrap">
              {ACCOUNT_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    'w-7 h-7 rounded-full border-2 transition-all',
                    color === c ? 'border-white scale-110' : 'border-transparent'
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Emoji */}
          <div>
            <Label className="text-sm">Emoji</Label>
            <div className="flex gap-2 mt-2 flex-wrap">
              {ACCOUNT_EMOJIS.map(e => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={cn(
                    'w-9 h-9 text-xl rounded-lg border transition-all flex items-center justify-center',
                    emoji === e ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40'
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              {fr ? 'Annuler' : 'Cancel'}
            </Button>
            <Button className="flex-1" onClick={handleSubmit}>
              {isEdit ? (fr ? 'Mettre à jour' : 'Update') : (fr ? 'Créer' : 'Create')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccountFormDialog;
