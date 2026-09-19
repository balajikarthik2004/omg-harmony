import React from 'react';
import { Navigate } from 'react-router-dom';
import { useTier } from '@/contexts/TierContext';
import type { TierId } from '@/lib/tiers';

interface TierEntryPageProps {
  tier: TierId;
}

/**
 * Entry point for a tier link (/foundation, /growth, /enterprise).
 * Stores the tier, then hands off to the login screen.
 */
const TierEntryPage: React.FC<TierEntryPageProps> = ({ tier }) => {
  const { setTier } = useTier();
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    setTier(tier);
    setIsReady(true);
  }, [tier, setTier]);

  if (!isReady) return null;

  return <Navigate to="/login" replace />;
};

export default TierEntryPage;
