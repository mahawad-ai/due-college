export type SubscriptionTier = 'free' | 'plus' | 'family';

export type ActivityType =
  | 'volunteering'
  | 'internship'
  | 'work'
  | 'extracurricular'
  | 'research'
  | 'award'
  | 'other';

export type DeadlineType =
  | 'ED1'
  | 'ED2'
  | 'EA'
  | 'REA'
  | 'RD'
  | 'FAFSA'
  | 'Housing'
  | 'Scholarship'
  | 'Decision';

export interface College {
  id: string;
  name: string;
  state: string | null;
  city: string | null;
  website: string | null;
  common_app: boolean;
  created_at: string;
}

export interface Deadline {
  id: string;
  college_id: string;
  type: DeadlineType;
  date: string;
  time: string | null;
  notes: string | null;
  created_at: string;
  college?: College;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  subscription_tier: SubscriptionTier;
  stripe_customer_id: string | null;
  created_at: string;
}

export interface UserCollege {
  id: string;
  user_id: string;
  college_id: string;
  added_at: string;
  college?: College;
}

export interface UserDeadlineStatus {
  id: string;
  user_id: string;
  deadline_id: string;
  submitted: boolean;
  submitted_at: string | null;
  user_notes: string | null;
}

export interface CustomDeadline {
  id: string;
  user_id: string;
  college_id: string | null;
  college_name: string;
  type: string;
  due_date: string;
  notes: string | null;
  is_submitted: boolean;
  submitted_at: string | null;
  created_at: string;
}

export interface Activity {
  id: string;
  user_id: string;
  type: ActivityType;
  title: string;
  organization: string;
  role: string | null;
  start_date: string;
  end_date: string | null;
  is_ongoing: boolean;
  hours_per_week: number | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ParentConnection {
  id: string;
  student_user_id: string;
  parent_name: string;
  parent_email: string;
  parent_phone: string | null;
  access_token: string;
  sms_enabled: boolean;
  created_at: string;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  email_enabled: boolean;
  sms_enabled: boolean;
  remind_30_days: boolean;
  remind_14_days: boolean;
  remind_7_days: boolean;
  remind_3_days: boolean;
  remind_1_day: boolean;
}

export interface DeadlineWithCollege extends Deadline {
  college: College;
  daysRemaining: number;
  urgency: 'urgent' | 'upcoming' | 'later';
  status?: UserDeadlineStatus;
}

export interface CollegeWithDeadlines extends College {
  deadlines: Deadline[];
}

/** Shared + custom deadlines normalized to one shape for the deadlines page */
export interface NormalizedDeadline {
  id: string;
  college_id: string | null;
  college: College | null;
  college_name: string;
  type: string;
  date: string;
  time: string | null;
  notes: string | null;
  is_custom: boolean;
  status: { submitted: boolean; submitted_at: string | null } | null;
  daysRemaining: number;
  urgency: 'urgent' | 'upcoming' | 'later';
}

export type EssayType = 'common_app' | 'supplemental' | 'why_school' | 'additional' | 'other';
export type EssayStatus = 'not_started' | 'draft' | 'reviewed' | 'final';
export type RecommenderRole = 'teacher' | 'counselor' | 'employer' | 'mentor' | 'other';
export type RecStatus = 'not_asked' | 'asked' | 'confirmed' | 'submitted';
export type AppStatus = 'not_started' | 'in_progress' | 'submitted' | 'accepted' | 'waitlisted' | 'rejected' | 'deferred' | 'enrolled';
export type ScholarshipStatus = 'researching' | 'in_progress' | 'submitted' | 'awarded' | 'rejected';
export type InterviewFormat = 'virtual' | 'in_person' | 'phone' | 'unknown';
export type InterviewStatus = 'invited' | 'scheduled' | 'completed' | 'cancelled';
export type TestScoreType = 'SAT' | 'ACT' | 'SAT_Math' | 'SAT_EBRW' | 'AP' | 'IB' | 'TOEFL' | 'PSAT' | 'Other';

export interface Essay {
  id: string;
  user_id: string;
  college_id: string | null;
  college_name: string | null;
  type: EssayType;
  prompt: string | null;
  word_limit: number | null;
  status: EssayStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Recommendation {
  id: string;
  user_id: string;
  recommender_name: string;
  recommender_role: RecommenderRole;
  subject: string | null;
  date_asked: string | null;
  status: RecStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserCollegeWithStatus extends UserCollege {
  app_status: AppStatus;
  college_notes: string | null;
  decision_date: string | null;
}

export interface ChecklistItem {
  id: string;
  user_id: string;
  college_id: string;
  item: string;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export interface Scholarship {
  id: string;
  user_id: string;
  name: string;
  organization: string | null;
  amount: number | null;
  deadline: string | null;
  requirements: string | null;
  status: ScholarshipStatus;
  website: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TestScore {
  id: string;
  user_id: string;
  type: TestScoreType;
  score: number;
  max_score: number | null;
  test_date: string | null;
  subject: string | null;
  notes: string | null;
  created_at: string;
}

// ── CIRCLE TYPES ──────────────────────────────────────────────
export type CirclePrivacyMode = 'open' | 'effort_only' | 'private';
export type CircleReaction = 'fire' | 'muscle' | 'heart';
export type CircleActivityType =
  | 'essay_done'
  | 'streak'
  | 'deadline_met'
  | 'school_added'
  | 'submitted'
  | 'custom';

export interface Circle {
  id: string;
  created_by: string;
  invite_code: string;
  privacy_mode: CirclePrivacyMode;
  created_at: string;
}

export interface CircleMember {
  id: string;
  circle_id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  joined_at: string;
}

export interface CircleActivity {
  id: string;
  circle_id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  activity_type: CircleActivityType;
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
  reactions?: CircleReactionCount[];
  user_reactions?: CircleReaction[];
}

export interface CircleReactionCount {
  reaction: CircleReaction;
  count: number;
}

export interface CircleChallenge {
  id: string;
  circle_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  created_by: string;
  created_at: string;
  member_count?: number;
  user_joined?: boolean;
  user_completed?: boolean;
}

export interface CircleData {
  circle: Circle;
  members: CircleMember[];
  activities: CircleActivity[];
  challenges: CircleChallenge[];
  invite_url: string;
  user_handle: string | null;
}
// ──────────────────────────────────────────────────────────────

export interface Interview {
  id: string;
  user_id: string;
  college_id: string | null;
  college_name: string;
  interview_date: string | null;
  format: InterviewFormat;
  interviewer_name: string | null;
  status: InterviewStatus;
  prep_notes: string | null;
  outcome_notes: string | null;
  created_at: string;
  updated_at: string;
}
