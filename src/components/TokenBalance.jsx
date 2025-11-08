import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Coins, AlertCircle } from 'lucide-react';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
});

function TokenBalance() {
  const { getToken, isLoaded, userId } = useAuth();
  const [balanceCents, setBalanceCents] = useState(null);
  const [tier, setTier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchBalance = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const token = await getToken?.();
        if (!token) {
          throw new Error('Missing auth session');
        }

        const response = await fetch('/api/tier-credits', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to load balance');
        }

        const data = await response.json();
        if (!isMounted) return;

        setBalanceCents(data.balanceCents ?? 0);
        setTier(data.tier || 'free');
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || 'Failed to load balance');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (isLoaded) {
      fetchBalance();
    }

    return () => {
      isMounted = false;
    };
  }, [getToken, isLoaded, userId]);

  if (!userId) {
    return null;
  }

  const displayBalance =
    typeof balanceCents === 'number'
      ? currencyFormatter.format(balanceCents / 100)
      : '--';

  return (
    <div
      className="flex items-center gap-2 rounded-full border border-[#2a2a2a] bg-[#101010] px-3 py-1.5 text-xs text-white"
      title={error || 'Current token balance'}
    >
      {error ? (
        <AlertCircle className="h-4 w-4 text-red-400" />
      ) : (
        <Coins className="h-4 w-4 text-[#E68961]" />
      )}
      <span className="font-semibold">
        {loading ? 'Syncing…' : displayBalance}
      </span>
      {!loading && tier && !error && (
        <span className="rounded-full bg-[#E68961]/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-[#E68961]">
          {tier}
        </span>
      )}
    </div>
  );
}

export default TokenBalance;
