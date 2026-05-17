import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          color: '#1a3a1a',
        }}
      >
        <div style={{ fontSize: 120, marginBottom: 30 }}>🧠</div>
        <div style={{ fontSize: 72, fontWeight: 'bold', marginBottom: 20 }}>
          Mindful
        </div>
        <div style={{ fontSize: 42, color: '#3f7f3f', marginBottom: 20 }}>
          Private Food Logging
        </div>
        <div style={{ fontSize: 32, color: '#5a8f5a' }}>
          No judgment, just awareness
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
