// src/app/types.ts

// This is the specific type for the status property
export type CaseStatus = 'Active' | 'Pending' | 'Closed';
export type Screen = 'dashboard' | 'reports' | 'cases' | 'profile';

// ==================== ORIGINAL TYPES (Preserved) ====================

export interface User {
  _id?: string;
  name?: string;
  email?: string;
  badgeNumber?: string;
}

export interface Deadline {
  id: string; // Changed from number to string for MongoDB _id compatibility
  caseNumber: string;
  type: string; // Added for case type
  timeUntil: string; // Changed from 'dueIn' to match API response
  deadline?: string; // Added deadline date
  task?: string; // Optional: kept for backward compatibility
}

export interface Case {
  id: string; // Changed from number to string for MongoDB _id compatibility
  caseNumber: string; // Changed from 'number' to match API
  caseName: string; // Changed from 'title' to match API
  description?: string; // Added for case description
  status: CaseStatus;
  deadline?: string; // Added deadline date
  type?: string; // Added case type
  // Kept for backward compatibility:
  title?: string;
  number?: string;
}

export interface CaseFile {
  id: number;
  name: string;
}

export interface CaseNote {
  id: number;
  timestamp: string;
  text: string;
}

export interface CalendarEvent {
  id: number;
  title: string;
  dateTime: string;
  location: string;
  isPriority: boolean;
}

export interface CaseDetails {
  id: number;
  number: string;
  title: string;
  status: CaseStatus;
  overview: {
    dateTime: string;
    location: string;
    type: string;
    priority: string;
    description: string;
  };
  files: CaseFile[];
  notes: CaseNote[];
  calendar: CalendarEvent[];
}

// ==================== NEW TYPES FOR API/DATABASE ====================

// MongoDB Case Document (from database)
export interface CaseDocument {
  _id: string;
  userId: string;
  caseName: string;
  caseNumber: string;
  description: string;
  deadline: Date | string;
  type: string;
  status: CaseStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Dashboard Data Response
export interface DashboardData {
  user: User;
  deadlines: Deadline[];
  cases: Case[];
}

// Create Case Form Data
export interface CreateCaseFormData {
  caseName: string;
  caseNumber?: string;
  description?: string;
  deadline: string;
  type: string;
}
