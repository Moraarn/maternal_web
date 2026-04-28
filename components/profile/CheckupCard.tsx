'use client'

import { Calendar } from 'lucide-react'

interface CheckupCardProps {
  lastCheckup: {
    date: string
    riskLevel: string
  }
}

const riskStyle = (level: string) => {
  if (level === 'high')   return { bg: 'var(--color-red-light)', color: 'var(--color-danger)', dot: '#EF4444' }
  if (level === 'medium') return { bg: 'var(--color-amber-light)', color: 'var(--color-warning)', dot: '#F59E0B' }
  return                         { bg: 'var(--color-green-light)', color: '#16A34A', dot: '#22C55E' }
}

export default function CheckupCard({ lastCheckup }: CheckupCardProps) {
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const fmtTime = (d: string) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  const lc = riskStyle(lastCheckup.riskLevel)

  return (
    <>
      <style>{`
        .checkup-float {
          margin: -2rem 1.25rem 0;
          position: relative; z-index: 10;
          background: white;
          border-radius: 20px;
          padding: 1.1rem 1.25rem;
          box-shadow: 0 10px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06);
          display: flex; align-items: center; justify-content: space-between;
          animation: fadeUp 0.4s ease both;
        }
        [data-theme="dark"] .checkup-float {
          background: var(--color-surface);
          box-shadow: 0 10px 40px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2);
        }
        @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        
        .cfl { display: flex; align-items: center; gap: 12px; }
        .cfl-icon {
          width: 42px; height: 42px; border-radius: 13px;
          background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .cf-eyebrow { font-size: 0.68rem; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 2px; }
        .cf-date { font-weight: 600; font-size: 0.88rem; color: var(--color-text-primary); }
        .cf-time { font-size: 0.75rem; color: var(--color-text-secondary); margin-top: 1px; }
        .risk-chip {
          display: flex; align-items: center; gap: 5px;
          padding: 6px 12px; border-radius: 999px;
          font-size: 0.7rem; font-weight: 700;
          letter-spacing: 0.07em; text-transform: uppercase;
        }
        .risk-dot { width: 6px; height: 6px; border-radius: 50%; }
      `}</style>

      <div className="checkup-float">
        <div className="cfl">
          <div className="cfl-icon">
            <Calendar size={18} color="white" />
          </div>
          <div>
            <div className="cf-eyebrow">Last Checkup</div>
            <div className="cf-date">{fmtDate(lastCheckup.date)}</div>
            <div className="cf-time">{fmtTime(lastCheckup.date)}</div>
          </div>
        </div>
        <div className="risk-chip" style={{ background: lc.bg, color: lc.color }}>
          <div className="risk-dot" style={{ background: lc.dot }} />
          {lastCheckup.riskLevel} Risk
        </div>
      </div>
    </>
  )
}
