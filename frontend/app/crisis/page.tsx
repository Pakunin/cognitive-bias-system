'use client';
import Link from 'next/link';

const hotlines = [
  { bg: '#e1e0ff', color: '#4648d4', badge: 'Crisis Hotline', badgeColor: '#4648d4', name: 'iCall', hours: 'Mon-Sat, 8am-10pm', hoursIcon: 'schedule', phone: '9152987821', displayPhone: '9152987821' },
  { bg: '#e1e0ff', color: '#575992', badge: 'Emotional Support', badgeColor: '#575992', name: 'Vandrevala Foundation', hours: 'Available 24/7', hoursIcon: 'history', phone: '9999666555', displayPhone: '9999-666-555' },
  { bg: '#ffdcc5', color: '#904900', badge: 'Suicide Prevention', badgeColor: '#904900', name: 'AASRA', hours: 'Available 24/7', hoursIcon: 'verified', phone: '27546667', displayPhone: '022-27546667' },
];

export default function CrisisPage() {
  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] selection:bg-[#e1e0ff] selection:text-[#07006c]">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#4648d4]/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#904900]/5 blur-[120px]" />
      </div>
      <div className="relative min-h-screen flex flex-col items-center justify-center p-6 md:p-12 lg:p-24 z-10">
        <header className="w-full max-w-4xl text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 mb-8 bg-[#ffdcc5] rounded-full">
            <span className="material-symbols-outlined text-[#703700] text-3xl">favorite</span>
          </div>
          <h1 className="font-headline font-bold text-4xl md:text-5xl lg:text-6xl text-[#2f2ebe] tracking-tighter leading-tight mb-6">
            It sounds like you&apos;re going through something difficult.
          </h1>
          <p className="font-headline text-xl md:text-2xl text-[#464554] font-medium leading-relaxed max-w-2xl mx-auto">
            You don&apos;t have to face this alone. These organizations are here to support you right now.
          </p>
        </header>

        <main className="w-full max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {hotlines.map(({ bg, color, badge, badgeColor, name, hours, hoursIcon, phone, displayPhone }) => (
              <article key={name} className="bg-white rounded-2xl p-8 shadow-[0_8px_24px_rgba(70,72,212,0.06)] flex flex-col justify-between transition-all hover:-translate-y-1">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: bg }}>
                      <span className="material-symbols-outlined" style={{ color }}>support_agent</span>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: badgeColor }}>{badge}</span>
                  </div>
                  <h2 className="font-headline text-2xl font-bold text-[#191c1e] mb-2">{name}</h2>
                  <p className="text-[#464554] mb-6 text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">{hoursIcon}</span>
                    {hours}
                  </p>
                  <div className="text-3xl font-headline font-extrabold text-[#2f2ebe] mb-8 tracking-tighter">{displayPhone}</div>
                </div>
                <a href={`tel:${phone}`} className="w-full flex items-center justify-center gap-2 bg-linear-to-br from-[#4648d4] to-[#6063ee] text-white py-4 rounded-xl font-bold transition-all hover:shadow-lg active:scale-95">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>call</span>
                  Call Now
                </a>
              </article>
            ))}
          </div>

          <div className="flex flex-col items-center gap-8">
            <div className="bg-[#ffdcc5]/30 border border-[#ffdcc5] rounded-xl p-6 max-w-2xl text-center">
              <p className="text-[#703700] font-medium text-sm leading-relaxed">
                If you are in immediate physical danger, please contact your local emergency services (112 or 100) immediately.
              </p>
            </div>
            <Link href="/dashboard" className="text-[#464554] font-medium border-b border-transparent hover:border-[#464554] hover:text-[#191c1e] transition-all pb-1 text-sm">
              I&apos;m okay, continue
            </Link>
          </div>
        </main>

        <footer className="mt-24 w-full max-w-4xl border-t border-[#c7c4d7]/15 pt-12 flex flex-col md:flex-row justify-between items-center gap-4 text-xs tracking-wide text-[#464554]/60">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#2f2ebe]">EARS</span>
            <span>© 2026 Emotion Aware Recommendation System</span>
          </div>
          <div className="flex gap-6">
            {['Privacy', 'Terms', 'Help'].map(l => (
              <Link key={l} href="#" className="hover:text-[#4648d4] transition-colors">{l}</Link>
            ))}
          </div>
        </footer>
      </div>

      <div className="fixed bottom-12 right-12 z-50 pointer-events-none opacity-20 hidden lg:block">
        <div className="w-64 h-64 rounded-full border border-[#4648d4]/20 flex items-center justify-center animate-pulse">
          <div className="w-48 h-48 rounded-full border border-[#4648d4]/10" />
        </div>
      </div>
    </div>
  );
}
