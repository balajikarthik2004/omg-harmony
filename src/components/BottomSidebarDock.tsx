import React, { useRef, useState, useCallback, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getNavigationLinks } from '@/lib/navigation';
import { cn } from '@/lib/utils';

interface BottomSidebarDockProps {
  showOnDesktop?: boolean;
}

// Tooltip
interface DockTooltipProps {
  label: string;
  visible: boolean;
}

const DockTooltip: React.FC<DockTooltipProps> = ({ label, visible }) => (
  <div
    className={cn('dock-tooltip', visible && 'dock-tooltip--visible')}
    role="tooltip"
    aria-hidden={!visible}
  >
    <div className="dock-tooltip__blur" />
    <span className="dock-tooltip__text">{label}</span>
    <span className="dock-tooltip__arrow" aria-hidden="true" />
  </div>
);

// Dock Item
interface DockItemProps {
  link: { to: string; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: string | number }> };
  mouseX: number | null;
  itemRef: (el: HTMLDivElement | null) => void;
  index: number;
}

const DockItem: React.FC<DockItemProps> = ({ link, mouseX, itemRef, index }) => {
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const Icon = link.icon;

  const setRef = useCallback(
    (el: HTMLDivElement | null) => {
      ref.current = el;
      itemRef(el);
    },
    [itemRef]
  );

  // Magnetic scale based on mouse proximity
  const getScale = () => {
    if (mouseX === null || !ref.current) return 1;
    const rect = ref.current.getBoundingClientRect();
    const itemCenterX = rect.left + rect.width / 2;
    const dist = Math.abs(mouseX - itemCenterX);
    const maxDist = 120;
    if (dist > maxDist) return 1;
    const proximity = 1 - dist / maxDist;
    return 1 + proximity * 0.52;
  };

  const scale = getScale();
  const translateY = hovered ? -10 : scale > 1.15 ? -(scale - 1) * 14 : 0;

  return (
    <div
      ref={setRef}
      className="dock-item"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        transform: `scale(${scale}) translateY(${translateY}px)`,
        transition: mouseX === null
          ? 'transform 0.42s cubic-bezier(0.34,1.56,0.64,1)'
          : 'transform 0.12s cubic-bezier(0.25,0.46,0.45,0.94)',
        zIndex: hovered ? 50 : Math.round((scale - 1) * 100),
      }}
    >
      <DockTooltip label={link.label} visible={hovered} />
      <NavLink
        to={link.to}
        aria-label={link.label}
        className={({ isActive }) =>
          cn('dock-link', isActive && 'dock-link--active')
        }
        style={{ animationDelay: `${index * 40}ms` }}
      >
        {/* Layered glass backgrounds */}
        <span className="dock-link__glass" aria-hidden="true" />
        <span className="dock-link__shimmer" aria-hidden="true" />
        <span className="dock-link__glow" aria-hidden="true" />

        {/* Icon container */}
        <span className="dock-link__icon-wrap" aria-hidden="true">
          <Icon className="dock-link__icon" strokeWidth={2} />
        </span>

        {/* Active indicator dot */}
        <span className="dock-link__dot" aria-hidden="true" />
      </NavLink>
    </div>
  );
};

// Main Component
const BottomSidebarDock: React.FC<BottomSidebarDockProps> = ({ showOnDesktop = false }) => {
  const { user } = useAuth();
  const links = React.useMemo(() => getNavigationLinks(user?.role), [user?.role]);
  const [mouseX, setMouseX] = useState<number | null>(null);
  const [isDockHidden, setIsDockHidden] = useState(false);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lastScrollTopRef = useRef(0);
  const scrollDirectionDistanceRef = useRef(0);

  useEffect(() => {
    const scrollHost = document.querySelector<HTMLElement>('.app-main');
    const scrollTarget: HTMLElement | Window = scrollHost ?? window;

    const getScrollTop = () => {
      if (scrollHost) return scrollHost.scrollTop;
      return window.scrollY || document.documentElement.scrollTop || 0;
    };

    lastScrollTopRef.current = getScrollTop();

    let rafId = 0;
    const handleScroll = () => {
      if (rafId) return;

      rafId = window.requestAnimationFrame(() => {
        const current = getScrollTop();
        const delta = current - lastScrollTopRef.current;
        const hideThreshold = 58;
        const showThreshold = 22;

        if (current <= 14) {
          setIsDockHidden(false);
          scrollDirectionDistanceRef.current = 0;
          lastScrollTopRef.current = current;
          rafId = 0;
          return;
        }

        if (Math.abs(delta) < 2) {
          rafId = 0;
          return;
        }

        const wasNegative = scrollDirectionDistanceRef.current < 0;
        const wasPositive = scrollDirectionDistanceRef.current > 0;

        if (delta < 0) {
          scrollDirectionDistanceRef.current = (wasNegative ? scrollDirectionDistanceRef.current : 0) + delta;
          if (Math.abs(scrollDirectionDistanceRef.current) >= hideThreshold) {
            setIsDockHidden(true);
          }
        } else {
          scrollDirectionDistanceRef.current = (wasPositive ? scrollDirectionDistanceRef.current : 0) + delta;
          if (scrollDirectionDistanceRef.current >= showThreshold) {
            setIsDockHidden(false);
          }
        }

        scrollDirectionDistanceRef.current = Math.max(-180, Math.min(180, scrollDirectionDistanceRef.current));
        lastScrollTopRef.current = current;

        rafId = 0;
      });
    };

    scrollTarget.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      scrollTarget.removeEventListener('scroll', handleScroll);
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMouseX(e.clientX);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMouseX(null);
  }, []);

  if (links.length === 0) return null;

  return (
    <>
      {/* Inject styles */}
      <style>{dockStyles}</style>

      <div
        className={cn(
          'dock-root',
          isDockHidden ? 'dock-root--hidden' : 'dock-root--visible',
          !showOnDesktop && 'lg:hidden',
        )}
        role="navigation"
        aria-label="Bottom quick navigation"
      >
        {/* Ambient glow under dock */}
        <div className="dock-ambient" aria-hidden="true" />

        <nav
          className="dock-track"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Track glass layers */}
          <span className="dock-track__inner-glass" aria-hidden="true" />
          <span className="dock-track__border-top" aria-hidden="true" />

          {/* Separator every 4 items */}
          {links.map((link, i) => (
            <React.Fragment key={link.to}>
              {i > 0 && i % 4 === 0 && (
                <span className="dock-separator" aria-hidden="true" />
              )}
              <DockItem
                link={link}
                mouseX={mouseX}
                index={i}
                itemRef={(el) => { itemRefs.current[i] = el; }}
              />
            </React.Fragment>
          ))}
        </nav>
      </div>
    </>
  );
};

// Styles
const dockStyles = `
/* Root wrapper */
.dock-root {
  position: fixed;
  bottom: 18px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9000;
  pointer-events: none;
  width: max-content;
  max-width: calc(100vw - 2rem);
  animation: dock-enter 500ms cubic-bezier(0.34, 1.56, 0.64, 1);
  transition: transform 0.46s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.34s ease, filter 0.36s ease;
}

.dock-root--visible {
  opacity: 1;
  transform: translateX(-50%) translateY(0) scale(1);
  filter: blur(0);
}

.dock-root--hidden {
  opacity: 0;
  transform: translateX(-50%) translateY(44px) scale(0.88);
  filter: blur(3px) saturate(0.86);
}

.dock-root--hidden .dock-track {
  pointer-events: none;
  transform: translateY(10px) scale(0.96);
}

.dock-root--hidden .dock-ambient {
  opacity: 0;
  transform: scale(0.72);
}

/* Ambient glow shadow below dock */
.dock-ambient {
  position: absolute;
  bottom: -8px;
  left: 12%;
  right: 12%;
  height: 32px;
  border-radius: 50%;
  background: radial-gradient(
    ellipse at center,
    hsla(236, 54%, 35%, 0.45) 0%,
    hsla(2, 76%, 52%, 0.22) 55%,
    transparent 80%
  );
  filter: blur(14px);
  pointer-events: none;
  transition: opacity 0.28s ease, transform 0.36s ease;
}

/* Track (the pill) */
.dock-track {
  pointer-events: auto;
  position: relative;
  display: flex;
  align-items: flex-end;
  gap: 6px;
  padding: 8px 12px 10px;
  border-radius: 22px;

  /* Multi-layer glass background */
  background:
    linear-gradient(
      160deg,
      hsl(var(--background) / 0.74) 0%,
      hsl(var(--card) / 0.58) 50%,
      hsl(var(--secondary) / 0.16) 100%
    );

  /* Outer border */
  border: 1px solid hsl(var(--border) / 0.68);

  /* Deep shadow system */
  box-shadow:
    0 2px 0 0 rgba(255,255,255,0.5) inset,
    0 -1px 0 0 rgba(0,0,0,0.06) inset,
    0 32px 64px -20px rgba(8,12,30,0.72),
    0 12px 28px -10px rgba(8,12,30,0.44),
    0 4px 8px -2px rgba(8,12,30,0.22),
    0 0 0 0.5px rgba(0,0,0,0.14);

  backdrop-filter: blur(28px) saturate(1.8) brightness(1.04);
  -webkit-backdrop-filter: blur(28px) saturate(1.8) brightness(1.04);
  overflow: visible;
  transition: transform 0.34s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease;
}

/* Inner glass highlight stripe */
.dock-track__inner-glass {
  position: absolute;
  top: 1px;
  left: 14px;
  right: 14px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.72) 30%, rgba(255,255,255,0.72) 70%, transparent);
  border-radius: 1px;
  pointer-events: none;
}

.dock-track__border-top {
  position: absolute;
  top: 0;
  left: 18px;
  right: 18px;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.45) 40%, rgba(255,255,255,0.45) 60%, transparent);
  border-radius: 999px;
  pointer-events: none;
  filter: blur(0.5px);
}

/* Separator */
.dock-separator {
  display: block;
  width: 1px;
  height: 32px;
  background: linear-gradient(180deg, transparent, hsl(var(--border) / 0.65) 30%, hsl(var(--border) / 0.65) 70%, transparent);
  border-radius: 1px;
  align-self: center;
  flex-shrink: 0;
  margin: 0 2px;
}

/* Individual dock item wrapper */
.dock-item {
  position: relative;
  transform-origin: bottom center;
  will-change: transform;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Link / button */
.dock-link {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 14px;
  color: hsl(var(--foreground) / 0.82);
  text-decoration: none;
  cursor: pointer;
  overflow: hidden;
  animation: item-pop-in 400ms cubic-bezier(0.34, 1.56, 0.64, 1) both;

  /* Subtle item background */
  background:
    linear-gradient(
      160deg,
      hsl(var(--background) / 0.7) 0%,
      hsl(var(--muted) / 0.58) 100%
    );

  border: 1px solid hsl(var(--border) / 0.62);
  box-shadow:
    0 1px 0 hsl(0 0% 100% / 0.38) inset,
    0 2px 8px -2px rgba(0,0,0,0.22);

  transition:
    color 0.22s ease,
    border-color 0.22s ease,
    background 0.22s ease,
    box-shadow 0.22s ease;
}

/* Glass layer (always present, adds depth) */
.dock-link__glass {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(
    160deg,
    rgba(255,255,255,0.18) 0%,
    transparent 60%
  );
  pointer-events: none;
}

/* Shimmer layer on hover/active */
.dock-link__shimmer {
  position: absolute;
  inset: -100%;
  width: 60%;
  height: 200%;
  background: linear-gradient(
    105deg,
    transparent 40%,
    rgba(255,255,255,0.18) 50%,
    transparent 60%
  );
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
  transform: skewX(-15deg);
}

.dock-link:hover .dock-link__shimmer {
  opacity: 1;
  animation: shimmer-slide 0.55s ease forwards;
}

/* Glow behind icon */
.dock-link__glow {
  position: absolute;
  inset: -2px;
  border-radius: 16px;
  opacity: 0;
  background: radial-gradient(
    circle at 50% 120%,
    hsl(var(--primary) / 0.55) 0%,
    transparent 70%
  );
  pointer-events: none;
  transition: opacity 0.28s ease;
  filter: blur(4px);
}

/* Icon wrapper */
.dock-link__icon-wrap {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: linear-gradient(
    180deg,
    hsl(var(--background) / 0.82) 0%,
    hsl(var(--muted) / 0.7) 100%
  );
  border: 1px solid hsl(var(--border) / 0.56);
  box-shadow:
    0 1px 0 hsl(0 0% 100% / 0.42) inset,
    0 1px 4px rgba(0,0,0,0.18);
  transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease;
}

.dock-link__icon {
  width: 16px;
  height: 16px;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
  transition: filter 0.2s ease;
}

/* Active dot indicator */
.dock-link__dot {
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%) scale(0);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(255,255,255,0.9);
  box-shadow: 0 0 6px rgba(255,255,255,0.7);
  transition: transform 0.28s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease;
  pointer-events: none;
  z-index: 3;
}

/* Hover state */
.dock-link:hover {
  color: hsl(var(--foreground) / 0.98);
  border-color: hsl(var(--primary) / 0.35);
  background: linear-gradient(
    160deg,
    hsl(var(--background) / 0.95) 0%,
    hsl(var(--card) / 0.86) 100%
  );
  box-shadow:
    0 1px 0 hsl(0 0% 100% / 0.45) inset,
    0 6px 20px -4px rgba(0,0,0,0.35),
    0 2px 8px -2px rgba(41,48,136,0.25);
}

.dock-link:hover .dock-link__glow { opacity: 0.9; }
.dock-link:hover .dock-link__icon-wrap {
  transform: scale(1.1);
  box-shadow:
    0 1px 0 rgba(255,255,255,0.42) inset,
    0 4px 12px rgba(0,0,0,0.22);
}
.dock-link:hover .dock-link__icon {
  filter: drop-shadow(0 0 6px hsl(var(--primary) / 0.45));
}

/* Active state */
.dock-link--active {
  color: #ffffff;
  border-color: rgba(255,255,255,0.38);
  background: linear-gradient(
    145deg,
    hsl(var(--primary) / 0.92) 0%,
    hsl(var(--secondary) / 0.88) 100%
  );
  box-shadow:
    0 1px 0 rgba(255,255,255,0.28) inset,
    0 8px 24px -6px hsl(var(--primary) / 0.65),
    0 2px 8px -2px rgba(0,0,0,0.3),
    0 0 0 1px hsl(var(--primary) / 0.35);
}

.dock-link--active .dock-link__icon-wrap {
  background: linear-gradient(
    180deg,
    rgba(255,255,255,0.32) 0%,
    rgba(255,255,255,0.10) 100%
  );
  box-shadow:
    0 1px 0 rgba(255,255,255,0.4) inset,
    0 2px 8px rgba(0,0,0,0.25);
}

.dock-link--active .dock-link__dot {
  transform: translateX(-50%) scale(1);
}

.dock-link--active:hover .dock-link__glow { opacity: 0.7; }

/* macOS-style Tooltip */
.dock-tooltip {
  position: absolute;
  bottom: calc(100% + 16px);
  left: 50%;
  transform: translateX(-50%) scale(0.88) translateY(6px);
  opacity: 0;
  pointer-events: none;
  white-space: nowrap;
  transform-origin: bottom center;
  transition:
    opacity 0.18s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 100;
}

.dock-tooltip--visible {
  opacity: 1;
  transform: translateX(-50%) scale(1) translateY(0);
  transition-delay: 0.08s;
}

/* Tooltip blur/glass layer */
.dock-tooltip__blur {
  position: absolute;
  inset: 0;
  border-radius: 10px;
  backdrop-filter: blur(20px) saturate(1.6);
  -webkit-backdrop-filter: blur(20px) saturate(1.6);
  background: linear-gradient(
    165deg,
    rgba(24, 28, 58, 0.86) 0%,
    rgba(15, 18, 40, 0.90) 100%
  );
  border: 1px solid rgba(255,255,255,0.16);
  box-shadow:
    0 1px 0 rgba(255,255,255,0.18) inset,
    0 14px 32px -8px rgba(0,0,0,0.72),
    0 4px 12px -4px rgba(0,0,0,0.44),
    0 0 0 0.5px rgba(0,0,0,0.3);
}

/* Tooltip text */
.dock-tooltip__text {
  position: relative;
  z-index: 1;
  display: block;
  padding: 6px 13px 7px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.012em;
  color: rgba(255,255,255,0.93);
  font-family: var(--font-body, -apple-system, BlinkMacSystemFont, sans-serif);
  text-shadow: 0 1px 3px rgba(0,0,0,0.4);
}

/* Tooltip arrow */
.dock-tooltip__arrow {
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 9px;
  height: 9px;
  background: rgba(15, 18, 40, 0.90);
  border-right: 1px solid rgba(255,255,255,0.14);
  border-bottom: 1px solid rgba(255,255,255,0.14);
  border-radius: 0 0 2px 0;
  z-index: 2;
}

/* Keyframes */
@keyframes dock-enter {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(24px) scale(0.94);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
}

@keyframes item-pop-in {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.85);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes shimmer-slide {
  from { left: -100%; opacity: 1; }
  to   { left: 160%;  opacity: 0; }
}

/* Mobile tweaks */
@media (max-width: 520px) {
  .dock-root { bottom: 12px; }
  .dock-track { padding: 6px 10px 8px; gap: 4px; }
  .dock-link { width: 46px; height: 46px; border-radius: 12px; }
  .dock-link__icon-wrap { width: 25px; height: 25px; }
  .dock-link__icon { width: 14px; height: 14px; }
  .dock-tooltip__text { font-size: 11px; padding: 5px 11px 6px; }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .dock-root, .dock-item, .dock-link, .dock-tooltip {
    animation: none !important;
    transition-duration: 0.01ms !important;
  }
}
`;

export default BottomSidebarDock;
