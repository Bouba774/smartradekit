 import React, { useMemo, useState } from 'react';
 import { useLanguage } from '@/contexts/LanguageContext';
 import { useAdmin } from '@/contexts/AdminContext';
 import { useAdminSessions } from '@/hooks/useAdminSessions';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Badge } from '@/components/ui/badge';
 import { Button } from '@/components/ui/button';
 import { ScrollArea } from '@/components/ui/scroll-area';
 import { Skeleton } from '@/components/ui/skeleton';
 import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
 } from '@/components/ui/table';
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from '@/components/ui/select';
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
 } from '@/components/ui/dialog';
 import { format, parseISO, differenceInMinutes, subDays, isAfter } from 'date-fns';
 import { fr, enUS } from 'date-fns/locale';
 import {
   Monitor,
   Smartphone,
   Tablet,
   Globe,
   MapPin,
   Wifi,
   Clock,
   RefreshCw,
   AlertCircle,
   Eye,
   User,
   Calendar,
   Shield,
   Activity,
   Loader2,
 } from 'lucide-react';
 import {
   BarChart,
   Bar,
   XAxis,
   YAxis,
   Tooltip,
   ResponsiveContainer,
   PieChart,
   Pie,
   Cell,
 } from 'recharts';
 
 const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];
 
 const formatDuration = (minutes: number): string => {
   if (minutes < 1) return '< 1 min';
   if (minutes < 60) return `${Math.round(minutes)} min`;
   const hours = Math.floor(minutes / 60);
   const mins = Math.round(minutes % 60);
   return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
 };
 
 const AdminSessions: React.FC = () => {
   const { language } = useLanguage();
   const { selectedUser, isAdminVerified } = useAdmin();
   const { sessions, isLoading, refetch } = useAdminSessions();
   const locale = language === 'fr' ? fr : enUS;
 
   const [dateFilter, setDateFilter] = useState('30');
   const [deviceFilter, setDeviceFilter] = useState('all');
   const [selectedSession, setSelectedSession] = useState<typeof sessions[0] | null>(null);
   const [detailDialogOpen, setDetailDialogOpen] = useState(false);
 
   // Filtered sessions
   const filteredSessions = useMemo(() => {
     let filtered = [...sessions];
 
     if (dateFilter !== 'all') {
       const daysAgo = subDays(new Date(), parseInt(dateFilter));
       filtered = filtered.filter(s => isAfter(parseISO(s.session_start), daysAgo));
     }
 
     if (deviceFilter !== 'all') {
       filtered = filtered.filter(s => s.device_type === deviceFilter);
     }
 
     return filtered.sort((a, b) => 
       parseISO(b.session_start).getTime() - parseISO(a.session_start).getTime()
     );
   }, [sessions, dateFilter, deviceFilter]);
 
   // Statistics
   const stats = useMemo(() => {
     if (!filteredSessions.length) return null;
 
     const countries = new Set(filteredSessions.map(s => s.country).filter(Boolean));
     const browsers = new Set(filteredSessions.map(s => s.browser_name).filter(Boolean));
     const mobileCount = filteredSessions.filter(s => s.is_mobile).length;
     const activeSessions = filteredSessions.filter(s => !s.session_end).length;
 
     const sessionsWithDuration = filteredSessions.filter(s => s.session_end);
     const totalDuration = sessionsWithDuration.reduce((sum, s) => {
       return sum + differenceInMinutes(parseISO(s.session_end!), parseISO(s.session_start));
     }, 0);
     const avgDuration = sessionsWithDuration.length > 0 ? totalDuration / sessionsWithDuration.length : 0;
 
     return {
       totalSessions: filteredSessions.length,
       uniqueCountries: countries.size,
       uniqueBrowsers: browsers.size,
       mobilePercentage: Math.round((mobileCount / filteredSessions.length) * 100),
       activeSessions,
       avgDuration,
     };
   }, [filteredSessions]);
 
   // Chart data
   const deviceData = useMemo(() => {
     const counts: Record<string, number> = {};
     filteredSessions.forEach(s => {
       const device = s.device_type || 'unknown';
       counts[device] = (counts[device] || 0) + 1;
     });
     return Object.entries(counts).map(([name, value]) => ({ name, value }));
   }, [filteredSessions]);
 
   const countryData = useMemo(() => {
     const counts: Record<string, number> = {};
     filteredSessions.forEach(s => {
       const country = s.country || 'Unknown';
       counts[country] = (counts[country] || 0) + 1;
     });
     return Object.entries(counts)
       .map(([name, value]) => ({ name, value }))
       .sort((a, b) => b.value - a.value)
       .slice(0, 5);
   }, [filteredSessions]);
 
   const browserData = useMemo(() => {
     const counts: Record<string, number> = {};
     filteredSessions.forEach(s => {
       const browser = s.browser_name || 'Unknown';
       counts[browser] = (counts[browser] || 0) + 1;
     });
     return Object.entries(counts)
       .map(([name, value]) => ({ name, value }))
       .sort((a, b) => b.value - a.value);
   }, [filteredSessions]);
 
   const getDeviceIcon = (type: string | null) => {
     switch (type) {
       case 'mobile': return <Smartphone className="h-4 w-4" />;
       case 'tablet': return <Tablet className="h-4 w-4" />;
       default: return <Monitor className="h-4 w-4" />;
     }
   };
 
   const handleViewDetails = (session: typeof sessions[0]) => {
     setSelectedSession(session);
     setDetailDialogOpen(true);
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
 
   if (!selectedUser) {
     return (
       <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
         <User className="w-16 h-16 text-muted-foreground/50" />
         <p className="text-muted-foreground text-lg">
           {language === 'fr' ? 'Sélectionnez un utilisateur pour voir ses sessions' : 'Select a user to view their sessions'}
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
             {language === 'fr' ? 'Sessions Utilisateur' : 'User Sessions'}
           </h1>
           <p className="text-muted-foreground text-sm mt-1">
             {language === 'fr' 
               ? `Sessions de ${selectedUser.nickname}` 
               : `Sessions for ${selectedUser.nickname}`}
           </p>
         </div>
         <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
           <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
           {language === 'fr' ? 'Actualiser' : 'Refresh'}
         </Button>
       </div>
 
       {/* Filters */}
       <div className="flex flex-wrap gap-4">
         <Select value={dateFilter} onValueChange={setDateFilter}>
           <SelectTrigger className="w-40">
             <Calendar className="w-4 h-4 mr-2" />
             <SelectValue />
           </SelectTrigger>
           <SelectContent>
             <SelectItem value="7">{language === 'fr' ? '7 derniers jours' : 'Last 7 days'}</SelectItem>
             <SelectItem value="30">{language === 'fr' ? '30 derniers jours' : 'Last 30 days'}</SelectItem>
             <SelectItem value="90">{language === 'fr' ? '90 derniers jours' : 'Last 90 days'}</SelectItem>
             <SelectItem value="all">{language === 'fr' ? 'Tout' : 'All'}</SelectItem>
           </SelectContent>
         </Select>
 
         <Select value={deviceFilter} onValueChange={setDeviceFilter}>
           <SelectTrigger className="w-40">
             <Monitor className="w-4 h-4 mr-2" />
             <SelectValue />
           </SelectTrigger>
           <SelectContent>
             <SelectItem value="all">{language === 'fr' ? 'Tous appareils' : 'All devices'}</SelectItem>
             <SelectItem value="desktop">Desktop</SelectItem>
             <SelectItem value="mobile">Mobile</SelectItem>
             <SelectItem value="tablet">Tablet</SelectItem>
           </SelectContent>
         </Select>
       </div>
 
       {isLoading ? (
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {[...Array(4)].map((_, i) => (
             <Skeleton key={i} className="h-24 rounded-lg" />
           ))}
         </div>
       ) : stats ? (
         <>
           {/* Quick Stats */}
           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
             <Card className="glass-card">
               <CardContent className="pt-6">
                 <div className="flex items-center gap-2">
                   <Activity className="w-5 h-5 text-primary" />
                   <p className="text-2xl font-bold">{stats.totalSessions}</p>
                 </div>
                 <p className="text-sm text-muted-foreground">{language === 'fr' ? 'Sessions' : 'Sessions'}</p>
               </CardContent>
             </Card>
             <Card className="glass-card">
               <CardContent className="pt-6">
                 <div className="flex items-center gap-2">
                   <Globe className="w-5 h-5 text-profit" />
                   <p className="text-2xl font-bold">{stats.uniqueCountries}</p>
                 </div>
                 <p className="text-sm text-muted-foreground">{language === 'fr' ? 'Pays' : 'Countries'}</p>
               </CardContent>
             </Card>
             <Card className="glass-card">
               <CardContent className="pt-6">
                 <div className="flex items-center gap-2">
                   <Smartphone className="w-5 h-5 text-warning" />
                   <p className="text-2xl font-bold">{stats.mobilePercentage}%</p>
                 </div>
                 <p className="text-sm text-muted-foreground">{language === 'fr' ? 'Mobile' : 'Mobile'}</p>
               </CardContent>
             </Card>
             <Card className="glass-card">
               <CardContent className="pt-6">
                 <div className="flex items-center gap-2">
                   <Clock className="w-5 h-5 text-chart-2" />
                   <p className="text-2xl font-bold">{formatDuration(stats.avgDuration)}</p>
                 </div>
                 <p className="text-sm text-muted-foreground">{language === 'fr' ? 'Durée moy.' : 'Avg. duration'}</p>
               </CardContent>
             </Card>
             <Card className="glass-card">
               <CardContent className="pt-6">
                 <div className="flex items-center gap-2">
                   <Shield className="w-5 h-5 text-loss" />
                   <p className="text-2xl font-bold">{stats.activeSessions}</p>
                 </div>
                 <p className="text-sm text-muted-foreground">{language === 'fr' ? 'Actives' : 'Active'}</p>
               </CardContent>
             </Card>
             <Card className="glass-card">
               <CardContent className="pt-6">
                 <div className="flex items-center gap-2">
                   <Monitor className="w-5 h-5 text-chart-3" />
                   <p className="text-2xl font-bold">{stats.uniqueBrowsers}</p>
                 </div>
                 <p className="text-sm text-muted-foreground">{language === 'fr' ? 'Navigateurs' : 'Browsers'}</p>
               </CardContent>
             </Card>
           </div>
 
           {/* Charts */}
           <div className="grid md:grid-cols-3 gap-6">
             {/* Device Distribution */}
             <Card className="glass-card">
               <CardHeader>
                 <CardTitle className="text-sm font-medium">
                   {language === 'fr' ? 'Appareils' : 'Devices'}
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="h-48">
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <Pie
                         data={deviceData}
                         cx="50%"
                         cy="50%"
                         innerRadius={40}
                         outerRadius={70}
                         paddingAngle={2}
                         dataKey="value"
                         label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                         labelLine={false}
                       >
                         {deviceData.map((_, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                         ))}
                       </Pie>
                       <Tooltip />
                     </PieChart>
                   </ResponsiveContainer>
                 </div>
               </CardContent>
             </Card>
 
             {/* Countries */}
             <Card className="glass-card">
               <CardHeader>
                 <CardTitle className="text-sm font-medium">
                   {language === 'fr' ? 'Pays' : 'Countries'}
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="h-48">
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={countryData} layout="vertical">
                       <XAxis type="number" hide />
                       <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11 }} />
                       <Tooltip />
                       <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                     </BarChart>
                   </ResponsiveContainer>
                 </div>
               </CardContent>
             </Card>
 
             {/* Browsers */}
             <Card className="glass-card">
               <CardHeader>
                 <CardTitle className="text-sm font-medium">
                   {language === 'fr' ? 'Navigateurs' : 'Browsers'}
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="h-48">
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={browserData} layout="vertical">
                       <XAxis type="number" hide />
                       <YAxis dataKey="name" type="category" width={70} tick={{ fontSize: 11 }} />
                       <Tooltip />
                       <Bar dataKey="value" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
                     </BarChart>
                   </ResponsiveContainer>
                 </div>
               </CardContent>
             </Card>
           </div>
         </>
       ) : null}
 
       {/* Sessions Table */}
       <Card className="glass-card">
         <CardHeader>
           <CardTitle>
             {language === 'fr' ? 'Historique des Sessions' : 'Session History'}
             <Badge variant="secondary" className="ml-2">{filteredSessions.length}</Badge>
           </CardTitle>
         </CardHeader>
         <CardContent>
           {isLoading ? (
             <div className="flex justify-center py-8">
               <Loader2 className="w-8 h-8 animate-spin text-primary" />
             </div>
           ) : filteredSessions.length === 0 ? (
             <div className="text-center py-8 text-muted-foreground">
               {language === 'fr' ? 'Aucune session trouvée' : 'No sessions found'}
             </div>
           ) : (
             <ScrollArea className="h-[500px]">
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>{language === 'fr' ? 'Date' : 'Date'}</TableHead>
                     <TableHead>{language === 'fr' ? 'Appareil' : 'Device'}</TableHead>
                     <TableHead>{language === 'fr' ? 'Navigateur' : 'Browser'}</TableHead>
                     <TableHead>{language === 'fr' ? 'Localisation' : 'Location'}</TableHead>
                     <TableHead>{language === 'fr' ? 'ISP' : 'ISP'}</TableHead>
                     <TableHead>{language === 'fr' ? 'Durée' : 'Duration'}</TableHead>
                     <TableHead></TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {filteredSessions.map((session) => {
                     const duration = session.session_end 
                       ? differenceInMinutes(parseISO(session.session_end), parseISO(session.session_start))
                       : null;
 
                     return (
                       <TableRow key={session.id}>
                         <TableCell className="font-mono text-xs">
                           {format(parseISO(session.session_start), 'dd/MM/yy HH:mm', { locale })}
                         </TableCell>
                         <TableCell>
                           <div className="flex items-center gap-2">
                             {getDeviceIcon(session.device_type)}
                             <span className="text-xs">
                               {session.device_vendor} {session.device_model}
                             </span>
                           </div>
                         </TableCell>
                         <TableCell className="text-xs">
                           {session.browser_name} {session.browser_version?.split('.')[0]}
                           <div className="text-muted-foreground text-[10px]">
                             {session.os_name} {session.os_version}
                           </div>
                         </TableCell>
                         <TableCell>
                           <div className="flex items-center gap-1 text-xs">
                             <MapPin className="w-3 h-3" />
                             {session.city && `${session.city}, `}{session.country || '-'}
                           </div>
                           <div className="text-[10px] text-muted-foreground">{session.region}</div>
                         </TableCell>
                         <TableCell className="text-xs text-muted-foreground">
                           <div className="flex items-center gap-1">
                             <Wifi className="w-3 h-3" />
                             {session.isp?.slice(0, 20) || '-'}
                           </div>
                         </TableCell>
                         <TableCell>
                           {duration !== null ? (
                             <Badge variant="outline" className="text-xs">
                               {formatDuration(duration)}
                             </Badge>
                           ) : (
                             <Badge variant="default" className="text-xs bg-profit/20 text-profit">
                               {language === 'fr' ? 'Active' : 'Active'}
                             </Badge>
                           )}
                         </TableCell>
                         <TableCell>
                           <Button
                             variant="ghost"
                             size="sm"
                             onClick={() => handleViewDetails(session)}
                           >
                             <Eye className="w-4 h-4" />
                           </Button>
                         </TableCell>
                       </TableRow>
                     );
                   })}
                 </TableBody>
               </Table>
             </ScrollArea>
           )}
         </CardContent>
       </Card>
 
       {/* Session Detail Dialog */}
       <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
         <DialogContent className="max-w-2xl">
           <DialogHeader>
             <DialogTitle className="flex items-center gap-2">
               <Shield className="w-5 h-5 text-primary" />
               {language === 'fr' ? 'Détails de la Session' : 'Session Details'}
             </DialogTitle>
           </DialogHeader>
           {selectedSession && (
             <div className="space-y-6">
               {/* Timing */}
               <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 rounded-lg bg-secondary/50">
                   <p className="text-xs text-muted-foreground mb-1">{language === 'fr' ? 'Début' : 'Start'}</p>
                   <p className="font-mono text-sm">
                     {format(parseISO(selectedSession.session_start), 'dd MMM yyyy HH:mm:ss', { locale })}
                   </p>
                 </div>
                 <div className="p-4 rounded-lg bg-secondary/50">
                   <p className="text-xs text-muted-foreground mb-1">{language === 'fr' ? 'Fin' : 'End'}</p>
                   <p className="font-mono text-sm">
                     {selectedSession.session_end 
                       ? format(parseISO(selectedSession.session_end), 'dd MMM yyyy HH:mm:ss', { locale })
                       : <Badge variant="default" className="bg-profit/20 text-profit">Active</Badge>
                     }
                   </p>
                 </div>
               </div>
 
               {/* Device Info */}
               <div>
                 <h4 className="font-medium mb-3 flex items-center gap-2">
                   <Monitor className="w-4 h-4" />
                   {language === 'fr' ? 'Appareil' : 'Device'}
                 </h4>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                   <div className="p-3 rounded-lg bg-secondary/30">
                     <p className="text-xs text-muted-foreground">{language === 'fr' ? 'Type' : 'Type'}</p>
                     <p className="text-sm font-medium capitalize">{selectedSession.device_type || '-'}</p>
                   </div>
                   <div className="p-3 rounded-lg bg-secondary/30">
                     <p className="text-xs text-muted-foreground">{language === 'fr' ? 'Marque' : 'Vendor'}</p>
                     <p className="text-sm font-medium">{selectedSession.device_vendor || '-'}</p>
                   </div>
                   <div className="p-3 rounded-lg bg-secondary/30">
                     <p className="text-xs text-muted-foreground">{language === 'fr' ? 'Modèle' : 'Model'}</p>
                     <p className="text-sm font-medium">{selectedSession.device_model || '-'}</p>
                   </div>
                   <div className="p-3 rounded-lg bg-secondary/30">
                     <p className="text-xs text-muted-foreground">{language === 'fr' ? 'Navigateur' : 'Browser'}</p>
                     <p className="text-sm font-medium">{selectedSession.browser_name} {selectedSession.browser_version}</p>
                   </div>
                   <div className="p-3 rounded-lg bg-secondary/30">
                     <p className="text-xs text-muted-foreground">OS</p>
                     <p className="text-sm font-medium">{selectedSession.os_name} {selectedSession.os_version}</p>
                   </div>
                   <div className="p-3 rounded-lg bg-secondary/30">
                     <p className="text-xs text-muted-foreground">{language === 'fr' ? 'Écran' : 'Screen'}</p>
                     <p className="text-sm font-medium">
                       {selectedSession.screen_width && selectedSession.screen_height 
                         ? `${selectedSession.screen_width}x${selectedSession.screen_height}`
                         : '-'}
                     </p>
                   </div>
                 </div>
               </div>
 
               {/* Location Info */}
               <div>
                 <h4 className="font-medium mb-3 flex items-center gap-2">
                   <Globe className="w-4 h-4" />
                   {language === 'fr' ? 'Localisation' : 'Location'}
                 </h4>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                   <div className="p-3 rounded-lg bg-secondary/30">
                     <p className="text-xs text-muted-foreground">{language === 'fr' ? 'Pays' : 'Country'}</p>
                     <p className="text-sm font-medium">{selectedSession.country || '-'} {selectedSession.country_code ? `(${selectedSession.country_code})` : ''}</p>
                   </div>
                   <div className="p-3 rounded-lg bg-secondary/30">
                     <p className="text-xs text-muted-foreground">{language === 'fr' ? 'Région' : 'Region'}</p>
                     <p className="text-sm font-medium">{selectedSession.region || '-'}</p>
                   </div>
                   <div className="p-3 rounded-lg bg-secondary/30">
                     <p className="text-xs text-muted-foreground">{language === 'fr' ? 'Ville' : 'City'}</p>
                     <p className="text-sm font-medium">{selectedSession.city || '-'}</p>
                   </div>
                   <div className="p-3 rounded-lg bg-secondary/30">
                     <p className="text-xs text-muted-foreground">ISP</p>
                     <p className="text-sm font-medium">{selectedSession.isp || '-'}</p>
                   </div>
                   <div className="p-3 rounded-lg bg-secondary/30">
                     <p className="text-xs text-muted-foreground">{language === 'fr' ? 'Fuseau horaire' : 'Timezone'}</p>
                     <p className="text-sm font-medium">{selectedSession.timezone || '-'}</p>
                   </div>
                   <div className="p-3 rounded-lg bg-secondary/30">
                     <p className="text-xs text-muted-foreground">{language === 'fr' ? 'Langue' : 'Language'}</p>
                     <p className="text-sm font-medium">{selectedSession.language || '-'}</p>
                   </div>
                 </div>
               </div>
 
               {/* Technical Info */}
               <div>
                 <h4 className="font-medium mb-3 flex items-center gap-2">
                   <Wifi className="w-4 h-4" />
                   {language === 'fr' ? 'Informations Techniques' : 'Technical Info'}
                 </h4>
                 <div className="p-3 rounded-lg bg-secondary/30">
                   <p className="text-xs text-muted-foreground mb-1">IP Address</p>
                   <p className="font-mono text-sm">{selectedSession.ip_address || '-'}</p>
                 </div>
                 <div className="p-3 rounded-lg bg-secondary/30 mt-2">
                   <p className="text-xs text-muted-foreground mb-1">User Agent</p>
                   <p className="font-mono text-xs break-all">{selectedSession.user_agent || '-'}</p>
                 </div>
               </div>
             </div>
           )}
         </DialogContent>
       </Dialog>
     </div>
   );
 };
 
 export default AdminSessions;
