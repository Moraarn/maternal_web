'use client'

import { useState } from 'react'
import { Activity, Clock, ChevronRight, ChevronDown } from 'lucide-react'

interface HistoryAccordionProps {
  checkupHistory: Array<{ date: string; riskLevel: string }>
}

const riskStyle = (level: string) => {
  if (level === 'high')   return { bg: 'var(--color-red-light)', color: 'var(--color-danger)', dot: '#EF4444' }
  if (level === 'medium') return { bg: 'var(--color-amber-light)', color: 'var(--color-warning)', dot: '#F59E0B' }
  return                         { bg: 'var(--color-green-light)', color: '#16A34A', dot: '#22C55E' }
}

function Accordion({
  icon, title, badge, children, defaultOpen = false
}: {
  icon: React.ReactNode
  title: string
  badge?: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={`accordion-card ${open ? 'open' : ''}`}>
      <button className="accordion-trigger" onClick={() => setOpen((o: boolean) => !o)}>
        <div className="accordion-trigger-left">
          <div className="accordion-icon">{icon}</div>
          <span className="accordion-title">{title}</span>
          {badge && badge}
        </div>
        <ChevronDown
          size={16}
          className="accordion-chevron"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>
      <div className="accordion-body" style={{ maxHeight: open ? '600px' : '0px' }}>
        <div className="accordion-inner">{children}</div>
      </div>
    </div>
  )
}

export default function HistoryAccordion({ checkupHistory }: HistoryAccordionProps) {
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const fmtTime = (d: string) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  return (
    <>
      <style>{`
        .accordion-card {
          background: white;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          border: 1px solid var(--color-border);
          transition: box-shadow 0.2s;
        }
        [data-theme="dark"] .accordion-card {
          background: var(--color-surface);
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }
        .accordion-card.open { box-shadow: 0 4px 20px rgba(0,0,0,0.09); }
        .accordion-trigger {
          width: 100%;
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 16px;
          background: none; border: none; cursor: pointer;
          text-align: left;
        }
        .accordion-trigger:hover { background: var(--color-surface); }
        .accordion-trigger-left { display: flex; align-items: center; gap: 10px; }
        .accordion-icon {
          width: 34px; height: 34px; border-radius: 10px;
          background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .accordion-title {
          font-size: 0.85rem; font-weight: 600;
          color: var(--color-text-primary); letter-spacing: 0.01em;
        }
        .accordion-badge {
          padding: 3px 8px; border-radius: 999px;
          font-size: 0.65rem; font-weight: 700;
          background: var(--color-surface); color: var(--color-text-secondary);
          letter-spacing: 0.05em;
        }
        .accordion-chevron { color: var(--color-text-secondary); transition: transform 0.25s cubic-bezier(0.4,0,0.2,1); flex-shrink: 0; }
        .accordion-body {
          overflow: hidden;
          transition: max-height 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        .accordion-inner { padding: 0 16px 16px; }

        .h-item {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 12px;
          border-radius: 12px; margin-bottom: 7px;
          background: var(--color-surface);
          cursor: pointer; transition: background 0.15s, transform 0.1s;
          border: 1px solid var(--color-border);
        }
        [data-theme="dark"] .h-item {
          background: var(--color-surface);
          border-color: var(--color-border);
        }
        .h-item:last-child { margin-bottom: 0; }
        .h-item:hover { background: var(--color-surface); transform: translateX(2px); }
        .h-item-left { display: flex; align-items: center; gap: 10px; }
        .h-date { font-size: 0.83rem; font-weight: 500; color: var(--color-text-primary); }
        .h-time { font-size: 0.72rem; color: var(--color-text-secondary); }
        .risk-chip {
          display: flex; align-items: center; gap: 5px;
          padding: 6px 12px; border-radius: 999px;
          font-size: 0.7rem; font-weight: 700;
          letter-spacing: 0.07em; text-transform: uppercase;
        }
        .risk-dot { width: 6px; height: 6px; border-radius: 50%; }
      `}</style>

      <Accordion
        icon={<Activity size={16} color="white" />}
        title="Checkup History"
        badge={
          checkupHistory.length > 0
            ? <span className="accordion-badge">{checkupHistory.length}</span>
            : undefined
        }
        defaultOpen={false}
      >
        {checkupHistory.length > 0 ? (
          checkupHistory.map((c, i) => {
            const cs = riskStyle(c.riskLevel)
            return (
              <div className="h-item" key={i}>
                <div className="h-item-left">
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: cs.dot, flexShrink: 0
                  }} />
                  <div>
                    <div className="h-date">{fmtDate(c.date)}</div>
                    <div className="h-time">{fmtTime(c.date)}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="risk-chip" style={{
                    background: cs.bg, color: cs.color,
                    padding: '4px 10px', fontSize: '0.67rem'
                  }}>
                    <div className="risk-dot" style={{ background: cs.dot }} />
                    {c.riskLevel}
                  </div>
                  <ChevronRight size={13} color="var(--color-text-secondary)" />
                </div>
              </div>
            )
          })
        ) : (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'var(--color-surface)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 10px'
            }}>
              <Clock size={18} color="var(--color-text-secondary)" />
            </div>
            <p style={{ fontSize: '0.83rem', color: 'var(--color-text-secondary)', fontWeight: 500, marginBottom: 3 }}>No checkups yet</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Your history will appear here</p>
          </div>
        )}
      </Accordion>
    </>
  )
}
