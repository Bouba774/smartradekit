import React from 'react';
import { APP_VERSION, APP_NAME } from '@/lib/version';

interface AppVersionFooterProps {
  className?: string;
}

export const AppVersionFooter: React.FC<AppVersionFooterProps> = ({ className = '' }) => {
  return (
    <div className={`text-center py-4 ${className}`}>
      <p className="text-xs text-muted-foreground">
        {APP_NAME} <span className="text-primary font-semibold">V{APP_VERSION}</span>
      </p>
    </div>
  );
};

export default AppVersionFooter;
