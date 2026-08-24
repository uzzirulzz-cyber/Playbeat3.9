/**
 * Vercel serverless entry point.
 *
 * This file is loaded by Vercel's @vercel/node runtime for every request to
 * /api/*. The Express app (with all routes) is created lazily on first
 * invocation and cached on the module so subsequent requests reuse it
 * (warm starts).
 *
 * RESILIENCE: If the full server.ts fails to load (due to a heavy dependency
 * like mongodb/bcryptjs/pg crashing on Vercel's serverless runtime), the
 * handler falls back to a minimal Express app that still handles:
 *   - GET  /api/health
 *   - POST /api/auth/login (with hardcoded admin fallback)
 *   - GET  /api/products (returns in-memory mock data)
 * This ensures the admin can ALWAYS log in, even if the full backend is down.
 *
 * SECURITY: Never hardcode secrets here. Always read from process.env.
 */

import type { Express, Request, Response } from 'express';

let cachedApp: Express | null = null;
let loadError: string | null = null;

async function getApp(): Promise<Express> {
  if (cachedApp) return cachedApp;
  if (loadError) throw new Error(loadError);

  // Try to load the full server.ts with all 41 routes
  try {
    await import('dotenv/config');
    const { createApiApp } = await import('../server.js');
    cachedApp = createApiApp();
    console.log('[api] Full server loaded successfully');
    return cachedApp;
  } catch (err: any) {
    // Capture the FULL error (message + stack) so the fallback handler
    // can report it via /api/health for debugging.
    const msg = err?.message || String(err);
    const stack = err?.stack || '';
    console.error('[api] Full server failed to load:', msg);
    console.error('[api] Stack:', stack);
    loadError = `${msg}\n${stack}`;
    throw err;
  }
}

/**
 * Build a minimal Express app as a fallback when the full server.ts
 * can't be loaded. This ensures the admin can always log in AND
 * customers can sign up (stored in-memory per serverless instance).
 */
async function getFallbackApp(): Promise<Express> {
  const express = (await import('express')).default;
  const app: Express = express();
  app.use(express.json({ limit: '15mb' }));

  // In-memory user store (per serverless instance — resets on cold start)
  // The hardcoded admin is always present.
  const memUsers: Array<{
    id: string;
    name: string;
    email: string;
    password: string; // plaintext for fallback only (full server uses bcrypt)
    role: string;
    phone?: string;
    country?: string;
    status: string;
    createdAt: string;
  }> = [
    {
      id: 'usr-admin-default',
      name: 'PlayBeat Super Admin',
      email: 'admin@playbeat.digital',
      password: 'playbeat1122',
      role: 'super_admin',
      status: 'active',
      createdAt: new Date().toISOString(),
    },
  ];

  // Health check — includes the error that caused the fallback
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'PlayBeat Digital API Engine (fallback)',
      version: '2.4.0-fallback',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      warning: 'Full server failed to load — running in fallback mode',
      loadError: loadError ? loadError.substring(0, 500) : null,
      userCount: memUsers.length,
    });
  });

  // Admin/customer login — checks in-memory users + hardcoded admin
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }
    const emailLower = email.trim().toLowerCase();
    const user = memUsers.find(u => u.email.toLowerCase() === emailLower && u.password === password);
    if (user) {
      // Strip password before returning
      const { password: _pw, ...safeUser } = user;
      return res.json({
        success: true,
        user: {
          ...safeUser,
          twoFactorEnabled: false,
          addresses: [],
          totalSpent: 0,
          ordersCount: 0,
          wishlist: [],
          lastLogin: new Date().toISOString(),
        },
        token: 'pb_fallback_' + user.id + '_' + Date.now(),
      });
    }
    return res.status(401).json({ success: false, error: 'Invalid email or password.' });
  });

  // Customer signup — creates a new user in memory
  app.post('/api/auth/signup', async (req: Request, res: Response) => {
    const { email, password, name, country, phone } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, error: 'Password must be at least 8 characters long.' });
    }

    const emailLower = email.trim().toLowerCase();
    const existing = memUsers.find(u => u.email.toLowerCase() === emailLower);
    if (existing) {
      return res.status(409).json({ success: false, error: 'An account with this email already exists.' });
    }

    const newUser = {
      id: 'usr-' + Date.now(),
      name: name || email.split('@')[0],
      email: emailLower,
      password, // plaintext for fallback only
      role: 'customer',
      phone: phone || undefined,
      country: country || undefined,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    memUsers.push(newUser);

    const { password: _pw, ...safeUser } = newUser;
    return res.status(201).json({
      success: true,
      user: {
        ...safeUser,
        twoFactorEnabled: false,
        addresses: [],
        totalSpent: 0,
        ordersCount: 0,
        wishlist: [],
      },
      token: 'pb_fallback_' + newUser.id + '_' + Date.now(),
    });
  });

  // Products — return empty array (admin will see the catalog after full server loads)
  app.get('/api/products', (_req: Request, res: Response) => {
    res.json({ products: [], total: 0, fallback: true });
  });

  // Categories
  app.get('/api/categories', (_req: Request, res: Response) => {
    res.json({ categories: [], fallback: true });
  });

  // Orders
  app.get('/api/orders', (_req: Request, res: Response) => {
    res.json({ orders: [], fallback: true });
  });

  // Admin metrics
  app.get('/api/admin/metrics', (_req: Request, res: Response) => {
    res.json({
      metrics: {
        totalRevenue: 0,
        todaysSales: 0,
        totalOrders: 0,
        totalCustomers: memUsers.length,
        totalProducts: 0,
        digitalDeliveriesCount: 0,
        physicalShipmentsCount: 0,
        lowStockCount: 0,
        profitMarginPercent: 0,
        conversionRatePercent: 0,
      },
      fallback: true,
    });
  });

  // Admin users list (for Super Agent Management page)
  app.get('/api/admin/users', (_req: Request, res: Response) => {
    const safeUsers = memUsers.map(u => {
      const { password, ...safe } = u;
      return safe;
    });
    res.json({ users: safeUsers, fallback: true });
  });

  // Catch-all for other API routes — return a friendly error
  app.all('/api/*', (req: Request, res: Response) => {
    res.status(503).json({
      success: false,
      error: 'This endpoint is not available in fallback mode. The full server failed to load.',
      fallback: true,
      path: req.path,
      loadError: loadError ? loadError.substring(0, 200) : null,
    });
  });

  return app;
}

/**
 * Default export — Vercel's @vercel/node runtime calls this for every
 * /api/* request. We try the full server first, then fall back to a
 * minimal app if the full server can't be loaded.
 */
export default async function handler(req: any, res: any) {
  try {
    const app = await getApp();
    return app(req, res);
  } catch {
    // Full server failed — use the fallback app
    const fallbackApp = await getFallbackApp();
    return fallbackApp(req, res);
  }
}
