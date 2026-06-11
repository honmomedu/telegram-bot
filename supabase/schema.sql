-- SecureAttend Database Schema (Postgres)
-- Multi-tenant HR and Payroll System

-- Enable Row Level Security
create extension if not exists "uuid-ossp";

-- Institutions (Tenants)
create table if not exists institutions (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    address text,
    geofence_lat double precision,
    geofence_lng double precision,
    geofence_radius double precision default 50, -- in meters
    created_at timestamp with time zone default now()
);

-- Organizations (Tenants)
create table if not exists organizations (
    slug text primary key,
    name text not null,
    admin_password text not null default 'admin123',
    settings jsonb default '{}'::jsonb, -- geofence, payroll, qr_secret
    attendance_methods jsonb default '{"gps":true, "qr":true, "nfc":true, "face":true, "manual":true}'::jsonb,
    created_at timestamp with time zone default now()
);

-- Insert default organization
insert into organizations (slug, name) values ('default', 'Default Organization') on conflict do nothing;

-- Employees (Tenant-specific workers)
create table if not exists employees (
    id uuid default uuid_generate_v4() primary key,
    org_slug text references organizations(slug) default 'default',
    employee_code text not null,
    name text not null,
    department text,
    telegram_id bigint unique,
    nfc_card_id text,
    active boolean default true,
    salary_type text default 'fixed', -- 'fixed' or 'hourly'
    base_salary numeric(10,2) default 0,
    hourly_rate numeric(10,2) default 0,
    created_at timestamp with time zone default now(),
    unique(org_slug, employee_code)
);

create table if not exists payroll_adjustments (
    id uuid default uuid_generate_v4() primary key,
    org_slug text references organizations(slug) default 'default',
    employee_code text not null,
    month text not null, -- YYYY-MM
    amount numeric(10,2) not null,
    type text not null check (type in ('addition', 'deduction')),
    description text,
    created_at timestamp with time zone default now()
);

-- update attendance to use employee_code and org_slug
alter table attendance add column if not exists org_slug text references organizations(slug) default 'default';
alter table attendance add column if not exists employee_code text;

-- update face enrollments to use employee_code and org_slug
alter table face_enrollments add column if not exists org_slug text references organizations(slug) default 'default';
alter table face_enrollments add column if not exists employee_code text;

create table if not exists users (
    id uuid default uuid_generate_v4() primary key,
    institution_id uuid references institutions(id) on delete cascade,
    role text check (role in ('admin', 'employee', 'manager')) default 'employee',
    first_name text not null,
    last_name text not null,
    email text unique not null,
    phone text,
    telegram_id bigint unique,
    nfc_tag_id text unique,
    hourly_rate numeric(10,2) default 0,
    face_encoding_reference text, -- In a real app this holds face vectors or a reference image URL
    created_at timestamp with time zone default now()
);

-- Face Enrollments
create table if not exists face_enrollments (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references users(id) on delete cascade,
    descriptor jsonb not null, -- Stores the 128-d float array (e.g. as JSON)
    created_at timestamp with time zone default now()
);

-- Attendance Records
create table if not exists attendance (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references users(id) on delete cascade,
    institution_id uuid references institutions(id) on delete cascade,
    check_in_time timestamp with time zone not null default now(),
    check_out_time timestamp with time zone,
    check_in_method text check (check_in_method in ('gps', 'qr', 'nfc', 'face', 'manual')),
    check_in_location_lat double precision,
    check_in_location_lng double precision,
    status text check (status in ('present', 'late', 'absent', 'half_day')) default 'present',
    created_at timestamp with time zone default now()
);

-- Payroll Records
create table if not exists payroll (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references users(id) on delete cascade,
    institution_id uuid references institutions(id) on delete cascade,
    pay_period_start date not null,
    pay_period_end date not null,
    total_hours numeric(10,2) default 0,
    gross_pay numeric(10,2) default 0,
    deductions numeric(10,2) default 0,
    net_pay numeric(10,2) default 0,
    status text check (status in ('draft', 'approved', 'paid')) default 'draft',
    created_at timestamp with time zone default now()
);
