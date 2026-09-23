import { ImageResponse } from 'next/og'

export const alt =
  'Absolute Pest Services — pest control in Chester County, Pennsylvania and northern Delaware'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#173f35',
          color: '#fffaf0',
          padding: '72px 80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 26,
            letterSpacing: 3,
            color: '#c3d6bd',
          }}
        >
          ABSOLUTE PEST SERVICES
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div
            style={{
              display: 'flex',
              maxWidth: 980,
              fontSize: 66,
              fontWeight: 700,
              lineHeight: 1.08,
            }}
          >
            Pest control for Chester County &amp; northern Delaware
          </div>
          <div style={{ display: 'flex', fontSize: 30, color: '#c3d6bd' }}>
            Extermination · Termites · Bed Bugs · Rodents · Wildlife
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 25,
          }}
        >
          <span>absolutepestservices.com</span>
          <span>484-643-2225</span>
        </div>
      </div>
    ),
    size
  )
}
