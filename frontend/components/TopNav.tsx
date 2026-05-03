'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface TopNavProps {
  activeLink?: 'dashboard' | 'history';
}

export default function TopNav({ activeLink }: TopNavProps) {
  const router = useRouter();
  return (
    <nav className="sticky top-0 z-50 shadow-[0_8px_24px_rgba(70,72,212,0.06)] glass-nav" style={{ background: 'rgba(247,249,251,0.7)' }}>
      <div className="flex justify-between items-center w-full px-12 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-bold tracking-tighter text-[#2f2ebe] font-headline">EARS</Link>
          <div className="hidden md:flex gap-6 items-center font-headline tracking-tight">
            <Link href="/dashboard" className={activeLink === 'dashboard' ? 'text-[#4648d4] font-bold border-b-2 border-[#4648d4] pb-1' : 'text-[#191c1e] opacity-70 hover:opacity-100 transition-opacity'}>Dashboard</Link>
            <Link href="/history" className={activeLink === 'history' ? 'text-[#4648d4] font-bold border-b-2 border-[#4648d4] pb-1' : 'text-[#191c1e] opacity-70 hover:opacity-100 transition-opacity'}>History</Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/')} className="px-4 py-2 text-sm font-medium text-[#191c1e] opacity-70 hover:opacity-100 transition-opacity">Logout</button>
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#e1e0ff]">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjo-9oJXQRnOPm3EeqtkMTAI2GtB5GqpQeYrTUkhjfeMYYJiZrIP1FhnxGqOvFrplllvQVUE17DnmWdQb5Jp6cEPuV76YgDGpjdBU4DTa9TIX7aaYTDPYD6TVSl96kAyPSAemFSweqGPs5sTIYxqGiZ55oG-RWbmKzaenxRvB9VgMcH3OhlD8uLfgpvU36s1j55MOVBwZC72PhLBa2ZFyXjMWxtJdozJVdqeR_FuDQFHHaljhUKzLKKQm_swvcwcQmxpmqILe5bH8K" alt="User" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </nav>
  );
}
