import React from "react";
import { createPortal } from "react-dom";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTooltipStore } from "@/stores/tooltipStore";

type Placement = "top" | "bottom";

export interface TooltipInfoProps {
  /** Tooltip content (keep it short: definition + formula if relevant). */
  content: React.ReactNode;
  /** Accessible label for the icon button. */
  ariaLabel?: string;
  /** Optional className applied to the trigger button. */
  className?: string;
  /** Optional className applied to the icon. */
  iconClassName?: string;
  /** Icon size preset. */
  size?: "sm" | "md" | "lg";
  /** Prefer a placement if you want, otherwise auto. */
  preferredSide?: Placement;
  /** Show a small arrow. */
  withArrow?: boolean;
  disabled?: boolean;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const sanitizeId = (id: string) => id.replace(/[^a-zA-Z0-9_-]/g, "");

/**
 * Centralized tooltip that works on:
 * - desktop hover
 * - mobile tap
 * With:
 * - Portal (never clipped by overflow)
 * - dynamic positioning (top/bottom)
 * - close on outside click / scroll / Esc / second tap
 * - global coordination (only one tooltip open at a time)
 */
export default function TooltipInfo({
  content,
  ariaLabel = "Aide",
  className,
  iconClassName,
  size = "sm",
  preferredSide,
  withArrow = true,
  disabled = false,
}: TooltipInfoProps) {
  const isMobile = useIsMobile();
  const { openId, setOpenId } = useTooltipStore();
  const reactId = React.useId();
  const idKey = React.useMemo(() => `tooltipinfo-${sanitizeId(reactId)}`, [reactId]);
  const tooltipContentId = React.useMemo(() => `ti-content-${sanitizeId(reactId)}`, [reactId]);

  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const tooltipRef = React.useRef<HTMLDivElement | null>(null);

  const isOpen = openId === idKey;

  const [canHover, setCanHover] = React.useState(false);
  React.useEffect(() => {
    const mql = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanHover(mql.matches);
    update();
    mql.addEventListener?.("change", update);
    return () => mql.removeEventListener?.("change", update);
  }, []);

  const interactionMode: "hover" | "tap" = canHover && !isMobile ? "hover" : "tap";

  const close = React.useCallback(() => {
    if (openId === idKey) setOpenId(null);
  }, [idKey, openId, setOpenId]);

  const open = React.useCallback(() => {
    if (!disabled) setOpenId(idKey);
  }, [disabled, idKey, setOpenId]);

  const toggle = React.useCallback(() => {
    if (disabled) return;
    setOpenId(openId === idKey ? null : idKey);
  }, [disabled, idKey, openId, setOpenId]);

  // ---------- Close triggers: outside click, scroll, escape
  React.useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (triggerRef.current?.contains(target)) return;
      if (tooltipRef.current?.contains(target)) return;
      close();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };

    // Capture scroll events from any scrollable parent.
    const onScroll = () => close();

    document.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [close, isOpen]);

  // ---------- Positioning
  const [position, setPosition] = React.useState<{
    top: number;
    left: number;
    placement: Placement;
  } | null>(null);

  const updatePosition = React.useCallback(() => {
    const triggerEl = triggerRef.current;
    const tooltipEl = tooltipRef.current;
    if (!triggerEl || !tooltipEl) return;

    const rect = triggerEl.getBoundingClientRect();
    const tooltipRect = tooltipEl.getBoundingClientRect();
    const margin = 10;

    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;

    const shouldPlaceTop =
      preferredSide
        ? preferredSide === "top"
        : spaceBelow < tooltipRect.height + margin && spaceAbove > spaceBelow;

    const placement: Placement = shouldPlaceTop ? "top" : "bottom";

    let top =
      placement === "top"
        ? rect.top - tooltipRect.height - margin
        : rect.bottom + margin;

    // keep within viewport
    top = clamp(top, margin, window.innerHeight - tooltipRect.height - margin);

    const centerX = rect.left + rect.width / 2;
    const left = clamp(
      centerX - tooltipRect.width / 2,
      margin,
      window.innerWidth - tooltipRect.width - margin,
    );

    setPosition({ top, left, placement });
  }, [preferredSide]);

  React.useLayoutEffect(() => {
    if (!isOpen) {
      setPosition(null);
      return;
    }

    // Wait 1 frame so the tooltip is mounted and measurable.
    const raf = requestAnimationFrame(() => updatePosition());
    return () => cancelAnimationFrame(raf);
  }, [isOpen, updatePosition, content]);

  React.useEffect(() => {
    if (!isOpen) return;
    const onReflow = () => updatePosition();
    window.addEventListener("resize", onReflow);
    window.addEventListener("scroll", onReflow, true);
    return () => {
      window.removeEventListener("resize", onReflow);
      window.removeEventListener("scroll", onReflow, true);
    };
  }, [isOpen, updatePosition]);

  // ---------- Hover behavior (desktop)
  const closeTimerRef = React.useRef<number | null>(null);
  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };
  const scheduleClose = () => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => close(), 100);
  };

  const sizeClasses = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  if (!content) return null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={ariaLabel}
        aria-describedby={isOpen ? tooltipContentId : undefined}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggle();
        }}
        onMouseDown={(e) => {
          // Prevent unwanted focus/selection side effects in forms/lists.
          e.preventDefault();
          e.stopPropagation();
        }}
        onMouseEnter={
          interactionMode === "hover"
            ? () => {
                clearCloseTimer();
                open();
              }
            : undefined
        }
        onMouseLeave={interactionMode === "hover" ? scheduleClose : undefined}
        className={cn(
          "inline-flex items-center justify-center rounded-full",
          "text-muted-foreground hover:text-primary focus:text-primary",
          "transition-colors",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
          "touch-manipulation",
          // Touch-friendly tap target without breaking layout
          interactionMode === "tap" ? "p-2 -m-2" : "",
          className,
        )}
        disabled={disabled}
      >
        <Info className={cn(sizeClasses[size], iconClassName)} />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={tooltipRef}
            id={tooltipContentId}
            role="tooltip"
            // We avoid depending on global animations; small transition is re-enabled
            // for this component via a scoped CSS exception (.tooltip-info).
            className={cn(
              "tooltip-info",
              "fixed z-[10000]",
              "rounded-md border shadow-md",
              "px-3 py-2",
              "text-sm leading-snug",
              "transition-[opacity,transform] duration-100 ease-out",
              "bg-[hsl(var(--tooltip-bg))] text-popover-foreground",
              "min-h-[44px]",
              "max-w-[280px]",
            )}
            style={{
              top: position?.top ?? -9999,
              left: position?.left ?? -9999,
              opacity: position ? 1 : 0,
              transform: position
                ? "translateY(0px)"
                : (position?.placement ?? preferredSide ?? "bottom") === "top"
                  ? "translateY(-4px)"
                  : "translateY(4px)",
            }}
            onMouseEnter={
              interactionMode === "hover"
                ? () => {
                    clearCloseTimer();
                  }
                : undefined
            }
            onMouseLeave={interactionMode === "hover" ? scheduleClose : undefined}
          >
            {withArrow && position && (
              <div
                aria-hidden
                className={cn(
                  "absolute h-2 w-2 rotate-45",
                  "bg-[hsl(var(--tooltip-bg))]",
                  "border border-border",
                  position.placement === "top"
                    ? "-bottom-1 left-1/2 -translate-x-1/2"
                    : "-top-1 left-1/2 -translate-x-1/2",
                )}
              />
            )}
            <span
              className="block text-wrap-anywhere"
              style={{
                // Clamp to 2 lines (pedagogic + non-intrusive)
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {content}
            </span>
          </div>,
          document.body,
        )}
    </>
  );
}
