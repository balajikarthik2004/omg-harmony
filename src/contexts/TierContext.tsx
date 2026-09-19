import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  DEFAULT_TIER,
  TierDefinition,
  TierId,
  TIERS,
  getTierModules,
  hasModule,
  isTierId,
  type ModuleDefinition,
  type ModuleId,
} from '@/lib/tiers';

const TIER_STORAGE_KEY = 'omg_tier_v1';

interface TierContextValue {
  tier: TierId;
  tierDefinition: TierDefinition;
  modules: ModuleDefinition[];
  setTier: (tier: TierId) => void;
  hasModule: (moduleId: ModuleId) => boolean;
}

const TierContext = createContext<TierContextValue | null>(null);

const loadTier = (): TierId => {
  try {
    const saved = localStorage.getItem(TIER_STORAGE_KEY);
    return isTierId(saved) ? saved : DEFAULT_TIER;
  } catch {
    return DEFAULT_TIER;
  }
};

export const TierProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tier, setTierState] = useState<TierId>(loadTier);

  const setTier = useCallback((next: TierId) => {
    setTierState(next);
    try {
      localStorage.setItem(TIER_STORAGE_KEY, next);
    } catch {
      /* storage unavailable — tier stays in memory for this session */
    }
  }, []);

  const value = useMemo<TierContextValue>(
    () => ({
      tier,
      tierDefinition: TIERS[tier],
      modules: getTierModules(tier),
      setTier,
      hasModule: (moduleId: ModuleId) => hasModule(tier, moduleId),
    }),
    [tier, setTier],
  );

  return <TierContext.Provider value={value}>{children}</TierContext.Provider>;
};

export const useTier = () => {
  const ctx = useContext(TierContext);
  if (!ctx) throw new Error('useTier must be used within TierProvider');
  return ctx;
};
