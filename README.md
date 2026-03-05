# Aurora Starter — Booking

A Booking.com-style demo for services, appointments and consultations. Powered by [Aurora Studio](https://github.com/marceldupr/aurora-studio).

## Features

- **Home** — Hero with search-style CTA
- **Browse services** — Card grid with images, duration, price
- **Service detail** — Full info + slot picker + booking form
- **My bookings** — List of appointments with status
- **Holmes** — AI-ready (script included when configured)

## Setup

1. Clone and install: `pnpm install`
2. Copy `.env.example` to `.env.local`
3. Set `AURORA_API_URL`, `AURORA_API_KEY`, `NEXT_PUBLIC_TENANT_SLUG`
4. Provision schema: `pnpm schema:provision`
5. (Optional) Seed data: `pnpm seed`
6. Run: `pnpm dev` (port 3006)

Schema also provisions on first run via instrumentation.

## Tables

- **services** — name, image_url, description, duration, price
- **providers** — name, email
- **time_slots** — provider, service, start/end, status (available/booked/blocked)
- **bookings** — time slot, service, customer details, status

## Workflows

- `booking.confirmed` → email customer
