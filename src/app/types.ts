// src/types.ts

// This is the specific type for the status property
export type CaseStatus = 'Active' | 'Pending' | 'Closed';
export type Screen = 'dashboard' | 'reports' | 'cases' | 'profile';


export interface User {
  name: string;
}

export interface Deadline {
  id: number;
  caseNumber: string;
  task: string;
  dueIn: string;
}

export interface Case {
  id: number;
  number: string;
  title: string;
  status: CaseStatus; // Using the specific type here
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