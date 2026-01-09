import { useCallback, useEffect, useMemo, useState } from 'react';
import { getChronicleEvents } from '../services/chronicle.js';

export function useChronicleEvents({ limit = 50, eventType, since, enabled = true } = {}) {
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const params = useMemo(() => ({ limit, eventType, since }), [limit, eventType, since]);

  const refresh = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError('');

    try {
      const data = await getChronicleEvents(params);
      setEvents(data.events);
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load Chronicle events.');
    } finally {
      setLoading(false);
    }
  }, [enabled, params]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    events,
    stats,
    loading,
    error,
    refresh,
  };
}
