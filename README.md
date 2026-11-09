# usifizzybet AI

AI-assisted football and basketball prediction analysis built with Next.js 14,
Supabase, and the Anthropic Messages API. Picks are probabilistic information,
not betting instructions or guarantees.

## Local development

Use Node.js 20 or later, install dependencies, configure the environment below,
then run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Development uses `.next-dev`, separate from the production build output in
`.next`, so running `npm run build` does not replace files used by an active
development server. Restart any existing dev server after changing this
configuration.

## Environment

Set these in `.env.local` for local work and in the deployment platform for
production:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=
CRON_SECRET=
MYBETCODE_API_KEY=
PAYSTACK_SECRET_KEY=
APP_BASE_URL=https://your-production-domain.example
```

`SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `CRON_SECRET`,
`MYBETCODE_API_KEY`, and `PAYSTACK_SECRET_KEY` are server-only secrets. Never
prefix them with `NEXT_PUBLIC_` or commit their values. `APP_BASE_URL` must be
the canonical site origin used for payment callbacks and same-origin checkout
requests; SEO canonicals and the sitemap use it as well. Set it to the
production domain in Vercel. Configure Supabase Auth's allowed redirect URLs
to include `/auth/callback` on each deployed site.

The application expects Supabase `profiles` and `entities` tables. The
scheduled tip generator also expects `matches` and `ai_tips` tables with the
columns used by `/api/generate-tips`.

## Database access

Review and apply these migrations in order:

[`supabase/migrations/20261109110000_private_entity_access.sql`](./supabase/migrations/20261109110000_private_entity_access.sql)
and
[`supabase/migrations/20261110120000_membership_feed_rate_limits.sql`](./supabase/migrations/20261110120000_membership_feed_rate_limits.sql)
before deploying. The first secures `entities` and `profiles`. The second
creates private payment and membership records, an atomic database-backed rate
limiter, and the payment-fulfillment function. Pending picks and slips are
redacted unless the account has an active paid membership.

Set `profiles.is_admin` to `true` only for trusted publishing accounts. The
AI generation endpoint and entity publishing policy both check this flag.

## Routes and integrations

- `/`, `/picks`, `/results`, `/safe-bets`, and `/faq` are public product pages.
- `/auth/login`, `/auth/register`, `/auth/forgot-password`, and
  `/auth/reset-password` use Supabase Auth. Short aliases such as `/login` and
  `/register` redirect to those pages.
- `/api/llm/invoke` is admin-only and requires `ANTHROPIC_MODEL` and
  `ANTHROPIC_API_KEY`.
- `/api/feed` proxies MyBetCode picks and fixture/live-score data. It requires a
  Data Feed-enabled MyBetCode key and caches upstream responses for 45 seconds.
- Membership is ₦5,000/month for Pro (up to three daily picks) and ₦15,000/month
  for Elite (all picks available to the configured feed plan). Checkout uses
  Paystack; access is granted only after server-side payment verification.
  Plans do not auto-renew.
- Configure Paystack's webhook URL as
  `https://your-production-domain.example/api/payments/webhook`. The endpoint
  validates Paystack's signature and independently verifies each payment.
- API rate limits use the Supabase-backed `consume_rate_limit` function. If
  the database limiter is unavailable, protected endpoints fail closed with
  HTTP 503 rather than silently allowing requests.
- `GET /api/generate-tips` is intended for a trusted scheduler and requires
  `Authorization: Bearer <CRON_SECRET>`. It generates at most ten tips per
  request.

## Validation

```bash
npm run lint
npm run typecheck
npm run build
```
