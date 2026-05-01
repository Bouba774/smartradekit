import React, { useState } from 'react';
import { useAccount, Account } from '@/contexts/AccountContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Briefcase,
  ChevronDown,
  Plus,
  Edit3,
  Trash2,
  Check,
  Palette,
} from 'lucide-react';
import { toast } from 'sonner';

const ACCOUNT_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#F97316', '#14B8A6', '#6366F1',
];

const ACCOUNT_TYPES = [
  { value: 'personal', labelFr: 'Personnel', labelEn: 'Personal' },
  { value: 'propfirm', labelFr: 'Prop Firm', labelEn: 'Prop Firm' },
  { value: 'demo', labelFr: 'Démo', labelEn: 'Demo' },
  { value: 'custom', labelFr: 'Autre', labelEn: 'Other' },
];

export const AccountSwitcherDropdown: React.FC = () => {
  const { accounts, currentAccount, switchAccount } = useAccount();
  const { language } = useLanguage();

  if (accounts.length <= 1 || !currentAccount) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 max-w-[180px]">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: currentAccount.color || '#3B82F6' }}
          />
          <span className="truncate text-xs">{currentAccount.name}</span>
          <ChevronDown className="w-3 h-3 flex-shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {accounts.map((account) => (
          <DropdownMenuItem
            key={account.id}
            onClick={() => switchAccount(account.id)}
            className="gap-2"
          >
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: account.color || '#3B82F6' }}
            />
            <span className="truncate">{account.name}</span>
            {account.id === currentAccount.id && (
              <Check className="w-4 h-4 ml-auto text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const AccountManager: React.FC = () => {
  const { accounts, currentAccount, currentAccountId, switchAccount, createAccount, deleteAccount, updateAccount } = useAccount();
  const { language } = useLanguage();
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState<Account | null>(null);
  const [showDelete, setShowDelete] = useState<Account | null>(null);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('personal');
  const [newColor, setNewColor] = useState('#3B82F6');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    // Prevent duplicate names (case-insensitive) for same user
    const exists = accounts.some(a => a.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      toast.error(language === 'fr' ? 'Un compte avec ce nom existe déjà' : 'An account with this name already exists');
      return;
    }
    setIsSubmitting(true);
    try {
      await createAccount(trimmed, newType, newColor);
      toast.success(language === 'fr' ? 'Compte créé !' : 'Account created!');
      setShowCreate(false);
      setNewName('');
      setNewType('personal');
      setNewColor('#3B82F6');
    } catch {
      toast.error(language === 'fr' ? 'Erreur lors de la création' : 'Creation error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!showEdit || !newName.trim()) return;
    setIsSubmitting(true);
    try {
      await updateAccount(showEdit.id, {
        name: newName.trim(),
        account_type: newType,
        color: newColor,
      });
      toast.success(language === 'fr' ? 'Compte mis à jour !' : 'Account updated!');
      setShowEdit(null);
    } catch {
      toast.error(language === 'fr' ? 'Erreur' : 'Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!showDelete) return;
    setIsSubmitting(true);
    try {
      const success = await deleteAccount(showDelete.id);
      if (success) {
        toast.success(language === 'fr' ? 'Compte supprimé' : 'Account deleted');
      } else {
        toast.error(language === 'fr' ? 'Impossible de supprimer le seul compte' : 'Cannot delete the only account');
      }
      setShowDelete(null);
    } catch {
      toast.error(language === 'fr' ? 'Erreur' : 'Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const found = ACCOUNT_TYPES.find(t => t.value === type);
    return found ? (language === 'fr' ? found.labelFr : found.labelEn) : type;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-primary" />
          {language === 'fr' ? 'Mes comptes' : 'My Accounts'}
        </h3>
        <Button
          size="sm"
          onClick={() => {
            setNewName('');
            setNewType('personal');
            setNewColor('#3B82F6');
            setShowCreate(true);
          }}
          className="gap-1"
        >
          <Plus className="w-4 h-4" />
          {language === 'fr' ? 'Créer' : 'Create'}
        </Button>
      </div>

      {/* Account list */}
      <div className="space-y-2">
        {accounts.map((account) => (
          <div
            key={account.id}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
              account.id === currentAccountId
                ? 'border-primary/50 bg-primary/5'
                : 'border-border/50 hover:border-primary/30'
            }`}
            onClick={() => switchAccount(account.id)}
          >
            <div
              className="w-4 h-4 rounded-full flex-shrink-0 ring-2 ring-offset-2 ring-offset-background"
            style={{
                backgroundColor: account.color || '#3B82F6',
                boxShadow: account.id === currentAccountId ? `0 0 0 2px var(--background), 0 0 0 4px ${account.color || '#3B82F6'}` : undefined,
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground truncate">{account.name}</p>
              <p className="text-xs text-muted-foreground">{getTypeLabel(account.account_type)}</p>
            </div>
            {account.id === currentAccountId && (
              <Badge variant="default" className="text-[10px] px-1.5 py-0">
                {language === 'fr' ? 'Actif' : 'Active'}
              </Badge>
            )}
            <div className="flex gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  setNewName(account.name);
                  setNewType(account.account_type || 'personal');
                  setNewColor(account.color || '#3B82F6');
                  setShowEdit(account);
                }}
              >
                <Edit3 className="w-3 h-3" />
              </Button>
              {accounts.length > 1 && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDelete(account);
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === 'fr' ? 'Nouveau compte' : 'New Account'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                {language === 'fr' ? 'Nom du compte' : 'Account name'}
              </label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={language === 'fr' ? 'Ex: Prop Firm FTMO' : 'E.g. Prop Firm FTMO'}
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                {language === 'fr' ? 'Type' : 'Type'}
              </label>
              <Select value={newType} onValueChange={setNewType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACCOUNT_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>
                      {language === 'fr' ? t.labelFr : t.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                <Palette className="w-4 h-4 inline mr-1" />
                {language === 'fr' ? 'Couleur' : 'Color'}
              </label>
              <div className="flex gap-2 flex-wrap">
                {ACCOUNT_COLORS.map(color => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full transition-transform ${
                      newColor === color ? 'scale-125 ring-2 ring-offset-2 ring-offset-background ring-primary' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewColor(color)}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              {language === 'fr' ? 'Annuler' : 'Cancel'}
            </Button>
            <Button onClick={handleCreate} disabled={!newName.trim() || isSubmitting}>
              {language === 'fr' ? 'Créer le compte' : 'Create Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={!!showRename} onOpenChange={(open) => !open && setShowRename(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === 'fr' ? 'Renommer le compte' : 'Rename Account'}
            </DialogTitle>
          </DialogHeader>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRename(null)}>
              {language === 'fr' ? 'Annuler' : 'Cancel'}
            </Button>
            <Button onClick={handleRename} disabled={!newName.trim() || isSubmitting}>
              {language === 'fr' ? 'Renommer' : 'Rename'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!showDelete} onOpenChange={(open) => !open && setShowDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'fr' ? 'Supprimer ce compte ?' : 'Delete this account?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'fr'
                ? `Toutes les données associées au compte "${showDelete?.name}" seront définitivement supprimées (trades, journal, défis). Cette action est irréversible.`
                : `All data associated with account "${showDelete?.name}" will be permanently deleted (trades, journal, challenges). This action is irreversible.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{language === 'fr' ? 'Annuler' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {language === 'fr' ? 'Supprimer définitivement' : 'Delete permanently'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
