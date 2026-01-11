// Building types
export interface Building {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface BuildingCreate {
  name: string;
}

export interface BuildingUpdate {
  name?: string;
}

// Course types
export interface Course {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface CourseCreate {
  name: string;
}

export interface CourseUpdate {
  name?: string;
}

// Course Session types
export type SessionType = 'lecture' | 'lab' | 'tutorial';

export interface CourseSession {
  id: string;
  course_id: string;
  required_room: string;
  type: SessionType;
  duration: number;
  number_of_sessions: number;
  created_at?: string;
  updated_at?: string;
}

export interface CourseSessionCreate {
  course_id: string;
  required_room: string;
  type: SessionType;
  duration: number;
  number_of_sessions: number;
}

export interface CourseSessionUpdate {
  required_room?: string;
  type?: SessionType;
  duration?: number;
  number_of_sessions?: number;
}

// Room types
export interface Room {
  id: string;
  name: string;
  type: string;
  building_id: string;
  capacity: number;
  created_at?: string;
  updated_at?: string;
}

export interface RoomCreate {
  name: string;
  type: string;
  building_id: string;
  capacity: number;
}

export interface RoomUpdate {
  name?: string;
  type?: string;
  building?: string;
  capacity?: number;
}

// Room Type types
export interface RoomType {
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface RoomTypeCreate {
  name: string;
}

export interface RoomTypeUpdate {
  name?: string;
}

// Schedule types
export interface ScheduledSession {
  course_id: string;
  room_id: string;
  day: number; // 0-6 (0 = Monday, 6 = Sunday)
  start_time: number; // minutes from midnight
  end_time: number; // minutes from midnight
}

export interface Schedule {
  id: string;
  name: string;
  sessions: ScheduledSession[];
  is_active: boolean;
  is_archived: boolean;
  created_at?: string;
}

export interface ScheduleCreate {
  name: string;
  sessions: ScheduledSession[];
}

export interface ScheduleUpdate {
  name?: string;
  sessions?: ScheduledSession[];
  is_active?: boolean;
  is_archived?: boolean;
}

// Scheduler types
export interface TimeRange {
  Start: number; // minutes from midnight
  End: number;
}

export interface SchedulerConfig {
  OperatingHours: TimeRange;
  OperatingDays: number[]; // 0-6 (0 = Monday)
  MinBreakBetweenSessions?: number;
  PreferredSlotDuration?: number;
}

export interface GenerateRequest {
  name: string;
  config?: SchedulerConfig;
}

export interface FailedSession {
  CourseSession: CourseSession;
  Reason: string;
}

export interface SchedulerOutput {
  ScheduledSessions: ScheduledSession[];
  Failures: FailedSession[];
}

export interface GenerateResponse {
  schedule?: Schedule;
  output?: SchedulerOutput;
  failures?: FailedSession[];
  error?: string;
}

// API error response
export interface ApiError {
  error: string;
}
