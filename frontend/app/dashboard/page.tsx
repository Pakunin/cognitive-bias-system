'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TopNav from '@/components/TopNav';
import { analyze, getHistory } from '@/lib/api';

const EMOTION_EMOJI: Record<string, string> = {
  sadness: '😢', anger: '😠', fear: '😨',
  joy: '😊', disgust: '🤢', surprise: '😲', neutral: '😐'
};

const EMOTION_COLOR: Record<string, { bg: string; text: string }> = {
  sadness: { bg: '#e1e0ff', text: '#4648d4' },
  anger: { bg: '#ffdad6', text: '#ba1a1a' },
  fear: { bg: '#ffdcc5', text: '#904900' },
  joy: { bg: '#d4f4dd', text: '#1a7a3c' },
  disgust: { bg: '#e0f4d4', text: '#3a7a1a' },
  surprise: { bg: '#fff4cc', text: '#7a6200' },
  neutral: { bg: '#e6e8ea', text: '#464554' },
};

const MEDITATION_SESSIONS = [
  { icon: 'self_improvement', label: '5 Min Breathing', color: '#703700', bg: '#ffdcc5', url: 'https://www.youtube.com/watch?v=O-6f5wQXSu8', duration: '5 min' },
  { icon: 'bedtime', label: 'Sleep Meditation', color: '#4648d4', bg: '#e1e0ff', url: 'https://www.youtube.com/watch?v=aEqlQvczMJQ', duration: '10 min' },
  { icon: 'spa', label: 'Body Scan', color: '#1a7a3c', bg: '#d4f4dd', url: 'https://www.youtube.com/watch?v=QS2yDmWk0vs', duration: '10 min' },
  { icon: 'air', label: 'Box Breathing', color: '#904900', bg: '#ffdcc5', url: 'https://www.youtube.com/watch?v=tEmt1Znux58', duration: '5 min' },
];

interface HistoryEntry {
  primary_emotion: string;
  item_type: string;
  item_title: string;
  created_at: string;
}

export default function DashboardPage() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState('Friend');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [weeklyInsight, setWeeklyInsight] = useState({ topEmotion: '', count: 0, streak: 0 });
  const [meditationIdx, setMeditationIdx] = useState(0);
  const router = useRouter();

  useEffect(() => {
    setUserName(localStorage.getItem('user_name') || 'Friend');
    const userId = localStorage.getItem('user_id') || '';
    if (userId) {
      getHistory(userId).then((data: any) => {
        const entries: HistoryEntry[] = data.history || [];
        setHistory(entries.slice(0, 4));
        if (entries.length > 0) {
          // compute top emotion this week
          const emotionCounts: Record<string, number> = {};
          entries.forEach((e: HistoryEntry) => {
            emotionCounts[e.primary_emotion] = (emotionCounts[e.primary_emotion] || 0) + 1;
          });
          const top = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0];
          setWeeklyInsight({ topEmotion: top[0], count: top[1], streak: entries.length });
        }
        // rotate meditation suggestion based on time of day
        const hour = new Date().getHours();
        setMeditationIdx(hour < 12 ? 0 : hour < 17 ? 3 : 1);
      });
    }
  }, []);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    const userId = localStorage.getItem('user_id') || '';
    const data = await analyze(userId, text);
    localStorage.setItem('analysis_result', JSON.stringify(data));
    localStorage.setItem('analysis_text', text);
    setLoading(false);
    router.push(data.safe_to_proceed === false ? '/crisis' : '/results');
  };

  const meditation = MEDITATION_SESSIONS[meditationIdx];
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e]">
      <TopNav activeLink="dashboard" />
      <main className="min-h-screen relative overflow-hidden">
        <div className="fixed inset-0 -z-10 pointer-events-none opacity-40">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-linear-to-br from-[#4648d4]/30 to-transparent blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-linear-to-tl from-[#575992]/20 to-transparent blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
          <header className="mb-16">
            <h1 className="font-headline text-5xl md:text-6xl font-extrabold tracking-tighter text-[#2f2ebe] mb-4">
              {greeting}, {userName}
            </h1>
            <p className="text-[#464554] text-lg max-w-xl">Welcome to your sanctuary. Take a moment to breathe and check in with yourself.</p>
          </header>

          {/* Mood input */}
          <section className="mb-16 flex flex-col items-center">
            <div className="w-full max-w-3xl bg-white rounded-2xl p-8 md:p-12 shadow-[0_8px_24px_rgba(70,72,212,0.06)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <span className="material-symbols-outlined text-9xl">spa</span>
              </div>
              <div className="relative z-10">
                <label className="block font-headline text-2xl font-bold text-[#191c1e] mb-8 text-center" htmlFor="mood-input">
                  How are you feeling right now?
                </label>
                <textarea id="mood-input" value={text} onChange={e => setText(e.target.value)}
                  className="w-full bg-[#f2f4f6] border-none rounded-xl p-6 text-xl text-[#191c1e] placeholder:text-[#767586] focus:outline-none focus:ring-2 focus:ring-[#4648d4]/20 transition-all resize-none"
                  placeholder="Describe your current state of mind..." rows={4} />
                <div className="mt-8 flex justify-center">
                  <button onClick={handleSubmit} disabled={loading || !text.trim()}
                    className="bg-linear-to-r from-[#4648d4] to-[#6063ee] text-white px-12 py-4 rounded-xl font-bold text-lg hover:shadow-[0_8px_24px_rgba(70,72,212,0.2)] transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3">
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Analysing...
                      </>
                    ) : 'Submit Reflection'}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-6">
            <div className="space-y-6">
              {/* Weekly harmony — real data */}
              <h2 className="font-headline text-2xl font-bold text-[#2f2ebe] px-2">Weekly Harmony</h2>
              <div className="bg-white rounded-2xl p-8 shadow-[0_8px_24px_rgba(70,72,212,0.06)]">
                {history.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="material-symbols-outlined text-5xl text-[#c7c4d7] mb-4 block">insert_chart</span>
                    <p className="text-[#464554] font-medium">No reflections yet</p>
                    <p className="text-[#767586] text-sm mt-1">Submit your first reflection to see your weekly harmony.</p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-3xl">{EMOTION_EMOJI[weeklyInsight.topEmotion] || '🌊'}</span>
                      <div>
                        <p className="text-sm text-[#464554] font-medium uppercase tracking-wider">Most frequent this week</p>
                        <h3 className="text-2xl font-headline font-bold text-[#191c1e] capitalize">{weeklyInsight.topEmotion || 'Mixed'}</h3>
                      </div>
                      <div className="ml-auto text-right">
                        <p className="text-3xl font-bold text-[#4648d4]">{weeklyInsight.streak}</p>
                        <p className="text-xs text-[#464554]">reflections</p>
                      </div>
                    </div>
                    {/* mini bar chart of recent emotions */}
                    <div className="space-y-2">
                      {history.slice(0, 4).map((entry, i) => {
                        const col = EMOTION_COLOR[entry.primary_emotion] || EMOTION_COLOR.neutral;
                        return (
                          <div key={i} className="flex items-center gap-3">
                            <span className="text-lg w-7">{EMOTION_EMOJI[entry.primary_emotion] || '🌊'}</span>
                            <div className="grow h-2 rounded-full bg-[#f2f4f6] overflow-hidden">
                              <div className="h-full rounded-full transition-all" style={{
                                width: `${100 - i * 20}%`,
                                background: col.text
                              }} />
                            </div>
                            <span className="text-xs text-[#767586] w-16 text-right capitalize">{entry.primary_emotion}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-[0_4px_12px_rgba(70,72,212,0.04)]">
                  <div className="w-12 h-12 flex items-center justify-center rounded-lg mb-4 bg-[#e1e0ff]">
                    <span className="material-symbols-outlined text-[#4648d4]">monitor_heart</span>
                  </div>
                  <h4 className="font-bold text-[#191c1e] mb-1">Pulse Check</h4>
                  <p className="text-sm text-[#464554]">
                    {weeklyInsight.topEmotion
                      ? <span className="capitalize">{weeklyInsight.topEmotion === 'joy' ? 'Feeling great' : weeklyInsight.topEmotion === 'neutral' ? 'Calm & Centred' : `Mostly ${weeklyInsight.topEmotion}`}</span>
                      : 'No data yet'}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-[0_4px_12px_rgba(70,72,212,0.04)]">
                  <div className="w-12 h-12 flex items-center justify-center rounded-lg mb-4 bg-[#e1e0ff]">
                    <span className="material-symbols-outlined text-[#575992]">history</span>
                  </div>
                  <h4 className="font-bold text-[#191c1e] mb-1">Sessions</h4>
                  <p className="text-sm text-[#464554]">{weeklyInsight.streak} reflection{weeklyInsight.streak !== 1 ? 's' : ''} logged</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="font-headline text-2xl font-bold text-[#2f2ebe] px-2">Recommended for You</h2>

              {/* Meditation card — real link, rotates by time of day */}
              <div className="bg-white p-6 rounded-2xl shadow-[0_8px_24px_rgba(70,72,212,0.06)] border border-[#c7c4d7]/15">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: meditation.bg, color: meditation.color }}>
                    <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>{meditation.icon}</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-tighter" style={{ color: meditation.color }}>{meditation.duration} Session</p>
                    <h4 className="font-headline font-bold text-lg">{meditation.label}</h4>
                  </div>
                </div>
                <a href={meditation.url} target="_blank" rel="noopener noreferrer"
                  className="w-full py-3 bg-linear-to-r from-[#4648d4] to-[#6063ee] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all active:scale-95">
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                  Start Session
                </a>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-[0_8px_24px_rgba(70,72,212,0.06)] border border-[#c7c4d7]/15">
                <h3 className="font-headline font-bold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  {[
                    { icon: 'crisis_alert', label: 'Crisis Support', href: '/crisis' },
                    { icon: 'history', label: 'View History', href: '/history' },
                  ].map(({ icon, label, href }) => (
                    <button key={label} onClick={() => router.push(href)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#f2f4f6] hover:bg-[#e6e8ea] transition-colors text-left">
                      <span className="material-symbols-outlined text-[#4648d4]">{icon}</span>
                      <span className="font-medium text-[#191c1e]">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
