 import React, { useMemo, useState, useCallback } from 'react';
 import { useLanguage } from '@/contexts/LanguageContext';
 import { useAdmin } from '@/contexts/AdminContext';
 import { supabase } from '@/integrations/supabase/client';
 import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Badge } from '@/components/ui/badge';
 import { ScrollArea } from '@/components/ui/scroll-area';
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from '@/components/ui/select';
 import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
 } from '@/components/ui/table';
 import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
   AlertDialogTrigger,
 } from '@/components/ui/alert-dialog';
 import { format, parseISO } from 'date-fns';
 import { fr, enUS } from 'date-fns/locale';
 import {
   Crown,
   Shield,
   User,
   Loader2,
   AlertCircle,
   RefreshCw,
   Download,
   UserPlus,
   Trash2,
   Search,
   Mail,
   CheckCircle,
   Users,
   ShieldCheck,
 } from 'lucide-react';
 import { toast } from 'sonner';
 import { jsPDF } from 'jspdf';
 import autoTable from 'jspdf-autotable';
 import {
   PieChart,
   Pie,
   Cell,
   ResponsiveContainer,
   Tooltip,
 } from 'recharts';
 
 type AppRole = 'admin' | 'moderator' | 'user';
 
 interface UserRole {
   id: string;
   user_id: string;
   role: AppRole;
   created_at: string;
 }
 
 interface AuthUserInfo {
   id: string;
   email: string | null;
   email_confirmed_at: string | null;
   created_at: string;
   last_sign_in_at: string | null;
 }
 
 const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];
 
 const AdminRolesPage: React.FC = () => {
   const { language } = useLanguage();
   const { isAdminVerified, allUsers } = useAdmin();
   const queryClient = useQueryClient();
   const locale = language === 'fr' ? fr : enUS;
 
   const [newEmail, setNewEmail] = useState('');
   const [newRole, setNewRole] = useState<AppRole>('moderator');
   const [isSearching, setIsSearching] = useState(false);
   const [foundUser, setFoundUser] = useState<AuthUserInfo | null>(null);
   const [searchFilter, setSearchFilter] = useState('');
 
   // Fetch all user roles
   const { data: userRoles = [], isLoading, refetch } = useQuery({
     queryKey: ['admin-all-user-roles'],
     queryFn: async () => {
       const { data, error } = await supabase
         .from('user_roles')
         .select('*')
         .order('created_at', { ascending: false });
 
       if (error) throw error;
       return data as UserRole[];
     },
     enabled: isAdminVerified,
   });
 
   // Fetch auth user info for all users
   const { data: authUsers = [] } = useQuery({
     queryKey: ['admin-auth-users-info'],
     queryFn: async () => {
       const { data: { session } } = await supabase.auth.getSession();
       if (!session?.access_token) return [];
 
       const response = await fetch(
         `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-users-info`,
         {
           headers: {
             'Authorization': `Bearer ${session.access_token}`,
             'Content-Type': 'application/json',
           },
         }
       );
 
       if (!response.ok) return [];
       const result = await response.json();
       return result.users as AuthUserInfo[];
     },
     enabled: isAdminVerified,
   });
 
   // Create maps for quick lookup
   const authUserMap = useMemo(() => {
     const map = new Map<string, AuthUserInfo>();
     authUsers.forEach(user => map.set(user.id, user));
     return map;
   }, [authUsers]);
 
   const userNicknameMap = useMemo(() => {
     const map = new Map<string, string>();
     allUsers.forEach(user => map.set(user.id, user.nickname));
     return map;
   }, [allUsers]);
 
   // Roles with user info
   const rolesWithInfo = useMemo(() => {
     return userRoles.map(role => ({
       ...role,
       email: authUserMap.get(role.user_id)?.email || null,
       nickname: userNicknameMap.get(role.user_id) || null,
       lastSignIn: authUserMap.get(role.user_id)?.last_sign_in_at || null,
     }));
   }, [userRoles, authUserMap, userNicknameMap]);
 
   // Filtered roles
   const filteredRoles = useMemo(() => {
     if (!searchFilter) return rolesWithInfo;
     const query = searchFilter.toLowerCase();
     return rolesWithInfo.filter(r => 
       r.email?.toLowerCase().includes(query) ||
       r.nickname?.toLowerCase().includes(query) ||
       r.role.toLowerCase().includes(query)
     );
   }, [rolesWithInfo, searchFilter]);
 
   // Role statistics
   const roleStats = useMemo(() => {
     const counts: Record<string, number> = { admin: 0, moderator: 0, user: 0 };
     userRoles.forEach(r => {
       counts[r.role] = (counts[r.role] || 0) + 1;
     });
     return Object.entries(counts).map(([name, value]) => ({ name, value }));
   }, [userRoles]);
 
   // Search user by email
   const searchUserByEmail = async () => {
     if (!newEmail.trim() || !newEmail.includes('@')) {
       toast.error(language === 'fr' ? 'Veuillez entrer une adresse email valide' : 'Please enter a valid email address');
       return;
     }
 
     setIsSearching(true);
     setFoundUser(null);
 
     try {
       const { data: { session } } = await supabase.auth.getSession();
       if (!session?.access_token) {
         toast.error(language === 'fr' ? 'Session expirée' : 'Session expired');
         return;
       }
 
       const response = await fetch(
         `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-user-by-email`,
         {
           method: 'POST',
           headers: {
             'Authorization': `Bearer ${session.access_token}`,
             'Content-Type': 'application/json',
           },
           body: JSON.stringify({ email: newEmail.trim() }),
         }
       );
 
       const result = await response.json();
 
       if (!response.ok || !result.found) {
         toast.error(language === 'fr' ? 'Utilisateur non trouvé' : 'User not found');
         return;
       }
 
       setFoundUser(result.user);
       toast.success(language === 'fr' ? 'Utilisateur trouvé!' : 'User found!');
     } catch {
       toast.error(language === 'fr' ? 'Erreur lors de la recherche' : 'Search error');
     } finally {
       setIsSearching(false);
     }
   };
 
   // Add role mutation
   const addRoleMutation = useMutation({
     mutationFn: async () => {
       if (!foundUser) throw new Error('No user found');
 
       // Check if user already has this role
       const { data: existingRole } = await supabase
         .from('user_roles')
         .select('id')
         .eq('user_id', foundUser.id)
         .eq('role', newRole)
         .single();
 
       if (existingRole) {
         throw new Error(language === 'fr' ? 'Cet utilisateur a déjà ce rôle' : 'User already has this role');
       }
 
       const { error } = await supabase
         .from('user_roles')
         .insert({ user_id: foundUser.id, role: newRole });
 
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['admin-all-user-roles'] });
       setNewEmail('');
       setFoundUser(null);
       toast.success(language === 'fr' ? 'Rôle ajouté avec succès' : 'Role added successfully');
     },
     onError: (error: Error) => {
       toast.error(error.message);
     },
   });
 
   // Delete role mutation
   const deleteRoleMutation = useMutation({
     mutationFn: async (roleId: string) => {
       const { error } = await supabase
         .from('user_roles')
         .delete()
         .eq('id', roleId);
 
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['admin-all-user-roles'] });
       toast.success(language === 'fr' ? 'Rôle supprimé' : 'Role deleted');
     },
     onError: () => {
       toast.error(language === 'fr' ? 'Erreur lors de la suppression' : 'Error deleting role');
     },
   });
 
   // Export to PDF
   const exportToPDF = useCallback(() => {
     if (!filteredRoles.length) {
       toast.error(language === 'fr' ? 'Aucune donnée à exporter' : 'No data to export');
       return;
     }
 
     try {
       const doc = new jsPDF('portrait', 'mm', 'a4');
       const pageWidth = doc.internal.pageSize.getWidth();
 
       doc.setFillColor(34, 34, 34);
       doc.rect(0, 0, pageWidth, 25, 'F');
       doc.setTextColor(255, 255, 255);
       doc.setFontSize(18);
       doc.text(language === 'fr' ? 'Rapport des Rôles' : 'Roles Report', 14, 16);
       doc.setFontSize(10);
       doc.text(format(new Date(), 'dd/MM/yyyy HH:mm'), pageWidth - 14, 16, { align: 'right' });
 
       doc.setTextColor(0, 0, 0);
 
       const tableData = filteredRoles.map(r => [
         r.nickname || '-',
         r.email || '-',
         r.role,
         format(parseISO(r.created_at), 'dd/MM/yy HH:mm'),
         r.lastSignIn ? format(parseISO(r.lastSignIn), 'dd/MM/yy HH:mm') : '-',
       ]);
 
       autoTable(doc, {
         startY: 35,
         head: [['Nickname', 'Email', language === 'fr' ? 'Rôle' : 'Role', language === 'fr' ? 'Date création' : 'Created', language === 'fr' ? 'Dernière connexion' : 'Last sign in']],
         body: tableData,
         styles: { fontSize: 9, cellPadding: 3 },
         headStyles: { fillColor: [59, 130, 246], textColor: 255 },
         alternateRowStyles: { fillColor: [245, 245, 245] },
       });
 
       doc.save(`roles_report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
       toast.success(language === 'fr' ? 'Export PDF réussi' : 'PDF export successful');
     } catch {
       toast.error(language === 'fr' ? 'Erreur lors de l\'export' : 'Export error');
     }
   }, [filteredRoles, language]);
 
   const getRoleIcon = (role: AppRole) => {
     switch (role) {
       case 'admin': return <Crown className="w-4 h-4" />;
       case 'moderator': return <Shield className="w-4 h-4" />;
       default: return <User className="w-4 h-4" />;
     }
   };
 
   const getRoleBadgeVariant = (role: AppRole) => {
     switch (role) {
       case 'admin': return 'default';
       case 'moderator': return 'secondary';
       default: return 'outline';
     }
   };
 
   if (!isAdminVerified) {
     return (
       <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
         <AlertCircle className="w-16 h-16 text-muted-foreground/50" />
         <p className="text-muted-foreground">
           {language === 'fr' ? 'Vérification admin requise' : 'Admin verification required'}
         </p>
       </div>
     );
   }
 
   return (
     <div className="space-y-6">
       {/* Header */}
       <div className="flex items-center justify-between">
         <div>
           <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
             {language === 'fr' ? 'Gestion des Rôles' : 'Role Management'}
           </h1>
           <p className="text-muted-foreground text-sm mt-1">
             {language === 'fr' ? 'Gérer les rôles et permissions' : 'Manage roles and permissions'}
           </p>
         </div>
         <div className="flex items-center gap-2">
           <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
             <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
             {language === 'fr' ? 'Actualiser' : 'Refresh'}
           </Button>
           <Button variant="outline" size="sm" onClick={exportToPDF}>
             <Download className="w-4 h-4 mr-2" />
             PDF
           </Button>
         </div>
       </div>
 
       {/* Stats */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <Card className="glass-card">
           <CardContent className="pt-6">
             <div className="flex items-center gap-2">
               <Users className="w-5 h-5 text-primary" />
               <p className="text-2xl font-bold">{userRoles.length}</p>
             </div>
             <p className="text-sm text-muted-foreground">{language === 'fr' ? 'Total rôles' : 'Total roles'}</p>
           </CardContent>
         </Card>
         <Card className="glass-card">
           <CardContent className="pt-6">
             <div className="flex items-center gap-2">
               <Crown className="w-5 h-5 text-warning" />
               <p className="text-2xl font-bold">{roleStats.find(r => r.name === 'admin')?.value || 0}</p>
             </div>
             <p className="text-sm text-muted-foreground">Admins</p>
           </CardContent>
         </Card>
         <Card className="glass-card">
           <CardContent className="pt-6">
             <div className="flex items-center gap-2">
               <Shield className="w-5 h-5 text-chart-2" />
               <p className="text-2xl font-bold">{roleStats.find(r => r.name === 'moderator')?.value || 0}</p>
             </div>
             <p className="text-sm text-muted-foreground">Moderators</p>
           </CardContent>
         </Card>
         <Card className="glass-card">
           <CardContent className="pt-6">
             <div className="h-16">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={roleStats}
                     cx="50%"
                     cy="50%"
                     innerRadius={15}
                     outerRadius={30}
                     paddingAngle={2}
                     dataKey="value"
                   >
                     {roleStats.map((_, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                   </Pie>
                   <Tooltip />
                 </PieChart>
               </ResponsiveContainer>
             </div>
           </CardContent>
         </Card>
       </div>
 
       {/* Add Role Card */}
       <Card className="glass-card">
         <CardHeader>
           <CardTitle className="flex items-center gap-2">
             <UserPlus className="w-5 h-5 text-primary" />
             {language === 'fr' ? 'Ajouter un Rôle' : 'Add a Role'}
           </CardTitle>
         </CardHeader>
         <CardContent className="space-y-4">
           <div className="flex flex-col sm:flex-row gap-3">
             <div className="flex-1 relative">
               <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
               <Input
                 type="email"
                 placeholder={language === 'fr' ? 'Adresse email' : 'Email address'}
                 value={newEmail}
                 onChange={(e) => {
                   setNewEmail(e.target.value);
                   setFoundUser(null);
                 }}
                 className="pl-10"
               />
             </div>
             <Button onClick={searchUserByEmail} disabled={isSearching || !newEmail.includes('@')} variant="secondary">
               {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
               <span className="ml-2">{language === 'fr' ? 'Rechercher' : 'Search'}</span>
             </Button>
           </div>
 
           {foundUser && (
             <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
               <div className="flex items-center gap-3">
                 <CheckCircle className="w-5 h-5 text-profit" />
                 <div className="flex-1">
                   <p className="font-medium">{foundUser.email}</p>
                   <p className="text-xs text-muted-foreground">
                     ID: {foundUser.id.slice(0, 8)}... | {language === 'fr' ? 'Créé le' : 'Created'} {format(parseISO(foundUser.created_at), 'dd MMM yyyy', { locale })}
                   </p>
                 </div>
               </div>
 
               <div className="flex flex-col sm:flex-row gap-3 mt-4">
                 <Select value={newRole} onValueChange={(v: AppRole) => setNewRole(v)}>
                   <SelectTrigger className="w-full sm:w-40">
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="admin">
                       <div className="flex items-center gap-2">
                         <Crown className="w-4 h-4 text-primary" /> Admin
                       </div>
                     </SelectItem>
                     <SelectItem value="moderator">
                       <div className="flex items-center gap-2">
                         <Shield className="w-4 h-4 text-blue-500" /> Moderator
                       </div>
                     </SelectItem>
                     <SelectItem value="user">
                       <div className="flex items-center gap-2">
                         <User className="w-4 h-4 text-muted-foreground" /> User
                       </div>
                     </SelectItem>
                   </SelectContent>
                 </Select>
                 <Button onClick={() => addRoleMutation.mutate()} disabled={addRoleMutation.isPending}>
                   {addRoleMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                   <span className="ml-2">{language === 'fr' ? 'Ajouter' : 'Add'}</span>
                 </Button>
               </div>
             </div>
           )}
         </CardContent>
       </Card>
 
       {/* Roles Table */}
       <Card className="glass-card">
         <CardHeader>
           <div className="flex items-center justify-between">
             <CardTitle className="flex items-center gap-2">
               <ShieldCheck className="w-5 h-5 text-primary" />
               {language === 'fr' ? 'Liste des Rôles' : 'Roles List'}
               <Badge variant="secondary">{filteredRoles.length}</Badge>
             </CardTitle>
             <div className="relative w-64">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
               <Input
                 placeholder={language === 'fr' ? 'Rechercher...' : 'Search...'}
                 value={searchFilter}
                 onChange={(e) => setSearchFilter(e.target.value)}
                 className="pl-10"
               />
             </div>
           </div>
         </CardHeader>
         <CardContent>
           {isLoading ? (
             <div className="flex justify-center py-8">
               <Loader2 className="w-8 h-8 animate-spin text-primary" />
             </div>
           ) : filteredRoles.length === 0 ? (
             <div className="text-center py-8 text-muted-foreground">
               {language === 'fr' ? 'Aucun rôle trouvé' : 'No roles found'}
             </div>
           ) : (
             <ScrollArea className="h-[500px]">
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>Nickname</TableHead>
                     <TableHead>Email</TableHead>
                     <TableHead>{language === 'fr' ? 'Rôle' : 'Role'}</TableHead>
                     <TableHead>{language === 'fr' ? 'Créé le' : 'Created'}</TableHead>
                     <TableHead>{language === 'fr' ? 'Dernière connexion' : 'Last sign in'}</TableHead>
                     <TableHead></TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {filteredRoles.map((role) => (
                     <TableRow key={role.id}>
                       <TableCell className="font-medium">{role.nickname || '-'}</TableCell>
                       <TableCell className="text-sm">{role.email || role.user_id.slice(0, 8) + '...'}</TableCell>
                       <TableCell>
                         <Badge variant={getRoleBadgeVariant(role.role)} className="flex items-center gap-1 w-fit">
                           {getRoleIcon(role.role)}
                           {role.role}
                         </Badge>
                       </TableCell>
                       <TableCell className="text-sm text-muted-foreground">
                         {format(parseISO(role.created_at), 'dd/MM/yy HH:mm')}
                       </TableCell>
                       <TableCell className="text-sm text-muted-foreground">
                         {role.lastSignIn ? format(parseISO(role.lastSignIn), 'dd/MM/yy HH:mm') : '-'}
                       </TableCell>
                       <TableCell>
                         <AlertDialog>
                           <AlertDialogTrigger asChild>
                             <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                               <Trash2 className="w-4 h-4" />
                             </Button>
                           </AlertDialogTrigger>
                           <AlertDialogContent>
                             <AlertDialogHeader>
                               <AlertDialogTitle>
                                 {language === 'fr' ? 'Supprimer ce rôle ?' : 'Delete this role?'}
                               </AlertDialogTitle>
                               <AlertDialogDescription>
                                 {language === 'fr' 
                                   ? 'Cette action est irréversible. L\'utilisateur perdra ses permissions.'
                                   : 'This action cannot be undone. The user will lose their permissions.'}
                               </AlertDialogDescription>
                             </AlertDialogHeader>
                             <AlertDialogFooter>
                               <AlertDialogCancel>{language === 'fr' ? 'Annuler' : 'Cancel'}</AlertDialogCancel>
                               <AlertDialogAction
                                 onClick={() => deleteRoleMutation.mutate(role.id)}
                                 className="bg-destructive text-destructive-foreground"
                               >
                                 {language === 'fr' ? 'Supprimer' : 'Delete'}
                               </AlertDialogAction>
                             </AlertDialogFooter>
                           </AlertDialogContent>
                         </AlertDialog>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             </ScrollArea>
           )}
         </CardContent>
       </Card>
     </div>
   );
 };
 
 export default AdminRolesPage;
