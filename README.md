# Aurora Starter — Booking

Services, time slots & appointments. Powered by [Aurora Studio](https://github.com/marceldupr/aurora-studio).

## Setup

1. Clone and install: `pnpm install`
2. Set env vars: `AURORA_API_URL`, `AURORA_API_KEY`, `NEXT_PUBLIC_TENANT_SLUG`
3. Run: `pnpm dev` (port 3006)
4. Schema provisions on first run via instrumentation

## Tables

- **services** — name, description, duration, price
- **providers** — name, email
- **time_slots** — provider, service, start/end, status
- **bookings** — time slot, service, customer details, status

## Workflows

- `booking.confirmed` → email customer
