# Security Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all HIGH/MEDIUM/LOW vulnerabilities from the security audit and add layered defences against DDoS and intentional crash attacks.

**Architecture:** Layered security — middleware guards routes first, then API-layer rate limiting, then application-layer validation, then DB constraints as last resort. Admin auth moves from URL query param to HttpOnly signed-cookie session.

**Tech Stack:** Next.js 15 App Router, Node.js crypto (built-in, no new deps), Web Crypto API for Edge-compatible HMAC, Supabase RLS, Vercel Sandbox

---

## Task 1: Security Headers (next.config.ts)
- [ ] Add headers() to next.config.ts: CSP, X-Frame-Options, HSTS, Referrer-Policy, X-Content-Type-Options, Permissions-Policy
- [ ] Build & verify no errors

## Task 2: UNLOCK_ALL Production Guard + event_type Validation
- [ ] lib/unlocks.ts — throw in production if UNLOCK_ALL=true
- [ ] app/api/events/route.ts — add IP-based rate limit + runtime event_type allowlist + bounded map

## Task 3: Sandbox Hardening
- [ ] lib/ide/sandboxRunner.ts — wrap user code with ulimit, fix stop() to not swallow errors
- [ ] app/api/run/route.ts — add export const maxDuration = 90, stdin size cap

## Task 4: Admin Session System (lib/auth/adminSession.ts)
- [ ] Create HMAC-SHA256 session utilities: createSession, verifySession (uses built-in crypto)
- [ ] Session token = base64url(payload).base64url(signature), stored in HttpOnly Secure cookie

## Task 5: Admin Login/Logout API routes
- [ ] app/api/admin/login/route.ts — POST, timingSafeEqual check, set session cookie
- [ ] app/api/admin/logout/route.ts — POST, clear cookie

## Task 6: Admin Login Page
- [ ] app/admin/login/page.tsx — POST form, no password in URL ever

## Task 7: Admin Page + Dashboard Refactor
- [ ] app/admin/page.tsx — read session cookie (not ?pw=), push event aggregation to SQL
- [ ] components/AdminDashboard.tsx — remove adminPw prop, fix Refresh to /admin

## Task 8: Middleware (Route Guard + CORS)
- [ ] middleware.ts — verify admin session cookie, redirect unauthenticated to /admin/login

## Task 9: IP Rate Limiter + /api/run Security
- [ ] lib/rateLimit.ts — bounded in-memory Map keyed by IP, 10 req/min, max 10k entries
- [ ] app/api/run/route.ts — apply rate limiter, add stdin size cap

## Task 10: Pyodide Web Worker
- [ ] public/pyodideWorker.js — standalone worker that loads Pyodide via importScripts
- [ ] lib/ide/runners/pyodideRunner.ts — spawn Worker, 8s timeout via Promise.race, terminate on timeout

## Task 11: Database Constraints Migration
- [ ] New migration: UNIQUE(gcash_ref), CHECK(amount = 20) on unlocks

## Task 12: .env.example Documentation
- [ ] Document all required env vars with risk level notes
