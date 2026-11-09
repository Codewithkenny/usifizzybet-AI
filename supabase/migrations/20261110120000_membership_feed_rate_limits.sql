begin;

create table if not exists public.membership_subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan_id text not null check (plan_id in ('Pro', 'Elite')),
  status text not null check (status in ('active', 'expired')),
  current_period_end timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.membership_payments (
  reference text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id text not null check (plan_id in ('Pro', 'Elite')),
  amount_kobo bigint not null check (amount_kobo > 0),
  currency text not null check (currency = 'NGN'),
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed')),
  provider_transaction_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists membership_payments_user_created_idx
  on public.membership_payments (user_id, created_at desc);

alter table public.membership_subscriptions enable row level security;
alter table public.membership_payments enable row level security;
revoke all on public.membership_subscriptions from public, anon, authenticated;
revoke all on public.membership_payments from public, anon, authenticated;
grant all on public.membership_subscriptions to service_role;
grant all on public.membership_payments to service_role;

create table if not exists public.api_rate_limits (
  bucket_key text primary key check (length(bucket_key) = 64),
  window_started_at timestamptz not null,
  request_count integer not null check (request_count > 0),
  updated_at timestamptz not null default now()
);

create index if not exists api_rate_limits_updated_at_idx
  on public.api_rate_limits (updated_at);

alter table public.api_rate_limits enable row level security;
revoke all on public.api_rate_limits from public, anon, authenticated;
grant all on public.api_rate_limits to service_role;

create or replace function public.consume_rate_limit(
  p_bucket_key text,
  p_limit integer,
  p_window_seconds integer
)
returns table (allowed boolean, retry_after_seconds integer)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  bucket public.api_rate_limits%rowtype;
begin
  if length(p_bucket_key) <> 64
     or p_limit < 1
     or p_window_seconds < 1 then
    raise exception 'Invalid rate limit parameters';
  end if;

  if random() < 0.01 then
    delete from public.api_rate_limits
    where updated_at < now() - interval '1 day';
  end if;

  insert into public.api_rate_limits (
    bucket_key, window_started_at, request_count, updated_at
  )
  values (p_bucket_key, now(), 1, now())
  on conflict (bucket_key) do update
  set
    window_started_at = case
      when public.api_rate_limits.window_started_at
        <= now() - make_interval(secs => p_window_seconds)
      then now()
      else public.api_rate_limits.window_started_at
    end,
    request_count = case
      when public.api_rate_limits.window_started_at
        <= now() - make_interval(secs => p_window_seconds)
      then 1
      else least(public.api_rate_limits.request_count + 1, p_limit + 1)
    end,
    updated_at = now()
  returning * into bucket;

  return query
  select
    bucket.request_count <= p_limit,
    case
      when bucket.request_count <= p_limit then 0
      else greatest(
        1,
        ceil(extract(epoch from (
          bucket.window_started_at
          + make_interval(secs => p_window_seconds)
          - now()
        )))::integer
      )
    end;
end;
$$;

revoke all on function public.consume_rate_limit(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, integer, integer)
  to service_role;

create or replace function public.fulfill_paystack_payment(
  p_reference text,
  p_transaction_id text,
  p_amount_kobo bigint,
  p_currency text
)
returns table (plan_id text, current_period_end timestamptz)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  payment public.membership_payments%rowtype;
  new_period_end timestamptz;
begin
  select * into payment
  from public.membership_payments
  where reference = p_reference
  for update;

  if not found then
    raise exception 'Payment reference not found';
  end if;

  if payment.status = 'paid' then
    if payment.provider_transaction_id is distinct from p_transaction_id then
      raise exception 'Payment reference was already used';
    end if;
    return query
      select subscription.plan_id, subscription.current_period_end
      from public.membership_subscriptions as subscription
      where subscription.user_id = payment.user_id;
    return;
  end if;

  if payment.status <> 'pending'
     or payment.amount_kobo <> p_amount_kobo
     or payment.currency <> p_currency then
    raise exception 'Verified payment does not match pending payment';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(payment.user_id::text, 0));

  select greatest(coalesce(subscription.current_period_end, now()), now())
    + interval '1 month'
    into new_period_end
  from (select 1) as seed
  left join public.membership_subscriptions as subscription
    on subscription.user_id = payment.user_id;

  insert into public.membership_subscriptions (
    user_id, plan_id, status, current_period_end, updated_at
  )
  values (
    payment.user_id, payment.plan_id, 'active', new_period_end, now()
  )
  on conflict (user_id) do update
  set
    plan_id = excluded.plan_id,
    status = 'active',
    current_period_end = new_period_end,
    updated_at = now();

  update public.membership_payments
  set
    status = 'paid',
    provider_transaction_id = p_transaction_id,
    updated_at = now()
  where reference = p_reference;

  return query
    select payment.plan_id, new_period_end;
end;
$$;

revoke all on function public.fulfill_paystack_payment(text, text, bigint, text)
  from public, anon, authenticated;
grant execute on function public.fulfill_paystack_payment(text, text, bigint, text)
  to service_role;

commit;
