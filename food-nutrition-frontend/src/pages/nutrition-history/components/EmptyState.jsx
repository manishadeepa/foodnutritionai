import React, { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';

/* ─── Keyframe injection ─── */
const STYLES = `
@keyframes es-float {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-8px); }
}
@keyframes es-pulse-ring {
  0%   { transform: scale(0.95); opacity: 0.6; }
  50%  { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.6; }
}
@keyframes es-fade-up {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
.es-icon-wrap {
  animation: es-float 4s ease-in-out infinite;
}
.es-ring {
  animation: es-pulse-ring 3s ease-in-out infinite;
}
.es-fade-1 { animation: es-fade-up 0.5s 0.1s both ease-out; }
.es-fade-2 { animation: es-fade-up 0.5s 0.2s both ease-out; }
.es-fade-3 { animation: es-fade-up 0.5s 0.3s both ease-out; }
.es-fade-4 { animation: es-fade-up 0.5s 0.4s both ease-out; }
.es-fade-5 { animation: es-fade-up 0.5s 0.5s both ease-out; }
.es-feature-card {
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
}
.es-feature-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(52,211,153,0.10);
  border-color: rgba(52,211,153,0.4);
}
.es-cta-btn {
  transition: background 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}
.es-cta-btn:hover {
  background: #059669 !important;
  box-shadow: 0 8px 24px rgba(52,211,153,0.28);
  transform: translateY(-2px);
}
.es-cta-btn:active {
  transform: translateY(0);
}
`;

let injected = false;
function injectStyles() {
  if (injected || typeof document === 'undefined') return;
  const el = document.createElement('style');
  el.textContent = STYLES;
  document.head.appendChild(el);
  injected = true;
}

/* ─── Feature tiles ─── */
const FEATURES = [
  {
    icon: 'Search',
    color: '#34d399',
    bg: 'rgba(52,211,153,0.08)',
    ring: 'rgba(52,211,153,0.2)',
    title: 'Search & Filter',
    desc: 'Find any analysis instantly',
  },
  {
    icon: 'BarChart3',
    color: '#fbbf24',
    bg: 'rgba(251,191,36,0.08)',
    ring: 'rgba(251,191,36,0.2)',
    title: 'Track Progress',
    desc: 'Monitor your nutrition over time',
  },
  {
    icon: 'BookOpen',
    color: '#60a5fa',
    bg: 'rgba(96,165,250,0.08)',
    ring: 'rgba(96,165,250,0.2)',
    title: 'Save Results',
    desc: 'Access your analyses anytime',
  },
];

/* ─── Component ─── */
const EmptyState = ({ onNewAnalysis }) => {
  injectStyles();

  return (
    <div style={{
      background: 'rgba(22,27,34,0.8)',
      backdropFilter: 'blur(16px)',
      borderRadius: '22px',
      border: '1px solid rgba(48,54,61,0.8)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
      padding: '3.5rem 2rem',
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: '440px', margin: '0 auto' }}>

        {/* ── Animated icon ── */}
        <div className="es-fade-1" style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <div style={{ position: 'relative', width: 96, height: 96 }}>
            <div className="es-ring" style={{
              position: 'absolute', inset: -6,
              borderRadius: '50%',
              border: '2px solid rgba(52,211,153,0.2)',
            }} />
            <div className="es-icon-wrap" style={{
              width: 96, height: 96,
              borderRadius: '50%',
              background: 'rgba(52,211,153,0.1)',
              border: '1.5px solid rgba(52,211,153,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(52,211,153,0.15)',
            }}>
              <Icon name="History" size={38} color="#34d399" />
            </div>
          </div>
        </div>

        {/* ── Heading ── */}
        <div className="es-fade-2">
          <h2 style={{
            fontFamily: 'var(--font-heading, "Outfit", sans-serif)',
            fontSize: '1.7rem', fontWeight: 700,
            color: '#ffffff', margin: '0 0 0.6rem 0',
            letterSpacing: '-0.02em',
          }}>
            No analyses yet
          </h2>
          <p style={{
            fontSize: '0.9rem',
            color: '#8b949e',
            lineHeight: 1.65,
            margin: '0 0 2rem 0',
            maxWidth: '320px',
            marginLeft: 'auto', marginRight: 'auto',
          }}>
            Snap or upload a photo of any food and let NutriScan do the rest — your history will appear right here.
          </p>
        </div>

        {/* ── CTA button ── */}
        <div className="es-fade-3" style={{ marginBottom: '2.5rem' }}>
          <button
            onClick={onNewAnalysis}
            className="es-cta-btn"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: '#34d399',
              color: '#0d1117',
              border: 'none',
              borderRadius: '12px',
              padding: '0.75rem 1.75rem',
              fontSize: '0.9rem', fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.01em',
              fontFamily: 'var(--font-heading, "Outfit", sans-serif)',
            }}
          >
            <Icon name="Camera" size={18} color="#0d1117" />
            Analyze Your First Food
          </button>
        </div>

        {/* ── Divider ── */}
        <div className="es-fade-4" style={{
          display: 'flex', alignItems: 'center', gap: '1rem',
          marginBottom: '1.8rem',
        }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(48,54,61,0.8)' }} />
          <span style={{ fontSize: '0.72rem', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
            What you'll get
          </span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(48,54,61,0.8)' }} />
        </div>

        {/* ── Feature cards ── */}
        <div className="es-fade-5" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="es-feature-card" style={{
              background: f.bg,
              border: `1px solid ${f.ring}`,
              borderRadius: '14px',
              padding: '1.1rem 0.75rem',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.55rem',
              cursor: 'default',
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: '10px',
                background: 'rgba(13,17,23,0.6)',
                border: `1px solid ${f.ring}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}>
                <Icon name={f.icon} size={17} color={f.color} />
              </div>
              <p style={{ fontFamily: 'var(--font-heading, "Outfit", sans-serif)', fontSize: '0.8rem', fontWeight: 700, color: '#e6edf3', margin: 0 }}>
                {f.title}
              </p>
              <p style={{ fontSize: '0.72rem', color: '#8b949e', margin: 0, lineHeight: 1.4 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default EmptyState;