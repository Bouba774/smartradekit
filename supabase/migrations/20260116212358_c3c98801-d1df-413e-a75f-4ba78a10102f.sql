-- Enable realtime for security monitoring tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_login_attempts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_anomalies;
ALTER PUBLICATION supabase_realtime ADD TABLE public.connection_logs;