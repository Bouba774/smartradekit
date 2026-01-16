import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format, formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Activity,
  AlertTriangle,
  Users,
  Globe,
  Smartphone,
  Monitor,
  Clock,
  RefreshCw,
  Eye,
  XCircle,
  CheckCircle,
  Wifi,
  WifiOff,
  MapPin,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActiveSession {
  id: string;
  user_id: string;
  session_start: string;
  browser_name: string;
  os_name: string;
  device_type: string;
  country: string;
  country_code: string;
  city: string;
  is_mobile: boolean;
}

interface LoginAttempt {
  id: string;
  admin_id: string;
  success: boolean;
  attempt_at: string;
  ip_address: string;
  user_agent: string;
  blocked_until: string | null;
}

interface SecurityAnomaly {
  id: string;
  user_id: string;
  session_id: string;
  anomaly_type: string;
  severity: string;
  details: Record<string, unknown>;
  resolved: boolean;
  created_at: string;
}

interface ConnectionLog {
  id: string;
  user_id: string;
  vpn_detected: boolean;
  proxy_detected: boolean;
  tor_detected: boolean;
  risk_level: string;
  risk_score: number;
  country: string;
  city: string;
  created_at: string;
}

const AdminSecurityDashboard: React.FC = () => {
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const [isRealtime, setIsRealtime] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const locale = language === 'fr' ? fr : enUS;

  // Fetch active sessions
  const { data: activeSessions = [], isLoading: sessionsLoading, refetch: refetchSessions } = useQuery({
    queryKey: ['admin-security-sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .is('session_end', null)
        .order('session_start', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as ActiveSession[];
    },
    refetchInterval: isRealtime ? 10000 : false,
  });

  // Fetch failed login attempts
  const { data: loginAttempts = [], isLoading: attemptsLoading, refetch: refetchAttempts } = useQuery({
    queryKey: ['admin-security-attempts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_login_attempts')
        .select('*')
        .order('attempt_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data as LoginAttempt[];
    },
    refetchInterval: isRealtime ? 10000 : false,
  });

  // Fetch security anomalies
  const { data: anomalies = [], isLoading: anomaliesLoading, refetch: refetchAnomalies } = useQuery({
    queryKey: ['admin-security-anomalies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('session_anomalies')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data as SecurityAnomaly[];
    },
    refetchInterval: isRealtime ? 10000 : false,
  });

  // Fetch connection logs with risk
  const { data: connectionLogs = [], isLoading: logsLoading, refetch: refetchLogs } = useQuery({
    queryKey: ['admin-security-connections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('connection_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data as ConnectionLog[];
    },
    refetchInterval: isRealtime ? 10000 : false,
  });

  // Setup realtime subscriptions
  useEffect(() => {
    if (!isRealtime) return;

    const channel = supabase
      .channel('security-dashboard')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_sessions' },
        () => {
          refetchSessions();
          setLastUpdate(new Date());
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'admin_login_attempts' },
        () => {
          refetchAttempts();
          setLastUpdate(new Date());
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'session_anomalies' },
        () => {
          refetchAnomalies();
          setLastUpdate(new Date());
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'connection_logs' },
        () => {
          refetchLogs();
          setLastUpdate(new Date());
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isRealtime, refetchSessions, refetchAttempts, refetchAnomalies, refetchLogs]);

  const handleRefresh = () => {
    refetchSessions();
    refetchAttempts();
    refetchAnomalies();
    refetchLogs();
    setLastUpdate(new Date());
  };

  // Calculate statistics
  const stats = {
    activeSessions: activeSessions.length,
    uniqueUsers: new Set(activeSessions.map(s => s.user_id)).size,
    failedLogins: loginAttempts.filter(a => !a.success).length,
    successfulLogins: loginAttempts.filter(a => a.success).length,
    unresolvedAnomalies: anomalies.filter(a => !a.resolved).length,
    criticalAnomalies: anomalies.filter(a => a.severity === 'critical' && !a.resolved).length,
    vpnDetections: connectionLogs.filter(l => l.vpn_detected).length,
    highRiskConnections: connectionLogs.filter(l => l.risk_level === 'high' || l.risk_level === 'critical').length,
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-warning text-warning-foreground';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-destructive';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-warning';
      case 'low': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const getAnomalyIcon = (type: string) => {
    switch (type) {
      case 'new_device': return Smartphone;
      case 'new_country': return Globe;
      case 'impossible_travel': return MapPin;
      case 'concurrent_sessions': return Users;
      default: return AlertTriangle;
    }
  };

  const formatAnomalyType = (type: string) => {
    const types: Record<string, string> = {
      'new_device': language === 'fr' ? 'Nouvel appareil' : 'New device',
      'new_country': language === 'fr' ? 'Nouveau pays' : 'New country',
      'impossible_travel': language === 'fr' ? 'Voyage impossible' : 'Impossible travel',
      'concurrent_sessions': language === 'fr' ? 'Sessions simultanées' : 'Concurrent sessions',
    };
    return types[type] || type;
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-destructive" />
            {language === 'fr' ? 'Centre de Sécurité' : 'Security Center'}
          </h1>
          <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
            <Clock className="w-4 h-4" />
            {language === 'fr' ? 'Dernière mise à jour : ' : 'Last update: '}
            {formatDistanceToNow(lastUpdate, { addSuffix: true, locale })}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={isRealtime ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsRealtime(!isRealtime)}
            className="gap-2"
          >
            {isRealtime ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            {isRealtime ? 'Live' : 'Paused'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            {language === 'fr' ? 'Actualiser' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">
                  {language === 'fr' ? 'Sessions actives' : 'Active Sessions'}
                </p>
                <p className="text-2xl font-bold">{stats.activeSessions}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.uniqueUsers} {language === 'fr' ? 'utilisateurs' : 'users'}
                </p>
              </div>
              <Activity className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          "border-l-4",
          stats.failedLogins > 10 ? "border-l-destructive" : "border-l-warning"
        )}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">
                  {language === 'fr' ? 'Échecs de connexion' : 'Failed Logins'}
                </p>
                <p className="text-2xl font-bold">{stats.failedLogins}</p>
                <p className="text-xs text-success">
                  {stats.successfulLogins} {language === 'fr' ? 'réussies' : 'successful'}
                </p>
              </div>
              <ShieldAlert className="w-8 h-8 text-warning opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          "border-l-4",
          stats.criticalAnomalies > 0 ? "border-l-destructive animate-pulse" : "border-l-success"
        )}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">
                  {language === 'fr' ? 'Anomalies' : 'Anomalies'}
                </p>
                <p className="text-2xl font-bold">{stats.unresolvedAnomalies}</p>
                {stats.criticalAnomalies > 0 && (
                  <p className="text-xs text-destructive font-medium">
                    {stats.criticalAnomalies} {language === 'fr' ? 'critiques' : 'critical'}
                  </p>
                )}
              </div>
              <AlertTriangle className={cn(
                "w-8 h-8 opacity-50",
                stats.criticalAnomalies > 0 ? "text-destructive" : "text-success"
              )} />
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          "border-l-4",
          stats.highRiskConnections > 5 ? "border-l-orange-500" : "border-l-muted"
        )}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">
                  {language === 'fr' ? 'Connexions à risque' : 'Risky Connections'}
                </p>
                <p className="text-2xl font-bold">{stats.highRiskConnections}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.vpnDetections} VPN
                </p>
              </div>
              <Globe className="w-8 h-8 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="sessions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sessions" className="gap-2">
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">
              {language === 'fr' ? 'Sessions' : 'Sessions'}
            </span>
          </TabsTrigger>
          <TabsTrigger value="attempts" className="gap-2">
            <ShieldAlert className="w-4 h-4" />
            <span className="hidden sm:inline">
              {language === 'fr' ? 'Tentatives' : 'Attempts'}
            </span>
          </TabsTrigger>
          <TabsTrigger value="anomalies" className="gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="hidden sm:inline">
              {language === 'fr' ? 'Anomalies' : 'Anomalies'}
            </span>
            {stats.unresolvedAnomalies > 0 && (
              <Badge variant="destructive" className="h-5 min-w-5 px-1">
                {stats.unresolvedAnomalies}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="connections" className="gap-2">
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline">
              {language === 'fr' ? 'Connexions' : 'Connections'}
            </span>
          </TabsTrigger>
        </TabsList>

        {/* Active Sessions Tab */}
        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                {language === 'fr' ? 'Sessions Actives' : 'Active Sessions'}
                {isRealtime && (
                  <Badge variant="outline" className="animate-pulse">
                    <Zap className="w-3 h-3 mr-1" />
                    Live
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {language === 'fr' 
                  ? 'Utilisateurs actuellement connectés en temps réel'
                  : 'Currently connected users in real-time'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {sessionsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : activeSessions.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    {language === 'fr' ? 'Aucune session active' : 'No active sessions'}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeSessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {session.is_mobile ? (
                            <Smartphone className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <Monitor className="w-5 h-5 text-muted-foreground" />
                          )}
                          <div>
                            <p className="font-medium text-sm">
                              {session.browser_name} / {session.os_name}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {session.city}, {session.country}
                              {session.country_code && (
                                <span className="ml-1">
                                  {session.country_code}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatDistanceToNow(new Date(session.session_start), { locale })}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Login Attempts Tab */}
        <TabsContent value="attempts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-warning" />
                {language === 'fr' ? 'Tentatives de Connexion Admin' : 'Admin Login Attempts'}
              </CardTitle>
              <CardDescription>
                {language === 'fr'
                  ? 'Historique des tentatives de connexion au panel admin'
                  : 'History of admin panel login attempts'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {attemptsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : loginAttempts.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    {language === 'fr' ? 'Aucune tentative enregistrée' : 'No attempts recorded'}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {loginAttempts.map((attempt) => (
                      <div
                        key={attempt.id}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg transition-colors",
                          attempt.success 
                            ? "bg-success/10 border border-success/20" 
                            : "bg-destructive/10 border border-destructive/20"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          {attempt.success ? (
                            <CheckCircle className="w-5 h-5 text-success" />
                          ) : (
                            <XCircle className="w-5 h-5 text-destructive" />
                          )}
                          <div>
                            <p className="font-medium text-sm">
                              {attempt.success 
                                ? (language === 'fr' ? 'Connexion réussie' : 'Successful login')
                                : (language === 'fr' ? 'Échec de connexion' : 'Failed login')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {attempt.ip_address || 'IP masquée'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(attempt.attempt_at), 'dd/MM/yyyy HH:mm', { locale })}
                          </p>
                          {attempt.blocked_until && new Date(attempt.blocked_until) > new Date() && (
                            <Badge variant="destructive" className="text-xs mt-1">
                              {language === 'fr' ? 'Bloqué' : 'Blocked'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Anomalies Tab */}
        <TabsContent value="anomalies">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                {language === 'fr' ? 'Alertes de Sécurité' : 'Security Alerts'}
                {stats.criticalAnomalies > 0 && (
                  <Badge variant="destructive" className="animate-pulse">
                    {stats.criticalAnomalies} {language === 'fr' ? 'critiques' : 'critical'}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {language === 'fr'
                  ? 'Anomalies détectées nécessitant une attention'
                  : 'Detected anomalies requiring attention'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {anomaliesLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : anomalies.length === 0 ? (
                  <div className="text-center py-8">
                    <ShieldCheck className="w-12 h-12 text-success mx-auto mb-2" />
                    <p className="text-muted-foreground">
                      {language === 'fr' ? 'Aucune anomalie détectée' : 'No anomalies detected'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {anomalies.map((anomaly) => {
                      const Icon = getAnomalyIcon(anomaly.anomaly_type);
                      return (
                        <div
                          key={anomaly.id}
                          className={cn(
                            "p-4 rounded-lg border transition-all",
                            anomaly.resolved 
                              ? "bg-muted/30 border-muted opacity-60"
                              : anomaly.severity === 'critical'
                                ? "bg-destructive/10 border-destructive/30 animate-pulse"
                                : "bg-secondary/30 border-secondary"
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div className={cn(
                                "p-2 rounded-lg",
                                getSeverityColor(anomaly.severity)
                              )}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">
                                    {formatAnomalyType(anomaly.anomaly_type)}
                                  </p>
                                  <Badge className={getSeverityColor(anomaly.severity)}>
                                    {anomaly.severity}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {JSON.stringify(anomaly.details)}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatDistanceToNow(new Date(anomaly.created_at), { 
                                    addSuffix: true, 
                                    locale 
                                  })}
                                </p>
                              </div>
                            </div>
                            {anomaly.resolved ? (
                              <Badge variant="outline" className="text-success border-success">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {language === 'fr' ? 'Résolu' : 'Resolved'}
                              </Badge>
                            ) : (
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Connection Logs Tab */}
        <TabsContent value="connections">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                {language === 'fr' ? 'Connexions Récentes' : 'Recent Connections'}
              </CardTitle>
              <CardDescription>
                {language === 'fr'
                  ? 'Analyse des connexions avec détection VPN/Proxy'
                  : 'Connection analysis with VPN/Proxy detection'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {logsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : connectionLogs.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    {language === 'fr' ? 'Aucune connexion enregistrée' : 'No connections recorded'}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {connectionLogs.map((log) => (
                      <div
                        key={log.id}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg border",
                          log.risk_level === 'high' || log.risk_level === 'critical'
                            ? "bg-destructive/5 border-destructive/20"
                            : "bg-secondary/30 border-secondary"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            log.risk_level === 'critical' && "bg-destructive",
                            log.risk_level === 'high' && "bg-orange-500",
                            log.risk_level === 'medium' && "bg-warning",
                            log.risk_level === 'low' && "bg-success"
                          )} />
                          <div>
                            <p className="font-medium text-sm flex items-center gap-2">
                              <MapPin className="w-3 h-3" />
                              {log.city}, {log.country}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {log.vpn_detected && (
                                <Badge variant="secondary" className="text-xs">VPN</Badge>
                              )}
                              {log.proxy_detected && (
                                <Badge variant="secondary" className="text-xs">Proxy</Badge>
                              )}
                              {log.tor_detected && (
                                <Badge variant="destructive" className="text-xs">TOR</Badge>
                              )}
                              <span className={cn("text-xs font-medium", getRiskColor(log.risk_level))}>
                                {language === 'fr' ? 'Risque' : 'Risk'}: {log.risk_score}%
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSecurityDashboard;
