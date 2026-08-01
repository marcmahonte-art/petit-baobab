import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { trackEvent } from '@/features/analytics/engine/index';
import { EventName, AnalyticsEvent } from '@/features/analytics/events/types';
import { getServerUser } from '@/lib/auth';

/**
 * Middleware intercepting all API requests.
 * Maps known routes/methods to analytics events and tracks them.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;
  const user = await getServerUser();

  const mapping: Record<string, { method: string; event: EventName }> = {
    '/api/auth/login': { method: 'POST', event: EventName.LOGIN },
    '/api/auth/logout': { method: 'POST', event: EventName.LOGOUT },
    '/api/drawing/create': { method: 'POST', event: EventName.CREATE_DRAWING },
    '/api/drawing/save': { method: 'POST', event: EventName.SAVE_DRAWING },
    '/api/drawing/delete': { method: 'DELETE', event: EventName.DELETE_DRAWING },
    '/api/books/create': { method: 'POST', event: EventName.CREATE_BOOK },
    '/api/books/download': { method: 'GET', event: EventName.DOWNLOAD_BOOK },
    '/api/checkout/buy': { method: 'POST', event: EventName.BUY_PRODUCT },
    '/api/payments/success': { method: 'POST', event: EventName.PAYMENT_SUCCESS },
    '/api/payments/failure': { method: 'POST', event: EventName.PAYMENT_FAILED },
    '/api/story/create': { method: 'POST', event: EventName.CREATE_STORY },
    '/api/learning-paths/start': { method: 'POST', event: EventName.START_LEARNING_PATH },
    '/api/learning-paths/finish': { method: 'POST', event: EventName.FINISH_LEARNING_PATH },
    '/api/gamification/unlock-badge': { method: 'POST', event: EventName.UNLOCK_BADGE },
    '/api/gamification/gain-xp': { method: 'POST', event: EventName.GAIN_XP },
    '/api/gamification/spend-stars': { method: 'POST', event: EventName.SPEND_STARS },
    '/api/story/watch': { method: 'GET', event: EventName.WATCH_STORY },
    '/api/game/play': { method: 'POST', event: EventName.PLAY_GAME },
    '/api/game/complete': { method: 'POST', event: EventName.COMPLETE_GAME },
    '/api/certificate/download': { method: 'GET', event: EventName.DOWNLOAD_CERTIFICATE },
    '/api/project/create': { method: 'POST', event: EventName.CREATE_PROJECT }
  };

  const key = pathname;
  if (mapping[key] && mapping[key].method === method) {
    const meta = user?.user_metadata ?? {};
    const event: AnalyticsEvent = {
      account_id: typeof meta.account_id === "string" ? meta.account_id : null,
      child_id: typeof meta.child_id === "string" ? meta.child_id : null,
      school_id: typeof meta.school_id === "string" ? meta.school_id : null,
      event_name: mapping[key].event,
      metadata: { path: pathname, method },
    };
    await trackEvent(event);
  }

  return NextResponse.next();
}

export const config = { matcher: ['/api/:path*'] };
