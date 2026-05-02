'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TopNav from '@/components/TopNav';
import { submitFeedback } from '@/lib/api';

interface Recommendation {
  id: string;
  title: string;
  type: string;
  description: string;
  url: string;
  thumbnail?: string;
  channel?: string;
  owner?: string;
  duration?: string;
  similarity_score?: number;
}

interface AnalysisResult {
  safe_to_proceed: boolean;
  primary_emotion: string;
  confidence: number;
  secondary_emotions: string[];
  valence: string;
  energy_level: string;
  intervention_type: string;
  recommendations: Recommendation[];
}

const EMOTION_EMOJI: Record<string, string> = {
  sadness: '😢', anger: '😠', fear: '😨',
  joy: '😊', disgust: '🤢', surprise: '😲', neutral: '😐'
};

export default function ResultsPage() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [feedbackScore, setFeedbackScore] = useState<number | null>(null);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('analysis_result');
    if (stored) setResult(JSON.parse(stored));
  }, []);

  const handleFeedback = async (score: number) => {
    if (!result) return;
    setFeedbackScore(score);
    const userId = localStorage.getItem('user_id') || '';
    await submitFeedback(
      userId, score,
      result.recommendations,
      result.primary_emotion,
      result.intervention_type
    );
    setFeedbackSent(true);
  };

  if (!result) return (
    <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center">
      <p className="text-[#464554]">Loading your results...</p>
    </div>
  );

  const videos = result.recommendations.filter(r => r.type === 'video');
  const music = result.recommendations.filter(r => r.type === 'music');
  const other = result.recommendations.filter(
    r => r.type !== 'video' && r.type !== 'music'
  );

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] flex flex-col">
      <TopNav activeLink="dashboard" />
      <main className="grow max-w-7xl mx-auto w-full px-6 md:px-12 py-12">

        {/* Emotion result card — same design, real data */}
        <section className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-[#2f2ebe] tracking-tight mb-4 font-headline">
                Your Sanctuary Insight
              </h1>
              <p className="text-[#464554] max-w-2xl leading-relaxed">
                We've analyzed your current state. Here's a curated selection designed to support you.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-[0_8px_24px_rgba(70,72,212,0.06)] border border-[#c7c4d7]/15 flex flex-col gap-3 min-w-70">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#464554] uppercase tracking-wider">Analysis Result</span>
                <span className="text-xs font-bold text-[#4648d4] px-2 py-1 bg-[#e1e0ff] rounded-full">
                  {Math.round(result.confidence * 100)}% confidence
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{EMOTION_EMOJI[result.primary_emotion] || '🌊'}</span>
                <span className="text-xl font-bold text-[#191c1e] capitalize">
                  Feeling: {result.primary_emotion}
                </span>
              </div>
              <div className="flex gap-2 mt-1 flex-wrap">
                <span className="px-3 py-1 bg-[#f2f4f6] text-xs font-semibold rounded-full border border-[#c7c4d7]/10 text-[#191c1e] capitalize">
                  Valence: {result.valence}
                </span>
                <span className="px-3 py-1 bg-[#f2f4f6] text-xs font-semibold rounded-full border border-[#c7c4d7]/10 text-[#191c1e] capitalize">
                  Energy: {result.energy_level}
                </span>
              </div>
              {result.secondary_emotions.length > 0 && (
                <p className="text-xs text-[#767586]">
                  Also detected: {result.secondary_emotions.join(', ')}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Recommendations grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Videos */}
          {videos.length > 0 && (
            <div className="space-y-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <span className="material-symbols-outlined text-red-500">video_library</span>
                </div>
                <h2 className="text-2xl font-bold text-[#2f2ebe] font-headline">Visual Calms</h2>
              </div>
              {videos.map((rec) => (
                <div key={rec.id} className="bg-white rounded-2xl overflow-hidden shadow-[0_8px_24px_rgba(70,72,212,0.06)] transition-transform hover:scale-[1.01]">
                  {rec.thumbnail && (
                    <div className="aspect-video w-full bg-[#e6e8ea] relative">
                      <img src={rec.thumbnail} alt={rec.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="font-bold text-lg mb-1 leading-snug">{rec.title}</h3>
                    {rec.channel && <p className="text-[#464554] text-sm mb-2">{rec.channel}</p>}
                    {rec.description && <p className="text-[#464554] text-sm mb-4 line-clamp-2">{rec.description}</p>}
                    {rec.url && (
                      <a href={rec.url} target="_blank" rel="noopener noreferrer"
                        className="w-full py-3 bg-linear-to-br from-[#4648d4] to-[#6063ee] text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#4648d4]/20 hover:shadow-[#4648d4]/40 transition-all active:scale-95">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                        Watch Now
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Music */}
          {music.length > 0 && (
            <div className="space-y-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[#1DB954]/10 rounded-lg">
                  <span className="material-symbols-outlined text-[#1DB954]">library_music</span>
                </div>
                <h2 className="text-2xl font-bold text-[#2f2ebe] font-headline">Auditory Healing</h2>
              </div>
              {music.map((rec) => (
                <div key={rec.id} className="bg-white rounded-2xl p-6 shadow-[0_8px_24px_rgba(70,72,212,0.06)] flex gap-6 items-center border border-[#c7c4d7]/15 transition-transform hover:scale-[1.01]">
                  {rec.thumbnail && (
                    <div className="w-32 h-32 shrink-0 rounded-lg overflow-hidden shadow-md">
                      <img src={rec.thumbnail} alt={rec.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="grow">
                    <h3 className="font-bold text-xl mb-2">{rec.title}</h3>
                    {rec.owner && <p className="text-[#464554] text-xs mb-1">by {rec.owner}</p>}
                    {rec.description && <p className="text-[#464554] text-sm mb-4 line-clamp-2">{rec.description}</p>}
                    {rec.url && (
                      <a href={rec.url} target="_blank" rel="noopener noreferrer"
                        className="px-6 py-2 bg-[#f2f4f6] text-[#4648d4] font-bold rounded-full border border-[#4648d4]/20 hover:bg-[#e1e0ff] transition-colors flex items-center gap-2 active:scale-95 w-fit">
                        <span className="material-symbols-outlined text-base">headphones</span>
                        Listen
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Other recommendations (activities, books) */}
        {other.length > 0 && (
          <div className="mt-12 space-y-4">
            <h2 className="text-2xl font-bold text-[#2f2ebe] font-headline">Other Suggestions</h2>
            {other.map(rec => (
              <div key={rec.id} className="bg-white p-6 rounded-2xl shadow-[0_4px_12px_rgba(70,72,212,0.04)] flex items-center gap-4">
                <span className="material-symbols-outlined text-[#4648d4]">self_improvement</span>
                <div>
                  <h3 className="font-bold">{rec.title}</h3>
                  <p className="text-sm text-[#464554]">{rec.description}</p>
                </div>
                {rec.url && (
                  <a href={rec.url} target="_blank" rel="noopener noreferrer"
                    className="ml-auto px-4 py-2 text-sm font-bold text-[#4648d4] bg-[#e1e0ff] rounded-xl hover:bg-[#4648d4] hover:text-white transition-colors whitespace-nowrap">
                    Open
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Feedback section */}
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-[0_8px_24px_rgba(70,72,212,0.06)] text-center">
          {feedbackSent ? (
            <div>
              <span className="text-3xl mb-2 block">🙏</span>
              <p className="font-bold text-lg text-[#2f2ebe]">Thank you for your feedback!</p>
              <p className="text-[#464554] text-sm mt-1">We'll use this to improve your recommendations.</p>
              <button onClick={() => router.push('/dashboard')}
                className="mt-6 px-8 py-3 bg-linear-to-r from-[#4648d4] to-[#6063ee] text-white rounded-xl font-bold hover:shadow-lg transition-all">
                New Reflection
              </button>
            </div>
          ) : (
            <div>
              <p className="font-bold text-lg text-[#191c1e] mb-2">Did these recommendations help?</p>
              <p className="text-[#464554] text-sm mb-6">Your rating helps us learn what works for you.</p>
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5].map(score => (
                  <button key={score}
                    onClick={() => handleFeedback(score)}
                    className={`w-12 h-12 rounded-xl font-bold text-lg transition-all hover:scale-110 active:scale-95
                      ${feedbackScore === score
                        ? 'bg-[#4648d4] text-white shadow-lg shadow-[#4648d4]/20'
                        : 'bg-[#f2f4f6] text-[#191c1e] hover:bg-[#e1e0ff] hover:text-[#4648d4]'
                      }`}>
                    {score}
                  </button>
                ))}
              </div>
              <button onClick={() => router.push('/dashboard')}
                className="mt-6 text-sm text-[#464554] hover:text-[#191c1e] underline underline-offset-2">
                Skip for now
              </button>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}