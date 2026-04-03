export type Category = 'HOSPITAL' | 'CAFE' | 'COLLEGE' | 'OFFICE' | 'EVENT' | 'OTHER';
export type CrowdLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type Trend = 'INCREASING' | 'STABLE' | 'DECREASING';

export interface Place {
  id: number;
  name: string;
  category: Category;
  address: string;
  capacity: number;
  isActive: boolean;
  createdAt: string;
}

export interface CrowdStatus {
  placeId: number;
  crowdLevel: CrowdLevel;
  trend: Trend;
  waitTimeMin: number;
  waitTimeMax: number;
  updatedAt: string;
}

export interface CrowdSnapshot {
  id: number;
  place: Place;
  signalCount: number;
  crowdLevel: CrowdLevel;
  trend: Trend;
  waitTimeMin: number;
  waitTimeMax: number;
  recordedAt: string;
}

export interface User {
  username: string;
  role: 'USER' | 'ADMIN';
  token: string;
}
