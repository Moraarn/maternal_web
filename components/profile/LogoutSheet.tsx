'use client'

import { LogOut } from 'lucide-react'

interface LogoutSheetProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function LogoutSheet({ isOpen, onConfirm, onCancel }: LogoutSheetProps) {
  if (!isOpen) return null

  return (
    <>
      <style>{`
        .overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(5px);
          z-index: 200;
          display: flex; align-items: flex-end; justify-content: center;
          padding: 1.5rem;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes slideUp { from { transform:translateY(50px); opacity:0; } to { transform:translateY(0); opacity:1; } }
        
        .sheet {
          background: white; border-radius: 24px;
          padding: 2rem; width: 100%; max-width: 400px;
          animation: slideUp 0.28s cubic-bezier(0.34,1.4,0.64,1);
        }
        [data-theme="dark"] .sheet {
          background: var(--color-surface);
        }
        .sheet-icon {
          width: 52px; height: 52px; border-radius: 16px;
          background: var(--color-red-light);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 14px;
        }
        .sheet h3 {
          font-family: 'Fraunces', serif;
          font-size: 1.2rem; font-weight: 500;
          color: var(--color-text-primary); margin-bottom: 6px;
        }
        .sheet p { font-size: 0.83rem; color: var(--color-text-secondary); margin-bottom: 1.5rem; line-height: 1.55; }
        .sheet-confirm {
          width: 100%; padding: 13px;
          border-radius: 14px;
          background: var(--color-danger); color: white;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem; font-weight: 600;
          border: none; cursor: pointer;
          margin-bottom: 8px;
          transition: background 0.15s;
        }
        .sheet-confirm:hover { background: #b91c1c; }
        .sheet-cancel {
          width: 100%; padding: 13px;
          border-radius: 14px;
          background: var(--color-surface); color: var(--color-text-secondary);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem; font-weight: 500;
          border: 1.5px solid var(--color-border); cursor: pointer;
          transition: background 0.15s;
        }
        .sheet-cancel:hover { background: #f1f5f9; }
      `}</style>

      <div className="overlay" onClick={onCancel}>
        <div className="sheet" onClick={e => e.stopPropagation()}>
          <div className="sheet-icon"><LogOut size={22} color="var(--color-danger)" /></div>
          <h3>Sign out?</h3>
          <p>You'll be returned to the login screen. Your data and checkup history will still be saved.</p>
          <button className="sheet-confirm" onClick={onConfirm}>Yes, sign me out</button>
          <button className="sheet-cancel" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </>
  )
}
