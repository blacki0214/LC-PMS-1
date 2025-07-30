import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

export interface Activity {
  id: string;
  type: 'prescription' | 'product' | 'order' | 'customer' | 'user' | 'system';
  action: string;
  description: string;
  userName: string;
  userRole: string;
  timestamp: Date;
  metadata?: {
    productName?: string;
    customerName?: string;
    prescriptionId?: string;
    orderId?: string;
    amount?: number;
    status?: string;
  };
}

interface ActivityContextType {
  activities: Activity[];
  addActivity: (type: Activity['type'], action: string, description: string, metadata?: Activity['metadata']) => void;
  getRecentActivities: (limit?: number) => Activity[];
  clearActivities: () => void;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export function useActivity() {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
}

export function ActivityProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);

  const addActivity = useCallback((
    type: Activity['type'], 
    action: string, 
    description: string, 
    metadata?: Activity['metadata']
  ) => {
    if (!user) return;

    const newActivity: Activity = {
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      action,
      description,
      userName: user.name,
      userRole: user.role,
      timestamp: new Date(),
      metadata
    };

    setActivities(prev => [newActivity, ...prev].slice(0, 100)); // Keep last 100 activities
    console.log('📝 Activity logged:', newActivity);
  }, [user]);

  const getRecentActivities = useCallback((limit = 10) => {
    return activities.slice(0, limit);
  }, [activities]);

  const clearActivities = useCallback(() => {
    setActivities([]);
  }, []);

  return (
    <ActivityContext.Provider value={{
      activities,
      addActivity,
      getRecentActivities,
      clearActivities
    }}>
      {children}
    </ActivityContext.Provider>
  );
}
