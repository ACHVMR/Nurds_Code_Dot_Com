import React, { createContext, useContext, useState, useEffect } from 'react';

const RoleContext = createContext();

export const RoleProvider = ({ children }) => {
  // Default to 'owner' for dev convenience, can default to 'user' in prod
  const [role, setRole] = useState(() => localStorage.getItem('nurds_role') || 'owner');

  const toggleRole = () => {
    setRole(prev => {
      const newRole = prev === 'owner' ? 'user' : 'owner';
      localStorage.setItem('nurds_role', newRole);
      return newRole;
    });
  };

  const isOwner = role === 'owner';
  const isUser = role === 'user';

  return (
    <RoleContext.Provider value={{ role, toggleRole, isOwner, isUser }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => useContext(RoleContext);
