export interface Meeting {
  id: number;
  creator_id: number;
  meeting_code: string;
  meeting_link: string;
  created_at: string;
  updated_at: string;
}

export interface MeetingResponse {
  message?: string;
  data: Meeting;
}

export interface MeetingsResponse {
  data: Meeting[];
}

export interface MeetingDeleteResponse {
  message: string;
}

export interface SummarizerSession {
  session_id: number;
  meeting_id: number;
  status: "STARTED" | "CAPTURED" | "TRANSCRIBED" | "SUMMARIZED" | "FAILED";
  started_at: string;
  ended_at?: string;
  total_chunks?: number;
}

export interface SummarizerStartResponse {
  message: string;
  data: SummarizerSession;
}

export interface SummarizerStopResponse {
  message: string;
  data: SummarizerSession;
}
