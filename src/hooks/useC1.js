import { useState, useCallback } from 'react';
import { c1Service, C1Cards } from '../services/c1-thesys-service';

/**
 * useC1Card Hook
 * React hook for generating and managing C1 cards
 */
export function useC1Card() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateCard = useCallback(async (prompt, data, type) => {
    setLoading(true);
    setError(null);
    
    try {
      const card = await c1Service.generateCard(prompt, data, type);
      return card;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { generateCard, loading, error };
}

/**
 * useC1AgentCard Hook
 * Generate agent performance cards
 */
export function useC1AgentCard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createCard = useCallback(async (agentData) => {
    setLoading(true);
    setError(null);
    
    try {
      const card = await C1Cards.agent(agentData);
      return card;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createCard, loading, error };
}

/**
 * useC1BuildCard Hook
 * Generate build output cards
 */
export function useC1BuildCard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createCard = useCallback(async (buildData) => {
    setLoading(true);
    setError(null);
    
    try {
      const card = await C1Cards.build(buildData);
      return card;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createCard, loading, error };
}

/**
 * useC1TokenDashboard Hook
 * Generate token usage dashboard
 */
export function useC1TokenDashboard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createDashboard = useCallback(async (tokenData) => {
    setLoading(true);
    setError(null);
    
    try {
      const card = await C1Cards.tokens(tokenData);
      return card;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createDashboard, loading, error };
}

/**
 * useC1Analytics Hook
 * Generate analytics and chart cards
 */
export function useC1Analytics() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createChart = useCallback(async (analyticsData) => {
    setLoading(true);
    setError(null);
    
    try {
      const card = await C1Cards.analytics(analyticsData);
      return card;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createChart, loading, error };
}

/**
 * useC1Table Hook
 * Generate data table cards
 */
export function useC1Table() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createTable = useCallback(async (tableData) => {
    setLoading(true);
    setError(null);
    
    try {
      const card = await C1Cards.table(tableData);
      return card;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createTable, loading, error };
}

/**
 * useC1Progress Hook
 * Generate progress tracking cards
 */
export function useC1Progress() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createProgress = useCallback(async (progressData) => {
    setLoading(true);
    setError(null);
    
    try {
      const card = await C1Cards.progress(progressData);
      return card;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createProgress, loading, error };
}

/**
 * useC1Batch Hook
 * Generate multiple cards in batch
 */
export function useC1Batch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createCards = useCallback(async (cardRequests) => {
    setLoading(true);
    setError(null);
    
    try {
      const cards = await c1Service.createCards(cardRequests);
      return cards;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createCards, loading, error };
}

/**
 * useC1LiveUpdate Hook
 * Automatically regenerate card when data changes
 */
export function useC1LiveUpdate(initialData, type) {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const updateCard = useCallback(async (newData) => {
    setLoading(true);
    setError(null);
    
    try {
      const prompt = `Update ${type} card with new data`;
      const result = await c1Service.generateCard(prompt, newData, type);
      setCard(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [type]);

  // Initial card generation
  useState(() => {
    if (initialData) {
      updateCard(initialData);
    }
  }, [initialData, updateCard]);

  return { card, updateCard, loading, error };
}

export default {
  useC1Card,
  useC1AgentCard,
  useC1BuildCard,
  useC1TokenDashboard,
  useC1Analytics,
  useC1Table,
  useC1Progress,
  useC1Batch,
  useC1LiveUpdate,
};
