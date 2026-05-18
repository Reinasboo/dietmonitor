type EventName =
  | 'login_attempt'
  | 'login_success'
  | 'signup_attempt'
  | 'signup_success'
  | 'entry_created'
  | 'entry_updated'
  | 'entry_deleted'
  | 'insights_refreshed'
  | 'settings_saved'
  | 'export_clicked'
  | 'reminder_refreshed'
  | 'error_reported';

export interface TelemetryPayload {
  event: EventName;
  route?: string;
  metadata?: Record<string, unknown>;
}

function sendTelemetry(payload: TelemetryPayload) {
  if (typeof window === 'undefined') return;

  const body = JSON.stringify({
    ...payload,
    ts: new Date().toISOString(),
  });

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: 'application/json' });
    navigator.sendBeacon('/api/events', blob);
    return;
  }

  fetch('/api/events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
    keepalive: true,
  }).catch(() => undefined);
}

export function trackEvent(event: EventName, metadata?: Record<string, unknown>, route?: string) {
  sendTelemetry({ event, metadata, route });
}

export function reportError(error: unknown, route?: string, metadata?: Record<string, unknown>) {
  if (typeof window !== 'undefined') {
    console.error(error);
  }

  const message = error instanceof Error ? error.message : 'Unknown error';
  sendTelemetry({
    event: 'error_reported',
    route,
    metadata: {
      level: 'error',
      message,
      ...(metadata || {}),
    },
  });
}