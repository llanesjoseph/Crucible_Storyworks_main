
'use client';

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuth, type AppUser } from '@/hooks/use-auth';

type ViewMode = AppUser['role'];

interface ViewModeContextType {
  viewMode: ViewMode;
  actualRole: ViewMode | null;
  setViewMode: (role: ViewMode) => void;
  isViewingAsDifferentRole: boolean;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('student'); // Default to student
  const actualRole = user?.role || null;

  useEffect(() => {
    // When the user logs in or their role changes, reset the view mode to their actual role.
    if (user?.role) {
      setViewMode(user.role);
    }
  }, [user?.role]);

  const isViewingAsDifferentRole = actualRole !== null && viewMode !== actualRole;

  return (
    <ViewModeContext.Provider value={{ viewMode, actualRole, setViewMode, isViewingAsDifferentRole }}>
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  const context = useContext(ViewModeContext);
  if (context === undefined) {
    throw new Error('useViewMode must be used within a ViewModeProvider');
  }
  return context;
}
