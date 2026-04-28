'use client'

import { useState } from 'react'
import { Phone, MapPin, Baby, Shield, ChevronDown } from 'lucide-react'

interface ContactAccordionProps {
  user: {
    phone: string
    location?: string
    chwName?: string
    chwPhone?: string
    emergencyContactName?: string
    emergencyContactPhone?: string
  }
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

export default function ContactAccordion({ user }: ContactAccordionProps) {
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

        .info-row {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid var(--color-border);
        }
        .info-row:last-child { border-bottom: none; }
        .info-ico {
          width: 34px; height: 34px; border-radius: 10px;
          background: var(--color-surface); border: 1px solid var(--color-border);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        [data-theme="dark"] .info-ico {
          background: var(--color-surface);
          border-color: var(--color-border);
        }
        .info-lbl { font-size: 0.68rem; color: var(--color-text-secondary); letter-spacing: 0.04em; text-transform: uppercase; margin-bottom: 2px; }
        .info-val { font-size: 0.85rem; font-weight: 500; color: var(--color-text-primary); }
        .info-sub { font-size: 0.75rem; color: var(--color-text-secondary); margin-top: 1px; }
      `}</style>

      <Accordion
        icon={<Shield size={16} color="white" />}
        title="Contact & Care"
        defaultOpen={false}
      >
        <div className="info-row">
          <div className="info-ico"><Phone size={15} color="var(--color-text-secondary)" /></div>
          <div>
            <div className="info-lbl">Phone</div>
            <div className="info-val">{user.phone}</div>
          </div>
        </div>
        <div className="info-row">
          <div className="info-ico"><MapPin size={15} color="var(--color-text-secondary)" /></div>
          <div>
            <div className="info-lbl">Location</div>
            <div className="info-val">{user.location || 'Not set'}</div>
          </div>
        </div>
        {user.chwName && (
          <div className="info-row">
            <div className="info-ico"><Baby size={15} color="var(--color-text-secondary)" /></div>
            <div>
              <div className="info-lbl">Community Health Worker</div>
              <div className="info-val">{user.chwName}</div>
              <div className="info-sub">{user.chwPhone}</div>
            </div>
          </div>
        )}
        {user.emergencyContactName && (
          <div className="info-row">
            <div className="info-ico"><Phone size={15} color="var(--color-danger)" /></div>
            <div>
              <div className="info-lbl">Emergency Contact</div>
              <div className="info-val">{user.emergencyContactName}</div>
              <div className="info-sub">{user.emergencyContactPhone}</div>
            </div>
          </div>
        )}
      </Accordion>
    </>
  )
}
