import React from 'react';
import { useLocation } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';

interface PageSkeletonProps {
  type?: 'dashboard' | 'reports' | 'calculator' | 'menu' | 'history' | 'comparison' | 'psychology' | 'journal' | 'add-trade' | 'list' | 'form' | 'default';
}

/* ---------- Atoms ---------- */
const Bar: React.FC<{ className?: string }> = ({ className }) => (
  <Skeleton className={className} />
);

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`rounded-2xl border border-border/40 bg-card/40 p-4 ${className}`}>{children}</div>
);

/* ---------- Page header (title + subtitle + icon) ---------- */
const PageHeader: React.FC = () => (
  <div className="flex items-start justify-between gap-3 pt-1">
    <div className="flex-1 space-y-2">
      <Bar className="h-7 w-2/3" />
      <Bar className="h-4 w-1/2" />
    </div>
    <Bar className="h-12 w-12 rounded-2xl shrink-0" />
  </div>
);

/* ---------- Period filter pills ---------- */
const PeriodFilter: React.FC = () => (
  <div className="rounded-2xl bg-card/30 p-2 flex items-center justify-center gap-1.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Bar key={i} className="h-8 w-16 rounded-full" />
    ))}
  </div>
);

/* ---------- Stat cell (label + value) ---------- */
const StatCell: React.FC = () => (
  <Card className="space-y-2">
    <Bar className="h-3 w-2/3" />
    <Bar className="h-7 w-1/2" />
  </Card>
);

/* ---------- Section heading (icon + title) ---------- */
const SectionHeading: React.FC = () => (
  <div className="flex items-center gap-3 pt-2">
    <Bar className="h-9 w-9 rounded-xl" />
    <Bar className="h-5 w-40" />
  </div>
);

/* ---------- Layout wrappers (mimic real Layout) ---------- */
const MobileShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="fixed inset-0 z-50 bg-background overflow-hidden flex flex-col">
    {/* status-bar safe area */}
    <div className="h-[env(safe-area-inset-top)] shrink-0" />
    <div className="flex-1 overflow-y-auto px-3 pt-4 pb-24">
      <div className="space-y-4">{children}</div>
    </div>
    {/* bottom-nav placeholder */}
    <div className="h-16 border-t border-border/40 bg-card/40 flex items-center justify-around px-2 shrink-0">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <Bar className="h-5 w-5 rounded" />
          <Bar className="h-2 w-10" />
        </div>
      ))}
    </div>
  </div>
);

const DesktopShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="fixed inset-0 z-50 bg-background flex">
    {/* sidebar placeholder */}
    <div className="w-64 border-r border-border/40 bg-card/30 p-4 space-y-3 hidden md:block">
      <Bar className="h-10 w-full rounded-xl" />
      <div className="pt-4 space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Bar key={i} className="h-9 w-full rounded-lg" />
        ))}
      </div>
    </div>
    <div className="flex-1 overflow-y-auto px-6 lg:px-8 pt-4 pb-6">
      <div className="max-w-6xl mx-auto space-y-4">{children}</div>
    </div>
  </div>
);

/* ---------- Page-specific bodies ---------- */
const DashboardBody: React.FC = () => (
  <>
    <Card className="h-14 flex items-center"><Bar className="h-5 w-1/2" /></Card>
    <PeriodFilter />
    <SectionHeading />
    <div className="grid grid-cols-2 gap-3">
      <StatCell /><StatCell /><StatCell /><StatCell /><StatCell />
    </div>
    <SectionHeading />
    <div className="grid grid-cols-2 gap-3">
      <StatCell /><StatCell /><StatCell /><StatCell />
    </div>
  </>
);

const ReportsBody: React.FC = () => (
  <>
    <PageHeader />
    <PeriodFilter />
    <div className="grid grid-cols-2 gap-3">
      <Card className="space-y-3 h-28"><Bar className="h-4 w-1/2" /><Bar className="h-9 w-2/3" /></Card>
      <Card className="space-y-3 h-28"><Bar className="h-4 w-1/2" /><Bar className="h-9 w-2/3" /></Card>
      <Card className="space-y-3 h-28"><Bar className="h-4 w-1/2" /><Bar className="h-9 w-2/3" /></Card>
      <Card className="space-y-3 h-28"><Bar className="h-4 w-1/2" /><Bar className="h-9 w-2/3" /></Card>
    </div>
    <Card className="h-20"><Bar className="h-full w-full rounded-xl" /></Card>
    <Card className="h-48"><Bar className="h-full w-full rounded-xl" /></Card>
  </>
);

const CalculatorBody: React.FC = () => (
  <>
    <PageHeader />
    <Card className="space-y-4">
      <div className="flex justify-center"><Bar className="h-10 w-40 rounded-full" /></div>
      <Bar className="h-4 w-16" />
      <Bar className="h-12 w-full rounded-xl" />
      <div className="flex gap-2">
        <Bar className="h-4 w-20" />
        <Bar className="h-7 w-20 rounded-full" />
        <Bar className="h-7 w-20 rounded-full" />
      </div>
      <Bar className="h-4 w-24" />
      <Bar className="h-12 w-full rounded-xl" />
      <Bar className="h-4 w-20" />
      <div className="grid grid-cols-2 gap-3">
        <Bar className="h-12 rounded-xl" />
        <Bar className="h-12 rounded-xl" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Bar className="h-12 rounded-xl" />
        <Bar className="h-12 rounded-xl" />
      </div>
      <Bar className="h-12 w-full rounded-xl" />
    </Card>
  </>
);

const MenuBody: React.FC = () => (
  <>
    <div className="flex items-center gap-3 pt-1">
      <Bar className="h-12 w-12 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Bar className="h-5 w-40" />
        <Bar className="h-3 w-20" />
      </div>
      <Bar className="h-6 w-16" />
    </div>
    {Array.from({ length: 4 }).map((_, sectionIdx) => (
      <div key={sectionIdx} className="space-y-3">
        <Bar className="h-4 w-32" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: sectionIdx === 2 ? 3 : 2 }).map((_, i) => (
            <Card key={i} className="aspect-square flex flex-col items-center justify-center gap-2">
              <Bar className="h-10 w-10 rounded-xl" />
              <Bar className="h-3 w-16" />
            </Card>
          ))}
        </div>
      </div>
    ))}
  </>
);

const HistoryBody: React.FC = () => (
  <>
    <PageHeader />
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <Bar className="h-5 w-40" />
        <Bar className="h-5 w-5 rounded" />
      </div>
      <Bar className="h-9 w-32" />
    </Card>
    <Card className="h-12 flex items-center justify-around">
      <Bar className="h-5 w-20" /><Bar className="h-5 w-20" /><Bar className="h-5 w-20" />
    </Card>
    <div className="grid grid-cols-3 gap-3">
      {Array.from({ length: 12 }).map((_, i) => (
        <Card key={i} className="h-20 space-y-2">
          <Bar className="h-4 w-1/2" />
          <Bar className="h-3 w-3/4" />
        </Card>
      ))}
    </div>
  </>
);

const ComparisonBody: React.FC = () => (
  <>
    <PageHeader />
    <Card className="h-14 flex items-center justify-center"><Bar className="h-9 w-40 rounded-full" /></Card>
    <Card className="space-y-2"><Bar className="h-4 w-32" /><Bar className="h-12 w-full rounded-xl" /></Card>
    <Card className="space-y-2"><Bar className="h-4 w-32" /><Bar className="h-12 w-full rounded-xl" /></Card>
    {Array.from({ length: 3 }).map((_, i) => (
      <Card key={i} className="space-y-3">
        <Bar className="h-4 w-40" />
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1"><Bar className="h-3 w-16" /><Bar className="h-6 w-12" /></div>
          <div className="space-y-1"><Bar className="h-3 w-16" /><Bar className="h-6 w-12" /></div>
        </div>
        <Bar className="h-3 w-2/3" />
      </Card>
    ))}
  </>
);

const PsychologyBody: React.FC = () => (
  <>
    <PageHeader />
    <PeriodFilter />
    <Card className="space-y-4">
      <div className="flex items-center gap-3">
        <Bar className="h-9 w-9 rounded-xl" /><Bar className="h-5 w-40" />
      </div>
      <div className="flex justify-center"><Bar className="h-32 w-32 rounded-full" /></div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="flex justify-between"><Bar className="h-4 w-32" /><Bar className="h-5 w-16 rounded-full" /></div>
          <Bar className="h-2 w-full rounded-full" />
          <Bar className="h-3 w-2/3" />
        </div>
      ))}
    </Card>
    <Card className="h-32"><Bar className="h-full w-full rounded-xl" /></Card>
  </>
);

const JournalBody: React.FC = () => (
  <>
    <PageHeader />
    <Card className="h-16 flex items-center gap-3 px-3">
      <Bar className="h-9 w-9 rounded-xl" />
      <div className="flex-1 space-y-1"><Bar className="h-4 w-32" /><Bar className="h-3 w-24" /></div>
      <Bar className="h-5 w-5 rounded" />
    </Card>
    <Card className="space-y-3">
      <div className="flex items-center gap-3">
        <Bar className="h-9 w-9 rounded-xl" /><Bar className="h-5 w-40" /><div className="ml-auto"><Bar className="h-9 w-12 rounded-full" /></div>
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Bar className="h-5 w-5 rounded-full" />
          <Bar className="h-10 flex-1 rounded-xl" />
          <Bar className="h-5 w-5" /><Bar className="h-5 w-5" />
        </div>
      ))}
    </Card>
  </>
);

const AddTradeBody: React.FC = () => (
  <>
    <PageHeader />
    <Card className="space-y-3">
      <Bar className="h-5 w-40" />
      <Bar className="h-4 w-24" /><Bar className="h-12 w-full rounded-xl" />
      <Bar className="h-4 w-20" />
      <div className="grid grid-cols-2 gap-3"><Bar className="h-12 rounded-xl" /><Bar className="h-12 rounded-xl" /></div>
      <Bar className="h-4 w-16" /><Bar className="h-12 w-full rounded-xl" />
    </Card>
    <Card className="space-y-3">
      <Bar className="h-5 w-40" />
      <Bar className="h-4 w-16" /><Bar className="h-12 w-full rounded-xl" />
      <Bar className="h-4 w-32" /><Bar className="h-12 w-full rounded-xl" />
    </Card>
    <Card className="space-y-3">
      <Bar className="h-5 w-40" />
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2"><Bar className="h-4 w-20" /><Bar className="h-12 rounded-xl" /></div>
        <div className="space-y-2"><Bar className="h-4 w-20" /><Bar className="h-12 rounded-xl" /></div>
      </div>
    </Card>
  </>
);

const DefaultBody: React.FC = () => (
  <>
    <PageHeader />
    <Card className="space-y-3">
      <Bar className="h-4 w-1/3" /><Bar className="h-3 w-full" /><Bar className="h-3 w-11/12" /><Bar className="h-3 w-3/4" />
    </Card>
    <Card className="space-y-3">
      <Bar className="h-4 w-1/3" /><Bar className="h-3 w-full" /><Bar className="h-3 w-11/12" />
    </Card>
  </>
);

/* ---------- Route → variant detection ---------- */
const detectVariant = (path: string): PageSkeletonProps['type'] => {
  if (path.includes('/dashboard')) return 'dashboard';
  if (path.includes('/reports')) return 'reports';
  if (path.includes('/calculator')) return 'calculator';
  if (path.includes('/menu')) return 'menu';
  if (path.includes('/history')) return 'history';
  if (path.includes('/comparison')) return 'comparison';
  if (path.includes('/psychology')) return 'psychology';
  if (path.includes('/journal')) return 'journal';
  if (path.includes('/add-trade')) return 'add-trade';
  return 'default';
};

const renderBody = (variant: PageSkeletonProps['type']) => {
  switch (variant) {
    case 'dashboard': return <DashboardBody />;
    case 'reports': return <ReportsBody />;
    case 'calculator': return <CalculatorBody />;
    case 'menu': return <MenuBody />;
    case 'history': return <HistoryBody />;
    case 'comparison': return <ComparisonBody />;
    case 'psychology': return <PsychologyBody />;
    case 'journal': return <JournalBody />;
    case 'add-trade': return <AddTradeBody />;
    default: return <DefaultBody />;
  }
};

export const PageSkeleton: React.FC<PageSkeletonProps> = ({ type }) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const variant = type && type !== 'default' ? type : detectVariant(location.pathname);
  const body = renderBody(variant);

  return isMobile ? <MobileShell>{body}</MobileShell> : <DesktopShell>{body}</DesktopShell>;
};

export default PageSkeleton;
