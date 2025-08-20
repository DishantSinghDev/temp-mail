// lib/rate-limiter.ts
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

type RateLimitStore = {
  [key: string]: {
    count: number;
    expiry: number;
  };
};

const rateLimitStore: RateLimitStore = {};
const RATE_LIMIT_DURATION = 60000; // 1 minute in milliseconds
const RATE_LIMIT_REQUESTS = 10; // 10 requests per minute

export async function rateLimiter() {
  const forwarded = (await headers()).get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : '127.0.0.1';
  const now = Date.now();

  const user = rateLimitStore[ip];

  if (user && now < user.expiry) {
    if (user.count + 1 > RATE_LIMIT_REQUESTS) {
      return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
    }
    rateLimitStore[ip].count++;
  } else {
    rateLimitStore[ip] = {
      count: 1,
      expiry: now + RATE_LIMIT_DURATION,
    };
  }

  // Clean up expired entries
  Object.keys(rateLimitStore).forEach((key) => {
    if (rateLimitStore[key].expiry < now) {
      delete rateLimitStore[key];
    }
  });
}