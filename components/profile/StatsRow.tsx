'use client'

interface StatsRowProps {
  checkupHistory: Array<{ riskLevel: string }>
  user: {
    trimester?: string
  }
}

export default function StatsRow({ checkupHistory, user }: StatsRowProps) {
  return (
    <>
      <style>{`
        .stats-row {
          display: flex; gap: 10px;
          padding: 1.25rem 1.25rem 0;
          animation: fadeUp 0.45s 0.05s ease both;
        }
        @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        
        .stat-tile {
          flex: 1;
          background: white;
          border-radius: 16px;
          padding: 14px 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          text-align: center;
          border: 1px solid var(--color-border);
        }
        [data-theme="dark"] .stat-tile {
          background: var(--color-surface);
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }
        .stat-num {
          font-family: 'Fraunces', serif;
          font-size: 1.5rem; font-weight: 500;
          color: var(--color-primary); line-height: 1;
          margin-bottom: 4px;
        }
        .stat-label { font-size: 0.68rem; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.06em; }
      `}</style>

      <div className="stats-row">
        <div className="stat-tile">
          <div className="stat-num">{checkupHistory.length}</div>
          <div className="stat-label">Checkups</div>
        </div>
        <div className="stat-tile">
          <div className="stat-num">
            {checkupHistory.filter((c) => c.riskLevel === 'low').length}
          </div>
          <div className="stat-label">Low Risk</div>
        </div>
        <div className="stat-tile">
          <div className="stat-num">
            {user.trimester === 'first' ? '1st'
              : user.trimester === 'second' ? '2nd'
              : user.trimester === 'third' ? '3rd'
              : user.trimester === 'term' ? 'Term'
              : '—'}
          </div>
          <div className="stat-label">Trimester</div>
        </div>
      </div>
    </>
  )
}
