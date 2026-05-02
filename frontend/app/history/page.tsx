'use client';
import { useEffect, useState } from 'react';
import TopNav from '@/components/TopNav';
import { getHistory } from '@/lib/api';

const EMOTION_EMOJI: Record<string, string> = {
  sadness: '😢', anger: '😠', fear: '😨',
  joy: '😊', disgust: '🤢', surprise: '😲', neutral: '😐'
};

const EMOTION_COLOR: Record<string, { bg: string; text: string; icon: string }> = {
  sadness: { bg: '#e1e0ff', text: '#4648d4', icon: 'water_drop' },
  anger: { bg: '#ffdad6', text: '#ba1a1a', icon: 'local_fire_department' },
  fear: { bg: '#ffdcc5', text: '#904900', icon: 'warning' },
  joy: { bg: '#d4f4dd', text: '#1a7a3c', icon: 'wb_sunny' },
  disgust: { bg: '#e0f4d4', text: '#3a7a1a', icon: 'eco' },
  surprise: { bg: '#fff4cc', text: '#7a6200', icon: 'auto_awesome' },
  neutral: { bg: '#e6e8ea', text: '#464554', icon: 'radio_button_unchecked' },
};

const MEDIA_ICON: Record<string, string> = {
  music: 'library_music',
  video: 'smart_display',
  activity: 'self_improvement',
  book: 'menu_book',
  podcast: 'podcasts',
  unknown: 'spa',
};

interface Entry {
  primary_emotion: string;
  item_type: string;
  item_title: string;
  feedback_score: number | null;
  created_at: string;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function HistoryPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const userId = localStorage.getItem('user_id') || '';
    if (!userId) { setLoading(false); return; }
    getHistory(userId).then((data: any) => {
      setEntries(data.history || []);
      setLoading(false);
    });
  }, []);

  const filtered = filter === 'all' ? entries : entries.filter(e => e.primary_emotion === filter);
  const uniqueEmotions = [...new Set(entries.map(e => e.primary_emotion))];

  // stats
  const totalLogs = entries.length;
  const avgScore = entries.filter(e => e.feedback_score).length > 0
    ? (entries.reduce((s, e) => s + (e.feedback_score || 0), 0) / entries.filter(e => e.feedback_score).length).toFixed(1)
    : '—';
  const topEmotion = (() => {
    if (!entries.length) return '—';
    const c: Record<string, number> = {};
    entries.forEach(e => { c[e.primary_emotion] = (c[e.primary_emotion] || 0) + 1; });
    return Object.entries(c).sort((a, b) => b[1] - a[1])[0][0];
  })();

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e]">
      <TopNav activeLink="history" />
      <main className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <header className="mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-[#2f2ebe] mb-2 font-headline">Reflective Journey</h1>
          <p className="text-[#464554] max-w-2xl leading-relaxed">A record of your emotional landscapes and the companions that helped you navigate them.</p>
        </header>

        {/* Stats row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="md:col-span-2 bg-white p-8 rounded-2xl shadow-[0_8px_24px_rgba(70,72,212,0.06)] flex items-center justify-between">
            <div>
              <h3 className="text-[#464554] font-medium mb-1">Most frequent emotion</h3>
              <div className="text-4xl font-bold text-[#4648d4] capitalize flex items-center gap-3">
                {EMOTION_EMOJI[topEmotion] || '🌊'}
                <span>{topEmotion}</span>
              </div>
            </div>
            <div className="flex gap-2 items-end">
              {entries.slice(0, 5).map((e, i) => {
                const col = EMOTION_COLOR[e.primary_emotion] || EMOTION_COLOR.neutral;
                return <div key={i} className="w-3 rounded-full" style={{ height: 32 + i * 10, background: col.text, opacity: 0.3 + i * 0.14 }} />;
              })}
            </div>
          </div>
          <div className="bg-linear-to-br from-[#4648d4] to-[#6063ee] p-8 rounded-2xl text-white shadow-[0_8px_24px_rgba(70,72,212,0.12)]">
            <span className="material-symbols-outlined text-4xl mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            <div className="text-sm opacity-80 mb-1">Total Reflections</div>
            <div className="text-3xl font-bold">{totalLogs} Logs</div>
            <div className="text-sm opacity-70 mt-2">Avg rating: {avgScore}/5</div>
          </div>
        </div>

        {/* Filter chips */}
        {uniqueEmotions.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-6">
            <button onClick={() => setFilter('all')}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${filter === 'all' ? 'bg-[#4648d4] text-white' : 'bg-white text-[#464554] hover:bg-[#e1e0ff]'}`}>
              All
            </button>
            {uniqueEmotions.map(e => (
              <button key={e} onClick={() => setFilter(e)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors capitalize ${filter === e ? 'bg-[#4648d4] text-white' : 'bg-white text-[#464554] hover:bg-[#e1e0ff]'}`}>
                {EMOTION_EMOJI[e]} {e}
              </button>
            ))}
          </div>
        )}

        <section className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold text-[#2f2ebe] font-headline">
              {filter === 'all' ? 'Recent History' : <span className="capitalize">{filter} entries</span>}
            </h2>
            <span className="text-sm text-[#767586]">{filtered.length} entry{filtered.length !== 1 ? 'ies' : 'y'}</span>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <svg className="animate-spin h-8 w-8 text-[#4648d4]" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-[0_4px_12px_rgba(70,72,212,0.04)]">
              <span className="material-symbols-outlined text-5xl text-[#c7c4d7] mb-4 block">history</span>
              <p className="text-[#464554] font-medium">No reflections yet</p>
              <p className="text-[#767586] text-sm mt-1">Submit a reflection from the dashboard to start your journey.</p>
            </div>
          ) : (
            filtered.map((entry, i) => {
              const col = EMOTION_COLOR[entry.primary_emotion] || EMOTION_COLOR.neutral;
              const mediaIcon = MEDIA_ICON[entry.item_type] || MEDIA_ICON.unknown;
              return (
                <div key={i} className="bg-white p-6 rounded-2xl shadow-[0_4px_12px_rgba(70,72,212,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-4 hover:-translate-y-0.5 transition-transform">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" style={{ background: col.bg, color: col.text }}>
                      <span className="material-symbols-outlined text-2xl">{col.icon}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{EMOTION_EMOJI[entry.primary_emotion] || '🌊'}</span>
                        <h3 className="font-bold text-lg text-[#191c1e] capitalize">{entry.primary_emotion}</h3>
                      </div>
                      <p className="text-sm text-[#464554]">{formatDate(entry.created_at)} at {formatTime(entry.created_at)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
                    {entry.item_title && entry.item_title !== 'unknown' && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#f2f4f6] rounded-xl">
                        <span className="material-symbols-outlined text-sm text-[#4648d4]">{mediaIcon}</span>
                        <span className="text-xs font-medium text-[#191c1e] max-w-40 truncate">{entry.item_title}</span>
                      </div>
                    )}
                    {entry.feedback_score && (
                      <div className="flex items-center gap-1 px-3 py-1.5 bg-[#e1e0ff] rounded-xl">
                        <span className="material-symbols-outlined text-sm text-[#4648d4]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="text-xs font-bold text-[#4648d4]">{entry.feedback_score}/5</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </section>
      </main>
    </div>
  );
}
