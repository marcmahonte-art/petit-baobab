import { NextResponse } from 'next/server';
import { trackEvent } from '@/features/analytics/engine/index';
import { EventName, AnalyticsEvent } from '@/features/analytics/events/types';

/**
 * POST /api/analytics/events
 * Allows client code to manually send an analytics event.
 */
export async function POST(request: Request) {
  const body = await request.json();
  const event: AnalyticsEvent = {
    account_id: null,
    child_id: null,
    school_id: null,
    event_name: body.event_name as EventName,
    event_category: body.event_category,
    resource_type: body.resource_type,
    resource_id: body.resource_id,
    metadata: body.metadata,
    ip_country: body.ip_country,
    device: body.device,
    platform: body.platform,
  };
  await trackEvent(event);
  return NextResponse.json({ success: true });
}
