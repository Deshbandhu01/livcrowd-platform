export type Trend = 'INCREASING' | 'DECREASING' | 'STABLE';
export type Density = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Location {
  id: string;
  name: string;
  description: string;
  capacity: number;
  currentCrowd: number;
  baseWaitTimePerPerson: number;
  trend: Trend;
  lastUpdated: any; // Firestore Timestamp
  address?: string;
  latitude?: number;
  longitude?: number;
  trafficInfo?: string;
  bestTimeToVisit?: string;
}

export interface CrowdEvent {
  id: string;
  locationId: string;
  timestamp: any; // Firestore Timestamp
  crowdCount: number;
  source?: 'AI_SIMULATED' | 'USER_REPORTED' | 'SYSTEM';
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  role: 'admin' | 'user';
}

export interface SearchHistory {
  id: string;
  query: string;
  timestamp: any;
  userId: string;
  status: 'found' | 'not_found';
}

export interface DashboardStats {
  density: Density;
  waitTime: number;
  recommendation: {
    icon: string;
    text: string;
    color: string;
  };
}
