import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAdmin } from '@/contexts/AdminContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { format, subDays, parseISO, isWithinInterval, startOfDay, eachDayOfInterval, eachHourOfInterval, startOfHour, subHours } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import {
  FileSearch,
  Search,
  Calendar,
  User,
  Eye,
  Shield,
  Loader2,
  AlertCircle,
  RefreshCw,
  Download,
  Filter,
  TrendingUp,
  BarChart3,
  Activity,
  Clock,
  Users,
  MapPin,
  Globe,
  Smartphone,
  Monitor,
  Wifi,
  Info,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface AuditLog {
  id: string;
  admin_id: string;
  target_user_id: string | null;
  action: string;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

interface ConnectionLog {
  id: string;
  user_id: string;
  session_id: string | null;
  ip_address: string | null;
  country: string | null;
  country_code: string | null;
  city: string | null;
  region: string | null;
  isp: string | null;
  vpn_detected: boolean | null;
  proxy_detected: boolean | null;
  tor_detected: boolean | null;
  risk_level: string | null;
  risk_score: number | null;
  user_agent: string | null;
  client_timezone: string | null;
  client_platform: string | null;
  is_admin_access: boolean | null;
  created_at: string;
}

interface UserSession {
  id: string;
  user_id: string;
  session_start: string;
  session_end: string | null;
  browser_name: string | null;
  browser_version: string | null;
  os_name: string | null;
  os_version: string | null;
  device_type: string | null;
  device_model: string | null;
  device_vendor: string | null;
  is_mobile: boolean | null;
  country: string | null;
  country_code: string | null;
  city: string | null;
  region: string | null;
  isp: string | null;
  timezone: string | null;
}

interface AdminInfo {
  id: string;
  email: string | null;
  nickname?: string;
}

interface DetailedLogInfo {
  log: AuditLog;
  connectionLogs: ConnectionLog[];
  sessions: UserSession[];
}

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--profit))',
  'hsl(var(--warning))',
  'hsl(var(--loss))',
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
];

const AdminAuditHistory: React.FC = () => {
  const { language } = useLanguage();
  const { isAdminVerified, allUsers } = useAdmin();
  const locale = language === 'fr' ? fr : enUS;

  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('7');
  const [activeTab, setActiveTab] = useState<string>('logs');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Fetch audit logs
  const { data: auditLogs = [], isLoading: logsLoading, refetch: refetchLogs } = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) throw error;
      return data as AuditLog[];
    },
    enabled: isAdminVerified,
    staleTime: 30000,
  });

  // Fetch connection logs for detailed analysis
  const { data: connectionLogs = [], isLoading: connectionsLoading } = useQuery({
    queryKey: ['admin-connection-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('connection_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;
      return data as ConnectionLog[];
    },
    enabled: isAdminVerified,
    staleTime: 30000,
  });

  // Fetch user sessions for context
  const { data: userSessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['admin-user-sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .order('session_start', { ascending: false })
        .limit(500);

      if (error) throw error;
      return data as UserSession[];
    },
    enabled: isAdminVerified,
    staleTime: 30000,
  });

  const isLoading = logsLoading || connectionsLoading || sessionsLoading;

  // Create user map
  const userMap = useMemo(() => {
    const map = new Map<string, AdminInfo>();
    allUsers.forEach(user => {
      map.set(user.id, { id: user.id, email: user.email, nickname: user.nickname });
    });
    return map;
  }, [allUsers]);

  // Get unique actions
  const uniqueActions = useMemo(() => {
    const actions = new Set(auditLogs.map(log => log.action));
    return Array.from(actions).sort();
  }, [auditLogs]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    const now = new Date();
    const daysAgo = subDays(now, parseInt(dateFilter));

    return auditLogs.filter(log => {
      const logDate = parseISO(log.created_at);
      if (!isWithinInterval(logDate, { start: daysAgo, end: now })) return false;
      if (actionFilter !== 'all' && log.action !== actionFilter) return false;

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const adminInfo = userMap.get(log.admin_id);
        const targetInfo = log.target_user_id ? userMap.get(log.target_user_id) : null;
        
        return (
          log.action.toLowerCase().includes(query) ||
          (adminInfo?.email?.toLowerCase().includes(query)) ||
          (adminInfo?.nickname?.toLowerCase().includes(query)) ||
          (targetInfo?.email?.toLowerCase().includes(query)) ||
          (targetInfo?.nickname?.toLowerCase().includes(query)) ||
          (log.ip_address?.toLowerCase().includes(query))
        );
      }

      return true;
    });
  }, [auditLogs, dateFilter, actionFilter, searchQuery, userMap]);

  // Statistics
  const statistics = useMemo(() => {
    const daysAgo = parseInt(dateFilter);
    
    const actionCounts = new Map<string, number>();
    filteredLogs.forEach(log => {
      actionCounts.set(log.action, (actionCounts.get(log.action) || 0) + 1);
    });
    const actionsByType = Array.from(actionCounts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    const adminCounts = new Map<string, number>();
    filteredLogs.forEach(log => {
      const adminInfo = userMap.get(log.admin_id);
      const adminName = adminInfo?.nickname || adminInfo?.email?.split('@')[0] || 'Unknown';
      adminCounts.set(adminName, (adminCounts.get(adminName) || 0) + 1);
    });

    const usersAccessed = new Set(
      filteredLogs.filter(l => l.target_user_id).map(l => l.target_user_id)
    ).size;

    const avgPerDay = daysAgo > 0 ? Math.round(filteredLogs.length / daysAgo) : filteredLogs.length;

    // Location distribution from connection logs
    const locationCounts = new Map<string, number>();
    connectionLogs.forEach(log => {
      if (log.country) {
        locationCounts.set(log.country, (locationCounts.get(log.country) || 0) + 1);
      }
    });
    const locationDistribution = Array.from(locationCounts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    // ISP distribution
    const ispCounts = new Map<string, number>();
    connectionLogs.forEach(log => {
      if (log.isp) {
        ispCounts.set(log.isp, (ispCounts.get(log.isp) || 0) + 1);
      }
    });
    const ispDistribution = Array.from(ispCounts.entries())
      .map(([name, value]) => ({ name: name.slice(0, 20), value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    // Device distribution
    const deviceCounts = new Map<string, number>();
    userSessions.forEach(session => {
      const device = session.device_type || 'Unknown';
      deviceCounts.set(device, (deviceCounts.get(device) || 0) + 1);
    });
    const deviceDistribution = Array.from(deviceCounts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Browser distribution
    const browserCounts = new Map<string, number>();
    userSessions.forEach(session => {
      if (session.browser_name) {
        browserCounts.set(session.browser_name, (browserCounts.get(session.browser_name) || 0) + 1);
      }
    });
    const browserDistribution = Array.from(browserCounts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    return {
      actionsByType,
      usersAccessed,
      avgPerDay,
      totalLogs: filteredLogs.length,
      uniqueAdmins: adminCounts.size,
      locationDistribution,
      ispDistribution,
      deviceDistribution,
      browserDistribution,
      vpnCount: connectionLogs.filter(l => l.vpn_detected).length,
      highRiskCount: connectionLogs.filter(l => l.risk_level === 'high' || l.risk_level === 'critical').length,
    };
  }, [filteredLogs, dateFilter, userMap, connectionLogs, userSessions]);

  // Get action badge
  const getActionBadge = (action: string) => {
    if (action.includes('view_')) {
      return <Badge variant="secondary" className="text-xs">{action}</Badge>;
    }
    if (action.includes('login_success')) {
      return <Badge className="bg-profit/20 text-profit text-xs">{action}</Badge>;
    }
    if (action.includes('login_failed')) {
      return <Badge className="bg-loss/20 text-loss text-xs">{action}</Badge>;
    }
    if (action.includes('login')) {
      return <Badge className="bg-primary/20 text-primary text-xs">{action}</Badge>;
    }
    return <Badge variant="outline" className="text-xs">{action}</Badge>;
  };

  // Get detailed info for a log
  const getDetailedLogInfo = (log: AuditLog): DetailedLogInfo => {
    const adminId = log.admin_id;
    const relevantConnections = connectionLogs.filter(c => 
      c.user_id === adminId && 
      Math.abs(new Date(c.created_at).getTime() - new Date(log.created_at).getTime()) < 60000
    );
    const relevantSessions = userSessions.filter(s => 
      s.user_id === adminId &&
      new Date(s.session_start) <= new Date(log.created_at) &&
      (!s.session_end || new Date(s.session_end) >= new Date(log.created_at))
    );
    
    return { log, connectionLogs: relevantConnections, sessions: relevantSessions };
  };

  // Open detail dialog
  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setDetailDialogOpen(true);
  };

  // Export to PDF
  const exportToPDF = () => {
    if (!filteredLogs.length) {
      toast.error(language === 'fr' ? 'Aucune donnée à exporter' : 'No data to export');
      return;
    }

    try {
      const doc = new jsPDF('landscape', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFillColor(34, 34, 34);
      doc.rect(0, 0, pageWidth, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.text(language === 'fr' ? 'Historique d\'Audit Admin' : 'Admin Audit History', 14, 14);
      doc.setFontSize(10);
      doc.text(format(new Date(), 'dd/MM/yyyy HH:mm'), pageWidth - 14, 14, { align: 'right' });

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.text(language === 'fr' ? 'Résumé Statistique' : 'Statistical Summary', 14, 30);
      doc.setFontSize(10);
      doc.text(`Total: ${statistics.totalLogs} | Admins: ${statistics.uniqueAdmins} | Users: ${statistics.usersAccessed}`, 14, 38);

      const tableData = filteredLogs.slice(0, 100).map(log => {
        const adminInfo = userMap.get(log.admin_id);
        const targetInfo = log.target_user_id ? userMap.get(log.target_user_id) : null;
        
        return [
          format(parseISO(log.created_at), 'dd/MM/yy HH:mm'),
          adminInfo?.email || log.admin_id.slice(0, 8) + '...',
          log.action,
          targetInfo?.email || (log.target_user_id ? log.target_user_id.slice(0, 8) + '...' : '-'),
          log.ip_address || '-',
        ];
      });

      autoTable(doc, {
        startY: 45,
        head: [['Date', 'Admin', 'Action', language === 'fr' ? 'Cible' : 'Target', 'IP']],
        body: tableData,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [220, 53, 69], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      });

      doc.save(`audit_history_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      toast.success(language === 'fr' ? 'Export PDF réussi' : 'PDF export successful');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error(language === 'fr' ? 'Erreur lors de l\'export' : 'Export error');
    }
  };

  if (!isAdminVerified) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="w-16 h-16 text-muted-foreground/50" />
        <p className="text-muted-foreground text-lg">
          {language === 'fr' ? 'Vérification admin requise' : 'Admin verification required'}
        </p>
      </div>
    );
  }

  return (
    <div className="py-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            {language === 'fr' ? 'Historique d\'Audit' : 'Audit History'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {language === 'fr' ? 'Suivi complet des accès et actions' : 'Complete access and action tracking'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetchLogs()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            {language === 'fr' ? 'Actualiser' : 'Refresh'}
          </Button>
          <Button variant="outline" size="sm" onClick={exportToPDF}>
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              <p className="text-2xl font-bold">{statistics.totalLogs}</p>
            </div>
            <p className="text-sm text-muted-foreground">{language === 'fr' ? 'Total actions' : 'Total actions'}</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-destructive" />
              <p className="text-2xl font-bold">{statistics.uniqueAdmins}</p>
            </div>
            <p className="text-sm text-muted-foreground">{language === 'fr' ? 'Admins actifs' : 'Active admins'}</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-profit" />
              <p className="text-2xl font-bold">{statistics.usersAccessed}</p>
            </div>
            <p className="text-sm text-muted-foreground">{language === 'fr' ? 'Utilisateurs' : 'Users accessed'}</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-warning" />
              <p className="text-2xl font-bold">{statistics.avgPerDay}</p>
            </div>
            <p className="text-sm text-muted-foreground">{language === 'fr' ? 'Moy./jour' : 'Avg/day'}</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Wifi className="w-5 h-5 text-loss" />
              <p className="text-2xl font-bold">{statistics.vpnCount}</p>
            </div>
            <p className="text-sm text-muted-foreground">VPN Détectés</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-loss" />
              <p className="text-2xl font-bold">{statistics.highRiskCount}</p>
            </div>
            <p className="text-sm text-muted-foreground">{language === 'fr' ? 'Haut risque' : 'High risk'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="logs">
            <FileSearch className="w-4 h-4 mr-2" />
            {language === 'fr' ? 'Logs' : 'Logs'}
          </TabsTrigger>
          <TabsTrigger value="connections">
            <Globe className="w-4 h-4 mr-2" />
            {language === 'fr' ? 'Connexions' : 'Connections'}
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="w-4 h-4 mr-2" />
            {language === 'fr' ? 'Analyses' : 'Analytics'}
          </TabsTrigger>
        </TabsList>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          {/* Filters */}
          <Card className="glass-card">
            <CardContent className="pt-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={language === 'fr' ? 'Rechercher...' : 'Search...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <Calendar className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">24h</SelectItem>
                    <SelectItem value="7">7 {language === 'fr' ? 'jours' : 'days'}</SelectItem>
                    <SelectItem value="30">30 {language === 'fr' ? 'jours' : 'days'}</SelectItem>
                    <SelectItem value="90">90 {language === 'fr' ? 'jours' : 'days'}</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder={language === 'fr' ? 'Toutes les actions' : 'All actions'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{language === 'fr' ? 'Toutes les actions' : 'All actions'}</SelectItem>
                    {uniqueActions.map(action => (
                      <SelectItem key={action} value={action}>{action}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Logs Table */}
          <Card className="glass-card">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Admin</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>{language === 'fr' ? 'Cible' : 'Target'}</TableHead>
                        <TableHead>IP</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.map(log => {
                        const adminInfo = userMap.get(log.admin_id);
                        const targetInfo = log.target_user_id ? userMap.get(log.target_user_id) : null;
                        
                        return (
                          <TableRow key={log.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => handleViewDetails(log)}>
                            <TableCell className="text-xs">
                              {format(parseISO(log.created_at), 'dd/MM/yy HH:mm:ss', { locale })}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Shield className="w-3 h-3 text-destructive" />
                                <span className="text-sm">{adminInfo?.nickname || adminInfo?.email?.split('@')[0] || 'Unknown'}</span>
                              </div>
                            </TableCell>
                            <TableCell>{getActionBadge(log.action)}</TableCell>
                            <TableCell>
                              {targetInfo ? (
                                <div className="flex items-center gap-2">
                                  <User className="w-3 h-3 text-muted-foreground" />
                                  <span className="text-sm">{targetInfo.nickname || targetInfo.email?.split('@')[0]}</span>
                                </div>
                              ) : '-'}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">{log.ip_address || '-'}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <ChevronRight className="w-4 h-4" />
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
        </TabsContent>

        {/* Connections Tab */}
        <TabsContent value="connections" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                {language === 'fr' ? 'Connexions Récentes' : 'Recent Connections'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>{language === 'fr' ? 'Localisation' : 'Location'}</TableHead>
                      <TableHead>ISP</TableHead>
                      <TableHead>{language === 'fr' ? 'Appareil' : 'Device'}</TableHead>
                      <TableHead>{language === 'fr' ? 'Risque' : 'Risk'}</TableHead>
                      <TableHead>Flags</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {connectionLogs.slice(0, 100).map(log => (
                      <TableRow key={log.id}>
                        <TableCell className="text-xs">
                          {format(parseISO(log.created_at), 'dd/MM/yy HH:mm', { locale })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{log.city || 'Unknown'}, {log.country_code}</span>
                              <span className="text-xs text-muted-foreground">{log.region}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm">{log.isp?.slice(0, 25) || '-'}</span>
                            <span className="text-xs text-muted-foreground">{log.client_timezone}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs">{log.client_platform || '-'}</span>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={log.risk_level === 'high' || log.risk_level === 'critical' ? 'destructive' : 
                                    log.risk_level === 'medium' ? 'secondary' : 'outline'}
                            className="text-xs"
                          >
                            {log.risk_level || 'low'} ({log.risk_score || 0})
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {log.vpn_detected && <Badge variant="destructive" className="text-xs">VPN</Badge>}
                            {log.proxy_detected && <Badge variant="destructive" className="text-xs">Proxy</Badge>}
                            {log.tor_detected && <Badge variant="destructive" className="text-xs">TOR</Badge>}
                            {log.is_admin_access && <Badge className="bg-primary/20 text-primary text-xs">Admin</Badge>}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Actions by Type */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">{language === 'fr' ? 'Actions par Type' : 'Actions by Type'}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={statistics.actionsByType} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Location Distribution */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">{language === 'fr' ? 'Distribution Géographique' : 'Geographic Distribution'}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPie>
                    <Pie
                      data={statistics.locationDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statistics.locationDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPie>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Browser Distribution */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">{language === 'fr' ? 'Navigateurs' : 'Browsers'}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={statistics.browserDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Device Distribution */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">{language === 'fr' ? 'Types d\'Appareils' : 'Device Types'}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPie>
                    <Pie
                      data={statistics.deviceDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statistics.deviceDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPie>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              {language === 'fr' ? 'Détails de l\'Action' : 'Action Details'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedLog && (() => {
            const detailedInfo = getDetailedLogInfo(selectedLog);
            const adminInfo = userMap.get(selectedLog.admin_id);
            const targetInfo = selectedLog.target_user_id ? userMap.get(selectedLog.target_user_id) : null;
            const connection = detailedInfo.connectionLogs[0];
            const session = detailedInfo.sessions[0];

            return (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{language === 'fr' ? 'Date/Heure' : 'Date/Time'}</p>
                    <p className="font-medium">{format(parseISO(selectedLog.created_at), 'dd/MM/yyyy HH:mm:ss', { locale })}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Action</p>
                    {getActionBadge(selectedLog.action)}
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Admin</p>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-destructive" />
                      <span>{adminInfo?.email || selectedLog.admin_id}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{language === 'fr' ? 'Utilisateur Cible' : 'Target User'}</p>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>{targetInfo?.email || selectedLog.target_user_id || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Connection Info */}
                <Card className="border-primary/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Globe className="w-4 h-4 text-primary" />
                      {language === 'fr' ? 'Informations de Connexion' : 'Connection Information'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{connection?.city || session?.city || '-'}, {connection?.country || session?.country || '-'}</p>
                          <p className="text-xs text-muted-foreground">{connection?.region || session?.region || '-'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{connection?.client_timezone || session?.timezone || '-'}</p>
                          <p className="text-xs text-muted-foreground">Timezone</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Wifi className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{connection?.isp || session?.isp || '-'}</p>
                          <p className="text-xs text-muted-foreground">ISP</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{session?.os_name || '-'} {session?.os_version || ''}</p>
                          <p className="text-xs text-muted-foreground">OS</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{session?.browser_name || '-'} {session?.browser_version || ''}</p>
                          <p className="text-xs text-muted-foreground">Browser</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{session?.device_vendor || ''} {session?.device_model || session?.device_type || '-'}</p>
                          <p className="text-xs text-muted-foreground">Device</p>
                        </div>
                      </div>
                    </div>

                    {/* Security Flags */}
                    {connection && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {connection.vpn_detected && <Badge variant="destructive">VPN Détecté</Badge>}
                        {connection.proxy_detected && <Badge variant="destructive">Proxy Détecté</Badge>}
                        {connection.tor_detected && <Badge variant="destructive">TOR Détecté</Badge>}
                        {connection.is_admin_access && <Badge className="bg-primary/20 text-primary">Accès Admin</Badge>}
                        <Badge variant={connection.risk_level === 'high' ? 'destructive' : 'outline'}>
                          Risque: {connection.risk_level || 'low'} ({connection.risk_score || 0})
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Session Times */}
                {session && (
                  <Card className="border-chart-1/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Clock className="w-4 h-4 text-chart-1" />
                        Session
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">First Seen</p>
                          <p className="font-medium">{format(parseISO(session.session_start), 'dd/MM/yyyy HH:mm:ss', { locale })}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Last Seen</p>
                          <p className="font-medium">
                            {session.session_end 
                              ? format(parseISO(session.session_end), 'dd/MM/yyyy HH:mm:ss', { locale })
                              : language === 'fr' ? 'Session active' : 'Active session'
                            }
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Raw Details */}
                {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                  <Card className="border-muted">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{language === 'fr' ? 'Détails Bruts' : 'Raw Details'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-xs bg-muted/50 p-3 rounded-lg overflow-x-auto">
                        {JSON.stringify(selectedLog.details, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAuditHistory;
