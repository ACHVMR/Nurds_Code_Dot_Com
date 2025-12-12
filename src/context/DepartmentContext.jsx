import React, { createContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const DepartmentContext = createContext();

export const DepartmentProvider = ({ children }) => {
  const location = useLocation();
  const [currentDepartment, setCurrentDepartment] = useState('home');
  const [energyLevel, setEnergyLevel] = useState('TEACHER');
  
  // Mock user profile
  const [userProfile] = useState({
    name: 'Rishi', // Default mock
    organization: 'AchieveMor',
    avatar: '👤'
  });

  const departmentEnergyDefaults = {
    'home': 'TEACHER',
    'settings': 'PROFESSIONAL',
    'deploy': 'PROFESSIONAL',
    'testing': 'FOCUSED',
    'vibe': 'JOVIAL',
  };

  useEffect(() => {
    // Determine department based on path
    const path = location.pathname;
    let dept = 'home';
    
    if (path.includes('/settings')) dept = 'settings';
    else if (path.includes('/deploy')) dept = 'deploy';
    else if (path.includes('/testing')) dept = 'testing';
    else if (path.includes('/vibe')) dept = 'vibe';
    
    setCurrentDepartment(dept);
    
    // Set default energy for this department (can be overridden later by API)
    setEnergyLevel(departmentEnergyDefaults[dept] || 'TEACHER');
    
  }, [location.pathname]);

  return (
    <DepartmentContext.Provider value={{
      currentDepartment,
      energyLevel,
      setEnergyLevel,
      userProfile
    }}>
      {children}
    </DepartmentContext.Provider>
  );
};
