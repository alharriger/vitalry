# Vitalry

A group wellness game. Friends and family join a fixed-length competition (7 / 14 / 30 days)
and each day complete the same list of nine healthy habits. You earn points for **completing
goals, not for how fit you are** — so a 68-year-old and a marathoner compete on equal footing.
Fairness by design; consistency beats intensity. (Working title: *Fit Friends & Fam*.)

Mobile-first, installable PWA. Web-first, native-ready (Capacitor path reserved for v1.5).

## Stack

React 19 + TypeScript + Vite · installable PWA (`vite-plugin-pwa`) · Supabase (Phase 1+) ·
self-hosted fonts (Bricolage Grotesque + Hanken Grotesk) · Phosphor icons · Cloudflare Pages
hosting. Runs at $0/month at family-beta scale — see [ai_docs/architecture.md](ai_docs/architecture.md).

## Getting started

```bash
npm install
npm run dev          # http://localhost:5173
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Production build (+ PWA service worker) |
| `npm run preview` | Serve the production build on :4173 |
| `npm run lint` | oxlint |
| `npm run typecheck` | `tsc -b --noEmit` |
| `npm test` | Vitest unit + component tests |
| `npm run test:e2e` | Playwright end-to-end (builds + previews internally) |

## Project docs

Start with [CLAUDE.md](CLAUDE.md) (pointers) and [ai_docs/](ai_docs/) (source of truth):
product plan, architecture, design system, roadmap with per-phase exit gates, and the live
[working sprint](ai_docs/working_sprint.md). The founding brief is
[fit-friends-and-fam-plan.md](fit-friends-and-fam-plan.md); the design handoff (tokens,
component references, screen mockups) is under `design_handoff_vitalry_v1/`.

## Status

**Phase 0 — Scaffold.** App shell, design system ported to typed React, the Today check-in
screen against sample data, and full CI. Backend, auth, real scoring, and the remaining
screens follow in Phases 1–6.
