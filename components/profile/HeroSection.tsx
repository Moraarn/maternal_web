'use client'

import { Phone } from 'lucide-react'

interface HeroSectionProps {
  user: {
    fullName: string
    phone: string
    status: string
    trimester?: string
  }
}

const statusMap: Record<string, { emoji: string; label: string }> = {
  pregnant:        { emoji: '🤰', label: 'Pregnant' },
  postpartum_early:{ emoji: '👶', label: 'New Mama · 0–6 weeks' },
  postpartum_late: { emoji: '🌸', label: 'Recovering · 6–12 weeks' },
}

const trimesterMap: Record<string, string> = {
  first:  '1st Trimester · Weeks 1–12',
  second: '2nd Trimester · Weeks 13–26',
  third:  '3rd Trimester · Weeks 27–36',
  term:   'Term · 37+ Weeks',
}

export default function HeroSection({ user }: HeroSectionProps) {
  const statusInfo = statusMap[user.status] ?? { emoji: '✨', label: 'Unknown' }
  const initials = user.fullName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'U'

  return (
    <>
      <style>{`
        .hero {
          position: relative;
          background: linear-gradient(150deg, var(--color-primary) 0%, var(--color-primary-dark) 55%, var(--color-primary-light) 100%);
          padding: 1.75rem 1.5rem 4rem;
          overflow: hidden;
        }
        .hero-orb1 {
          position: absolute; top: -70px; right: -50px;
          width: 240px; height: 240px; border-radius: 50%;
          background: radial-gradient(circle, rgba(249,168,212,0.18) 0%, transparent 70%);
          pointer-events: none;
        }
        .hero-orb2 {
          position: absolute; bottom: -60px; left: -40px;
          width: 200px; height: 200px; border-radius: 50%;
          background: radial-gradient(circle, rgba(147,197,253,0.12) 0%, transparent 70%);
          pointer-events: none;
        }
        .hero-grid {
          position: absolute; inset: 0;
          background-image: linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 32px 32px;
          pointer-events: none;
        }
        .hero-content { position: relative; z-index: 1; }

        .avatar-wrap {
          position: relative;
          width: 72px; height: 72px;
          flex-shrink: 0;
          animation: pulseRing 3s ease-in-out infinite;
          border-radius: 50%;
        }
        @keyframes pulseRing {
          0%,100% { box-shadow: 0 0 0 0 rgba(249,168,212,0.45); }
          50%      { box-shadow: 0 0 0 8px rgba(249,168,212,0); }
        }
        .avatar-ring {
          width: 72px; height: 72px; border-radius: 50%;
          background: linear-gradient(135deg, #f9a8d4 0%, #93c5fd 50%, #86efac 100%);
          padding: 2.5px;
        }
        .avatar-inner {
          width: 100%; height: 100%; border-radius: 50%;
          background: var(--color-primary);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Fraunces', serif;
          font-size: 1.35rem; font-weight: 500;
          color: white;
        }
        .online-dot {
          position: absolute; bottom: 3px; right: 3px;
          width: 13px; height: 13px; border-radius: 50%;
          background: var(--color-primary);
          border: 2px solid var(--color-primary);
        }

        .hero-name {
          font-family: 'Fraunces', serif;
          font-size: 1.45rem; font-weight: 500;
          color: white; line-height: 1.2;
        }
        .hero-phone { font-size: 0.78rem; color: rgba(255,255,255,0.45); letter-spacing: 0.04em; margin-top: 2px; }

        .status-pill {
          display: inline-flex; align-items: center; gap: 7px;
          background: rgba(255,255,255,0.09);
          border: 1px solid rgba(255,255,255,0.14);
          backdrop-filter: blur(10px);
          border-radius: 999px;
          padding: 6px 14px; margin-top: 1.1rem;
        }
        .status-pill-text { font-size: 0.8rem; color: rgba(255,255,255,0.88); }
        .trimester-tag {
          margin-top: 7px; font-size: 0.7rem;
          color: rgba(255,255,255,0.38);
          letter-spacing: 0.07em; text-transform: uppercase;
        }

        /* Dark mode adjustments */
        [data-theme="dark"] .hero {
          background: linear-gradient(150deg, var(--color-primary) 0%, var(--color-primary-dark) 55%, var(--color-primary-light) 100%);
        }
      `}</style>

      <div className="hero">
        <div className="hero-orb1" />
        <div className="hero-orb2" />
        <div className="hero-grid" />
        <div className="hero-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: '1rem' }}>
            <div className="avatar-wrap">
              <div className="avatar-ring">
                <div className="avatar-inner">{initials}</div>
              </div>
              <div className="online-dot" />
            </div>
            <div>
              <div className="hero-name">{user.fullName}</div>
              <div className="hero-phone">{user.phone}</div>
            </div>
          </div>
          <div className="status-pill">
            <span>{statusInfo.emoji}</span>
            <span className="status-pill-text">{statusInfo.label}</span>
          </div>
          {user.trimester && (
            <div className="trimester-tag">{trimesterMap[user.trimester] ?? ''}</div>
          )}
        </div>
      </div>
    </>
  )
}
