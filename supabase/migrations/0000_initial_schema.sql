-- Users/Admins table
create table users (
  id uuid default auth.uid() primary key,
  email text unique,
  is_admin boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Groups table (for choir groups)
create table groups (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Students table
create table students (
  id uuid default uuid_generate_v4() primary key,
  student_id text unique not null,
  first_name text not null,
  last_name text not null,
  grade text,
  group_id uuid references groups(id),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Rehearsals table
create table rehearsals (
  id uuid default uuid_generate_v4() primary key,
  date timestamp with time zone not null,
  created_by uuid references users(id),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Rehearsal Groups (which groups are required for each rehearsal)
create table rehearsal_groups (
  rehearsal_id uuid references rehearsals(id),
  group_id uuid references groups(id),
  primary key (rehearsal_id, group_id)
);

-- Attendance table
create table attendance (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references students(id),
  rehearsal_id uuid references rehearsals(id),
  check_in_time timestamp with time zone default timezone('utc'::text, now()),
  unique(student_id, rehearsal_id)
);
