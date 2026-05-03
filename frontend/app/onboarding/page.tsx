'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { savePreferences } from '@/lib/api';

const STEPS = [
  {
    question: "First, tell us a little about yourself.",
    hint: "This helps us personalise your experience.",
    field: "demographics",
    type: "demographics",
  },
  {
    question: "What kind of content helps you most when stressed?",
    hint: "Select all that apply.",
    field: "preferred_content",
    type: "multi",
    options: [
      { icon: 'music_note', label: 'music', display: 'Music' },
      { icon: 'smart_display', label: 'video', display: 'Videos' },
      { icon: 'menu_book', label: 'book', display: 'Books' },
      { icon: 'self_improvement', label: 'activity', display: 'Activities' },
    ]
  },
  {
    question: "What music genres do you enjoy?",
    hint: "Select all that apply.",
    field: "music_genres",
    type: "multi",
    options: [
      { icon: 'piano', label: 'lofi', display: 'Lo-Fi' },
      { icon: 'queue_music', label: 'classical', display: 'Classical' },
      { icon: 'music_note', label: 'jazz', display: 'Jazz' },
      { icon: 'headphones', label: 'ambient', display: 'Ambient' },
      { icon: 'electric_bolt', label: 'pop', display: 'Pop' },
      { icon: 'graphic_eq', label: 'rock', display: 'Rock' },
    ]
  },
  {
    question: "What video topics interest you?",
    hint: "Select all that apply.",
    field: "video_topics",
    type: "multi",
    options: [
      { icon: 'spa', label: 'meditation', display: 'Meditation' },
      { icon: 'forest', label: 'nature', display: 'Nature' },
      { icon: 'sentiment_very_satisfied', label: 'comedy', display: 'Comedy' },
      { icon: 'fitness_center', label: 'fitness', display: 'Fitness' },
      { icon: 'psychology', label: 'motivation', display: 'Motivation' },
      { icon: 'travel_explore', label: 'travel', display: 'Travel' },
    ]
  },
  {
    question: "Anything you'd prefer to avoid?",
    hint: "We'll filter these out of your recommendations.",
    field: "avoid_topics",
    type: "multi",
    options: [
      { icon: 'sports_esports', label: 'gaming', display: 'Gaming' },
      { icon: 'newspaper', label: 'news', display: 'News' },
      { icon: 'warning', label: 'horror', display: 'Horror' },
      { icon: 'local_bar', label: 'nightlife', display: 'Nightlife' },
    ]
  },
  {
    question: "How much time do you usually have?",
    hint: "Helps us suggest short or longer sessions.",
    field: "intervention_horizon",
    type: "single",
    options: [
      { icon: 'timer', label: 'short_term', display: 'Just a few minutes' },
      { icon: 'schedule', label: 'long_term', display: 'I have time to unwind' },
      { icon: 'all_inclusive', label: 'both', display: 'Either works for me' },
    ]
  },
];

const AGE_GROUPS = ['Under 18', '18–24', '25–34', '35–44', '45–54', '55+'];
const GENDERS = [
  { icon: 'man', label: 'male', display: 'Male' },
  { icon: 'woman', label: 'female', display: 'Female' },
  { icon: 'transgender', label: 'non-binary', display: 'Non-binary' },
  { icon: 'person', label: 'prefer_not', display: 'Prefer not to say' },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [ageGroup, setAgeGroup] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const current = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;
  const selected: string[] = answers[current.field] || [];

  const toggle = (label: string) => {
    const cur: string[] = answers[current.field] || [];
    if (current.type === 'single') {
      setAnswers({ ...answers, [current.field]: [label] });
    } else {
      setAnswers({
        ...answers,
        [current.field]: cur.includes(label) ? cur.filter(l => l !== label) : [...cur, label],
      });
    }
  };

  const canProceed = () => {
    if (current.type === 'demographics') return ageGroup !== '' && gender !== '';
    return true; // all other steps are optional
  };

  const next = async () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      setLoading(true);
      const userId = localStorage.getItem('user_id') || '';
      console.log("userId:", userId);
      await savePreferences(userId, {
        music_genres: answers.music_genres || [],
        video_topics: answers.video_topics || [],
        avoid_topics: answers.avoid_topics || [],
        preferred_content: answers.preferred_content || [],
        intervention_horizon: (answers.intervention_horizon || ['short_term'])[0],
        age_group: ageGroup,
        gender: gender,
        content_language: 'english',
        energy_preference: 'any',
      });
      router.push('/dashboard');
    }
  };

  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen flex flex-col">
      <div className="fixed top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-[#4648d4]/5 blur-[120px] rounded-full -z-10" />
      <div className="fixed bottom-[-10%] left-[-5%] w-[30vw] h-[30vw] bg-[#904900]/5 blur-[100px] rounded-full -z-10" />

      <nav className="sticky top-0 z-50 shadow-[0_8px_24px_rgba(70,72,212,0.06)] glass-nav flex justify-between items-center w-full px-12 py-4" style={{ background: 'rgba(247,249,251,0.7)' }}>
        <div className="text-2xl font-bold tracking-tighter text-[#2f2ebe] font-headline">EARS</div>
        <div className="hidden md:flex gap-8 items-center">
          <span className="font-headline tracking-tight text-[#191c1e] opacity-70">Step {step + 1} of {STEPS.length}</span>
          <button onClick={() => router.push('/')} className="text-[#191c1e] opacity-70 hover:opacity-100 transition-opacity font-headline tracking-tight">Logout</button>
        </div>
      </nav>

      <div className="w-full max-w-4xl mx-auto px-6 mt-12">
        <div className="h-2 w-full bg-[#e6e8ea] rounded-full overflow-hidden">
          <div className="h-full bg-linear-to-r from-[#4648d4] to-[#6063ee] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between mt-3">
          <span className="text-[#464554] text-sm font-medium">Question {step + 1}</span>
          <span className="text-[#464554] text-sm font-medium">{Math.round(progress)}% Complete</span>
        </div>
      </div>

      <main className="grow flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-5xl">
          <header className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#2f2ebe] tracking-tight mb-4 max-w-3xl mx-auto font-headline">
              {current.question}
            </h1>
            <p className="text-[#464554] text-lg">{current.hint}</p>
          </header>

          {/* Demographics step */}
          {current.type === 'demographics' && (
            <div className="space-y-10 max-w-2xl mx-auto">
              {/* Age group */}
              <div>
                <p className="font-semibold text-[#191c1e] mb-4 text-center">Age group</p>
                <div className="grid grid-cols-3 gap-3">
                  {AGE_GROUPS.map(ag => (
                    <button key={ag} onClick={() => setAgeGroup(ag)}
                      className={`py-3 px-4 rounded-xl font-medium text-sm transition-all border-2 ${
                        ageGroup === ag
                          ? 'bg-[#4648d4] border-[#4648d4] text-white shadow-lg shadow-[#4648d4]/20'
                          : 'bg-white border-transparent text-[#191c1e] hover:border-[#4648d4]/20 shadow-[0_2px_8px_rgba(70,72,212,0.06)]'
                      }`}>
                      {ag}
                    </button>
                  ))}
                </div>
              </div>
              {/* Gender */}
              <div>
                <p className="font-semibold text-[#191c1e] mb-4 text-center">Gender</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {GENDERS.map(({ icon, label, display }) => (
                    <button key={label} onClick={() => setGender(label)}
                      className={`group flex flex-col items-center p-5 rounded-2xl transition-all border-2 ${
                        gender === label
                          ? 'bg-[#4648d4] border-[#4648d4] text-white scale-[1.02]'
                          : 'bg-white border-transparent hover:border-[#4648d4]/20 shadow-[0_4px_12px_rgba(70,72,212,0.06)]'
                      }`}>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${
                        gender === label ? 'bg-white/20' : 'bg-[#e1e0ff]'
                      }`}>
                        <span className="material-symbols-outlined text-2xl">{icon}</span>
                      </div>
                      <span className="font-semibold text-sm">{display}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Regular multi/single select steps */}
          {current.type !== 'demographics' && (
            <div className={`grid gap-5 items-stretch ${
              (current.options?.length || 0) <= 4
                ? 'grid-cols-2 md:grid-cols-4'
                : 'grid-cols-2 md:grid-cols-3'
            }`}>
              {current.options?.map(({ icon, label, display }: any) => {
                const isSelected = selected.includes(label);
                return (
                  <button key={label} onClick={() => toggle(label)}
                    className={`group relative flex flex-col items-center p-7 rounded-2xl transition-all duration-200 border-2 ${
                      isSelected
                        ? 'bg-[#4648d4] border-[#4648d4] text-white scale-[1.02] shadow-lg shadow-[#4648d4]/20'
                        : 'bg-white border-transparent hover:border-[#4648d4]/20 hover:scale-[1.01] shadow-[0_8px_24px_rgba(70,72,212,0.06)]'
                    }`}>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-5 transition-colors duration-200 ${
                      isSelected ? 'bg-white/20' : 'bg-[#e1e0ff] group-hover:bg-[#4648d4] group-hover:text-white'
                    }`}>
                      <span className="material-symbols-outlined text-3xl">{icon}</span>
                    </div>
                    <span className="font-bold text-sm">{display}</span>
                    {isSelected && (
                      <span className="absolute top-3 right-3 w-5 h-5 bg-white/30 rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <footer className="w-full bg-[#f7f9fb] border-t border-[#c7c4d7]/15 mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center px-12 py-8 w-full max-w-7xl mx-auto">
          <p className="text-[#191c1e]/60 text-sm tracking-wide order-2 md:order-1 mt-6 md:mt-0">© 2026 Emotion Aware Recommendation System</p>
          <div className="order-1 md:order-2 flex gap-6 items-center">
            <button onClick={() => router.push('/dashboard')}
              className="text-[#464554] hover:text-[#4648d4] transition-colors font-medium text-sm">
              Skip for now
            </button>
            {step > 0 && (
              <button onClick={() => setStep(step - 1)}
                className="px-6 py-3 rounded-xl border-2 border-[#4648d4]/20 text-[#4648d4] font-bold hover:bg-[#e1e0ff] transition-colors">
                Back
              </button>
            )}
            <button onClick={next}
              disabled={loading || (current.type === 'demographics' && !canProceed())}
              className="bg-linear-to-r from-[#4648d4] to-[#6063ee] text-white px-10 py-3.5 rounded-xl font-bold text-lg hover:shadow-[0_8px_24px_rgba(70,72,212,0.25)] transition-all active:scale-95 disabled:opacity-50">
              {loading ? 'Saving...' : step === STEPS.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
