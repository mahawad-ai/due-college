-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ─── colleges ────────────────────────────────────────────────────────────────
create table if not exists colleges (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  state       text,
  city        text,
  website     text,
  common_app  boolean default false,
  created_at  timestamptz default now()
);

create index idx_colleges_name on colleges using gin(to_tsvector('english', name));
create index idx_colleges_name_lower on colleges (lower(name));

-- ─── deadlines ───────────────────────────────────────────────────────────────
create table if not exists deadlines (
  id          uuid primary key default gen_random_uuid(),
  college_id  uuid references colleges(id) on delete cascade not null,
  type        text not null check (type in ('ED1','ED2','EA','REA','RD','FAFSA','Housing','Scholarship','Decision')),
  date        date not null,
  time        text,
  notes       text,
  created_at  timestamptz default now()
);

create index idx_deadlines_college_id on deadlines(college_id);
create index idx_deadlines_date on deadlines(date);

-- ─── users ───────────────────────────────────────────────────────────────────
create table if not exists users (
  id                  text primary key,  -- Clerk user ID
  email               text not null unique,
  name                text,
  phone               text,
  subscription_tier   text default 'free' check (subscription_tier in ('free','plus','family')),
  stripe_customer_id  text unique,
  created_at          timestamptz default now()
);

-- ─── user_colleges ───────────────────────────────────────────────────────────
create table if not exists user_colleges (
  id          uuid primary key default gen_random_uuid(),
  user_id     text references users(id) on delete cascade not null,
  college_id  uuid references colleges(id) on delete cascade not null,
  added_at    timestamptz default now(),
  unique(user_id, college_id)
);

create index idx_user_colleges_user_id on user_colleges(user_id);

-- ─── user_deadline_status ────────────────────────────────────────────────────
create table if not exists user_deadline_status (
  id            uuid primary key default gen_random_uuid(),
  user_id       text references users(id) on delete cascade not null,
  deadline_id   uuid references deadlines(id) on delete cascade not null,
  submitted     boolean default false,
  submitted_at  timestamptz,
  unique(user_id, deadline_id)
);

create index idx_user_deadline_status_user_id on user_deadline_status(user_id);

-- ─── parent_connections ──────────────────────────────────────────────────────
create table if not exists parent_connections (
  id                uuid primary key default gen_random_uuid(),
  student_user_id   text references users(id) on delete cascade not null,
  parent_name       text not null,
  parent_email      text not null,
  parent_phone      text,
  access_token      text unique not null default encode(gen_random_bytes(32), 'hex'),
  sms_enabled       boolean default false,
  created_at        timestamptz default now()
);

create index idx_parent_connections_student on parent_connections(student_user_id);
create index idx_parent_connections_token on parent_connections(access_token);

-- ─── notification_preferences ────────────────────────────────────────────────
create table if not exists notification_preferences (
  id              uuid primary key default gen_random_uuid(),
  user_id         text references users(id) on delete cascade not null unique,
  email_enabled   boolean default true,
  sms_enabled     boolean default false,
  remind_30_days  boolean default true,
  remind_14_days  boolean default true,
  remind_7_days   boolean default true,
  remind_3_days   boolean default true,
  remind_1_day    boolean default true
);

-- ─── Row Level Security ──────────────────────────────────────────────────────
alter table colleges enable row level security;
alter table deadlines enable row level security;
alter table users enable row level security;
alter table user_colleges enable row level security;
alter table user_deadline_status enable row level security;
alter table parent_connections enable row level security;
alter table notification_preferences enable row level security;

-- Colleges and deadlines are public read
create policy "colleges_public_read" on colleges for select using (true);
create policy "deadlines_public_read" on deadlines for select using (true);

-- Users own their data
create policy "users_own_data" on users
  for all using (auth.uid()::text = id);

create policy "user_colleges_own" on user_colleges
  for all using (auth.uid()::text = user_id);

create policy "user_deadline_status_own" on user_deadline_status
  for all using (auth.uid()::text = user_id);

create policy "parent_connections_student_own" on parent_connections
  for all using (auth.uid()::text = student_user_id);

create policy "notification_preferences_own" on notification_preferences
  for all using (auth.uid()::text = user_id);

-- Service role bypass (used by API routes)
create policy "service_role_bypass_users" on users
  for all using (auth.role() = 'service_role');

create policy "service_role_bypass_user_colleges" on user_colleges
  for all using (auth.role() = 'service_role');

create policy "service_role_bypass_status" on user_deadline_status
  for all using (auth.role() = 'service_role');

create policy "service_role_bypass_parents" on parent_connections
  for all using (auth.role() = 'service_role');

create policy "service_role_bypass_prefs" on notification_preferences
  for all using (auth.role() = 'service_role');
