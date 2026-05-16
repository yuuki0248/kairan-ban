-- 既存テーブルの定義（参照用）

create table if not exists users (
  id          uuid primary key default gen_random_uuid(),
  line_user_id text unique not null,
  display_name text not null,
  is_admin    boolean not null default false,
  room_number text,
  created_at  timestamptz not null default now()
);

create table if not exists posts (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  body        text not null,
  category    text,
  image_url   text,
  author_id   uuid references users(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists reads (
  id       uuid primary key default gen_random_uuid(),
  post_id  uuid not null references posts(id) on delete cascade,
  user_id  uuid not null references users(id) on delete cascade,
  read_at  timestamptz not null default now(),
  unique(post_id, user_id)
);

-- updated_at を自動更新するトリガー（任意）
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger posts_updated_at
  before update on posts
  for each row execute function set_updated_at();
