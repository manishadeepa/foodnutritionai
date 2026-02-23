import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/ui/Navbar';
import ContextualActions from '../../components/ui/ContextualActions';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Icon from '../../components/AppIcon';
import HistoryCard from './components/HistoryCard';
import EmptyState from './components/EmptyState';
import StatsBar from './components/StatsBar';

// ── Glitter / sparkle layer ──────────────────────────────────────────────────
const DOTS = Array.from({ length: 55 }, (_, i) => ({
  id: i,
  top:      `${(Math.sin(i * 137.5) * 0.5 + 0.5) * 100}%`,
  left:     `${(Math.cos(i * 97.3)  * 0.5 + 0.5) * 100}%`,
  size:     i % 3 === 0 ? 3 : 2,
  duration: `${2.5 + (i % 7) * 0.6}s`,
  delay:    `${(i % 11) * 0.45}s`,
}));

const glitterCSS = `
  @keyframes glitter-blink {
    0%,100% { opacity:0; transform:scale(0.3); }
    50%      { opacity:1; transform:scale(1);   }
  }
`;

const GlitterLayer = () => (
  <>
    <style>{glitterCSS}</style>
    <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, overflow:'hidden' }}>
      {DOTS.map(d => (
        <span key={d.id} style={{
          position: 'absolute',
          top: d.top, left: d.left,
          width: d.size, height: d.size,
          borderRadius: '50%',
          background: '#34d399',
          boxShadow: `0 0 ${d.size + 3}px ${d.size}px rgba(52,211,153,0.5)`,
          animation: `glitter-blink ${d.duration} ${d.delay} ease-in-out infinite`,
        }} />
      ))}
    </div>
  </>
);
// ─────────────────────────────────────────────────────────────────────────────

const NutritionHistory = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [calorieFilter, setCalorieFilter] = useState('all');
  const [historyData, setHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('nutriscan_user') || '{}');
    const userId = user?.id;
    if (!userId) { navigate('/login'); return; }
    fetch(`http://localhost:5000/api/history/${userId}`)
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          const mapped = res.data.map(item => ({
            id:         item.id,
            imageUrl:   item.image_preview || '',
            imageAlt:   item.food_name,
            foodName:   item.food_name,
            confidence: item.confidence,
            date:       new Date(item.created_at).toISOString().split('T')[0],
            time:       new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            nutritionData: {
              calories:      item.calories,
              protein:       item.protein,
              fat:           item.fat,
              carbohydrates: item.carbohydrates,
              sugar:         item.sugar,
              fiber:         item.fiber,
            }
          }));
          setHistoryData(mapped);
        }
        setIsLoading(false);
      })
      .catch(err => { console.error('History load error:', err); setIsLoading(false); });
  }, []);

  const handleDelete = (id) => {
    fetch(`http://localhost:5000/api/history/${id}`, { method: 'DELETE' })
      .then(r => r.json())
      .then(res => { if (res.success) setHistoryData(prev => prev.filter(item => item.id !== id)); })
      .catch(err => console.error('Delete error:', err));
  };

  const handleViewDetails = (item) => {
    sessionStorage.setItem('nutritionAnalysis', JSON.stringify({
      foodName:     item.foodName,
      confidence:   item.confidence,
      imagePreview: item.imageUrl,
      nutrition: {
        calories:      item.nutritionData.calories,
        protein:       item.nutritionData.protein,
        fat:           item.nutritionData.fat,
        carbohydrates: item.nutritionData.carbohydrates,
        sugar:         item.nutritionData.sugar,
        fiber:         item.nutritionData.fiber,
      }
    }));
    navigate('/nutrition-results');
  };

  const handleNewAnalysis = () => navigate('/image-upload');

  const filteredHistory = historyData?.filter((item) => {
    const matchesSearch = searchTerm === '' ||
      item?.foodName?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const daysDiff = Math.floor((new Date() - new Date(item?.date)) / (1000 * 60 * 60 * 24));
      if (dateFilter === 'today') matchesDate = daysDiff === 0;
      else if (dateFilter === 'week') matchesDate = daysDiff <= 7;
      else if (dateFilter === 'month') matchesDate = daysDiff <= 30;
    }
    let matchesCalories = true;
    if (calorieFilter !== 'all') {
      const calories = item?.nutritionData?.calories;
      if (calorieFilter === 'low') matchesCalories = calories < 300;
      else if (calorieFilter === 'medium') matchesCalories = calories >= 300 && calories <= 500;
      else if (calorieFilter === 'high') matchesCalories = calories > 500;
    }
    return matchesSearch && matchesDate && matchesCalories;
  });

  const dateFilterOptions = [
    { value: 'all',   label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week',  label: 'Last 7 Days' },
    { value: 'month', label: 'Last 30 Days' },
  ];

  const calorieFilterOptions = [
    { value: 'all',    label: 'All Calories' },
    { value: 'low',    label: 'Low (<300 kcal)' },
    { value: 'medium', label: 'Medium (300-500 kcal)' },
    { value: 'high',   label: 'High (>500 kcal)' },
  ];

  // Pure dark navy — no colour glows
  const pageBg = {
    minHeight: '100vh',
    background: '#0d1117',
  };

  if (isLoading) {
    return (
      <>
        <Navbar isAuthenticated={true} />
        <ContextualActions analysisComplete={false} imageUploaded={false} isProcessing={false} onNewAnalysis={handleNewAnalysis} onAnalyzeAnother={handleNewAnalysis} />
        <div className="main-content" style={pageBg}>
          <GlitterLayer />
          <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%',
                  border: '3px solid rgba(52,211,153,0.15)',
                  borderTop: '3px solid #34d399',
                  animation: 'spin 1s linear infinite',
                }} />
              </div>
              <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Loading your history…</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar isAuthenticated={true} />
      <ContextualActions analysisComplete={false} imageUploaded={false} isProcessing={false} onNewAnalysis={handleNewAnalysis} onAnalyzeAnother={handleNewAnalysis} />

      <div className="main-content" style={pageBg}>
        <GlitterLayer />

        {/* ── Back Button ── */}
        <button
          onClick={() => navigate('/image-upload')}
          style={{
            position: 'fixed', top: '72px', left: '16px', zIndex: 50,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            cursor: 'pointer', padding: 0,
            transition: 'background 0.2s, border-color 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(52,211,153,0.15)'; e.currentTarget.style.borderColor = 'rgba(52,211,153,0.4)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
        >
          <Icon name="ArrowLeft" size={16} color="rgba(255,255,255,0.8)" />
        </button>

        {/* ── CHANGED: removed max-w-7xl, now full width with equal small padding on both sides ── */}
        {/* ── ONLY CHANGE: paddingTop reduced from 1.5rem → 0.25rem to move heading up ── */}
        <div style={{ padding: '0.25rem 4% 1.5rem', position:'relative', zIndex:1 }}>

          <div className="mb-6 md:mb-8 text-center">
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              color: '#ffffff',
              margin: '0 0 0.4rem 0',
            }}>
              Nutrition{' '}
              <span style={{ color: '#34d399' }}>History</span>
            </h1>
            <p style={{ color: '#8b949e', fontSize: '0.92rem', margin: 0 }}>
              Review and manage your saved food analyses
            </p>
          </div>

          {historyData?.length === 0 ? (
            <EmptyState onNewAnalysis={handleNewAnalysis} />
          ) : (
            <>
              <StatsBar historyData={historyData} />

              <div style={{
                background: 'rgba(22,27,34,0.8)',
                backdropFilter: 'blur(16px)',
                borderRadius: '16px',
                border: '1px solid rgba(48,54,61,0.8)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
                padding: '1.25rem 1.5rem',
                marginBottom: '1.5rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '8px',
                    background: 'rgba(52,211,153,0.12)',
                    border: '1px solid rgba(52,211,153,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon name="SlidersHorizontal" size={16} color="#34d399" />
                  </div>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, color: '#e6edf3' }}>
                    Filters
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', zIndex: 1, pointerEvents: 'none' }}>
                      <Icon name="Search" size={15} color="#8b949e" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search by food name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e?.target?.value)}
                      style={{
                        width: '100%',
                        paddingLeft: '38px',
                        paddingRight: '12px',
                        paddingTop: '10px',
                        paddingBottom: '10px',
                        background: 'rgba(13,17,23,0.8)',
                        border: '1px solid rgba(48,54,61,0.9)',
                        borderRadius: '10px',
                        color: '#e6edf3',
                        fontSize: '0.875rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                      onFocus={e => e.target.style.borderColor = 'rgba(52,211,153,0.6)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(48,54,61,0.9)'}
                    />
                  </div>
                  <select
                    value={dateFilter}
                    onChange={e => setDateFilter(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'rgba(13,17,23,0.8)',
                      border: '1px solid rgba(48,54,61,0.9)',
                      borderRadius: '10px',
                      color: '#e6edf3',
                      fontSize: '0.875rem',
                      outline: 'none',
                      cursor: 'pointer',
                      appearance: 'none',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238b949e' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center',
                      paddingRight: '32px',
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(52,211,153,0.6)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(48,54,61,0.9)'}
                  >
                    {dateFilterOptions.map(o => <option key={o.value} value={o.value} style={{ background: '#161b22', color: '#e6edf3' }}>{o.label}</option>)}
                  </select>
                  <select
                    value={calorieFilter}
                    onChange={e => setCalorieFilter(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'rgba(13,17,23,0.8)',
                      border: '1px solid rgba(48,54,61,0.9)',
                      borderRadius: '10px',
                      color: '#e6edf3',
                      fontSize: '0.875rem',
                      outline: 'none',
                      cursor: 'pointer',
                      appearance: 'none',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238b949e' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center',
                      paddingRight: '32px',
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(52,211,153,0.6)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(48,54,61,0.9)'}
                  >
                    {calorieFilterOptions.map(o => <option key={o.value} value={o.value} style={{ background: '#161b22', color: '#e6edf3' }}>{o.label}</option>)}
                  </select>
                </div>

                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(48,54,61,0.6)' }}>
                  <p style={{ fontSize: '0.85rem', color: '#8b949e', margin: 0 }}>
                    Showing{' '}
                    <span style={{ fontWeight: 700, color: '#34d399' }}>{filteredHistory?.length}</span>
                    {' '}of{' '}
                    <span style={{ fontWeight: 700, color: '#34d399' }}>{historyData?.length}</span>
                    {' '}analyses
                  </p>
                </div>
              </div>

              {filteredHistory?.length === 0 ? (
                <div style={{
                  padding: '3.5rem 2rem', textAlign: 'center',
                  background: 'rgba(22,27,34,0.7)',
                  backdropFilter: 'blur(12px)',
                  borderRadius: '16px',
                  border: '1px solid rgba(48,54,61,0.8)',
                }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: 'rgba(48,54,61,0.8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1rem',
                  }}>
                    <Icon name="SearchX" size={26} color="#8b949e" />
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, color: '#e6edf3', margin: '0 0 0.4rem 0' }}>
                    No Results Found
                  </h3>
                  <p style={{ color: '#8b949e', fontSize: '0.85rem', margin: 0 }}>
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredHistory?.map((item) => (
                    <HistoryCard key={item?.id} item={item} onDelete={handleDelete} onViewDetails={handleViewDetails} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default NutritionHistory;