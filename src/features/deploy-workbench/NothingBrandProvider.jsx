import React from 'react';
import './NothingBrandProvider.css';

/**
 * NothingBrandProvider
 * Scoped provider for Nothing Brand styles (black/white/red palette, diagonal stripes, dot matrix)
 * Only applies within Deploy feature routes to prevent global CSS collisions.
 */
export function NothingBrandProvider({ children }) {
  return (
    <div className="nothing-brand-scope">
      {children}
    </div>
  );
}
