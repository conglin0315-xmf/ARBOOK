drop table if exists reading_logs;
drop table if exists books;
drop table if exists child_profiles;

create table child_profiles (
  id text primary key,
  name text not null,
  age int,
  grade text,
  current_comfort_ar_min numeric,
  current_comfort_ar_max numeric,
  favorite_themes text[] default '{}',
  favorite_series text[] default '{}',
  created_at timestamptz default now()
);

create table books (
  id text primary key,
  title text not null,
  author text not null,
  isbn text,
  series text,
  ar_level numeric,
  interest_level text,
  lexile text,
  ar_points numeric,
  cover_url text,
  themes text[] default '{}',
  shelf text default 'reading',
  created_at timestamptz default now()
);

create table reading_logs (
  id text primary key,
  child_id text references child_profiles(id) on delete cascade,
  book_id text references books(id) on delete cascade,
  read_date date not null,
  created_at timestamptz default now(),
  reading_mode text not null,
  liked_score int,
  difficulty text,
  quiz_completed boolean default false,
  quiz_score numeric,
  notes text
);

alter table child_profiles disable row level security;
alter table books disable row level security;
alter table reading_logs disable row level security;
