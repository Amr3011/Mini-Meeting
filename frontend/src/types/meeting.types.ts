// Meeting model matching backend response
export interface Meeting {
  id: number;
  creator_id: number;
  meeting_code: string;
  meeting_link: string;
  created_at: string;
  updated_at: string;
}

// Response types
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
