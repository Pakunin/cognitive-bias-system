"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signup, login } from "@/lib/api";

export default function LoginPage() {
  const [view, setView] = useState<"login" | "signup">("login");
  // const [name, setName] = useState("");
  // const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<"terms" | "privacy" | null>(null);
  const router = useRouter();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await login(username, password);
      if (data.error) {
        setError(data.error);
        return;
      }
      localStorage.setItem("user_id", data.user_id);
      localStorage.setItem("user_name", data.name || username);
      router.push("/dashboard");
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await signup(username, password);
      if (data.error) {
        setError(data.error);
        return;
      }
      localStorage.setItem("user_id", data.user_id);
      localStorage.setItem("user_name", username);
      router.push("/onboarding");
    } catch {
      setError("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="bg-sanctuary-gradient min-h-screen flex flex-col selection:bg-[#e1e0ff] selection:text-[#07006c]">

      {/* Modal overlay */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-8 pb-4 border-b border-[#c7c4d7]/20">
              <h2 className="text-2xl font-bold text-[#2f2ebe] font-headline">
                {modal === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
              </h2>
              <button onClick={() => setModal(null)} className="w-9 h-9 flex items-center justify-center rounded-full bg-[#f2f4f6] hover:bg-[#e6e8ea] transition-colors">
                <span className="material-symbols-outlined text-[#464554]">close</span>
              </button>
            </div>
            <div className="overflow-y-auto p-8 space-y-4 text-[#464554] text-sm leading-relaxed">
              {modal === 'terms' ? (
                <>
                  <p className="font-semibold text-[#191c1e]">Last updated: 2026</p>
                  <p>EARS is an academic project designed to help users explore emotional well-being through multi-agent media recommendations.</p>
                  <h3 className="font-bold text-[#191c1e] text-base mt-4">1. Not a Medical Service</h3>
                  <p>EARS does not provide diagnosis, treatment, or professional mental health advice. All recommendations are for informational and general wellness purposes only. If you are in crisis, please contact a qualified professional.</p>
                  <h3 className="font-bold text-[#191c1e] text-base mt-4">2. No Professional Substitute</h3>
                  <p>This tool is a supportive companion, not a replacement for professional mental health care. Recommendations may not always be perfectly suited to your situation.</p>
                  <h3 className="font-bold text-[#191c1e] text-base mt-4">3. Academic Use</h3>
                  <p>This project is developed for academic purposes. It is not a commercial product and does not charge for services or collect revenue of any kind.</p>
                  <h3 className="font-bold text-[#191c1e] text-base mt-4">4. User Responsibility</h3>
                  <p>You are free to ignore any recommendation that does not feel appropriate. Always trust your own judgment and seek professional help when needed.</p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-[#191c1e]">Last updated: 2026</p>
                  <div className="bg-[#e1e0ff] rounded-xl p-4 flex gap-3 items-start">
                    <span className="material-symbols-outlined text-[#4648d4] shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
                    <p className="text-[#2f2ebe] font-semibold">EARS does not collect, store, or share any personally identifiable information.</p>
                  </div>
                  <h3 className="font-bold text-[#191c1e] text-base mt-4">What we store</h3>
                  <p>Only a randomly generated session ID, your stated content preferences (music genres, video topics) and anonymised emotion logs. None of this is linked to your real identity in any way.</p>
                  <h3 className="font-bold text-[#191c1e] text-base mt-4">What we do NOT store</h3>
                  <p>We do not store your name, email address, location, device identifiers, IP address, or any other personally identifiable data. Your username exists only in your browser's local storage and is never transmitted to our servers.</p>
                  <h3 className="font-bold text-[#191c1e] text-base mt-4">Data location</h3>
                  <p>All session data is stored in a local SQLite database running on the server instance. It is never uploaded to external cloud services or third parties.</p>
                  <h3 className="font-bold text-[#191c1e] text-base mt-4">Third-party links</h3>
                  <p>Recommendations may link to YouTube and Spotify. Clicking those links is governed by Google's and Spotify's own privacy policies. We share no data with these services.</p>
                </>
              )}
            </div>
            <div className="p-8 pt-4 border-t border-[#c7c4d7]/20">
              <button onClick={() => setModal(null)}
                className="w-full py-3 bg-linear-to-r from-[#4648d4] to-[#6063ee] text-white rounded-xl font-bold hover:shadow-lg transition-all active:scale-95">
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex flex-col md:flex-row items-center justify-center min-h-screen p-6 md:p-12 gap-12 max-w-7xl mx-auto w-full">
        {/* Left hero */}
        <div className="hidden md:flex flex-col max-w-md space-y-6">
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[#4648d4] to-[#6063ee] flex items-center justify-center text-white shadow-lg">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
            </div>
            <span className="text-3xl font-headline font-extrabold  text-[#2f2ebe]">EARS</span>
          </div>
          <h1 className="text-5xl font-headline font-bold text-[#191c1e] leading-tight tracking-tight">
            Your journey to <span className="text-[#4648d4]">inner clarity</span> begins here.
          </h1>
          <p className="text-lg text-[#464554] leading-relaxed">
            An emotion-aware agentic system designed to support your well-being with personalised, privacy-first insights.
          </p>
          <div className="flex items-center gap-3 bg-[#e1e0ff]/50 rounded-xl p-4">
            <span className="material-symbols-outlined text-[#4648d4]" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
            <p className="text-sm text-[#464554]">No personal data stored. No tracking. Everything stays private.</p>
          </div>
        </div>

        {/* Auth card */}
        <div className="w-full max-w-md">
          <div className="glass-panel rounded-2xl shadow-[0_8px_24px_rgba(70,72,212,0.06)] p-8 md:p-10 border border-white/20">
            {view === 'login' ? (
              <div>
                <div className="mb-8">
                  <h2 className="text-3xl font-headline font-bold text-[#2f2ebe] mb-2">Welcome Back</h2>
                  <p className="text-[#464554]">Re-enter your sanctuary and continue your path.</p>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-[#191c1e] mb-2 px-1">Username</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#767586]">
                        <span className="material-symbols-outlined text-xl">person</span>
                      </div>
                      <input type="text" placeholder="your_username" value={username}
                        onChange={e => setUsername(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleLogin()}
                        className="w-full bg-[#e0e3e5] border-none rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#4648d4]/20 focus:bg-white transition-all text-[#191c1e] placeholder:text-[#767586]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#191c1e] mb-2 px-1">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#767586]">
                        <span className="material-symbols-outlined text-xl">lock</span>
                      </div>
                      <input type="password" placeholder="••••••••" value={password}
                        onChange={e => setPassword(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleLogin()}
                        className="w-full bg-[#e0e3e5] border-none rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#4648d4]/20 focus:bg-white transition-all text-[#191c1e] placeholder:text-[#767586]" />
                    </div>
                  </div>
                  {error && <p className="text-red-500 text-sm px-1">{error}</p>}
                  <button onClick={handleLogin} disabled={loading}
                    className="w-full bg-linear-to-r from-[#4648d4] to-[#6063ee] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#4648d4]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                    <span>{loading ? 'Logging in...' : 'Login'}</span>
                    {!loading && <span className="material-symbols-outlined text-lg">arrow_forward</span>}
                  </button>
                </div>
                <p className="mt-6 text-center text-[#464554] text-sm">
                  Don&apos;t have an account?{' '}
                  <button onClick={() => { setView('signup'); setError(''); }} className="text-[#4648d4] font-bold hover:underline underline-offset-4">Sign up</button>
                </p>
              </div>
            ) : (
              <div>
                <div className="mb-8">
                  <h2 className="text-3xl font-headline font-bold text-[#2f2ebe] mb-2">Create Account</h2>
                  <p className="text-[#464554]">Start your journey toward emotional intelligence.</p>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-[#191c1e] mb-2 px-1">Username</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#767586]">
                        <span className="material-symbols-outlined text-xl">person</span>
                      </div>
                      <input type="text" placeholder="choose_a_username" value={username}
                        onChange={e => setUsername(e.target.value)}
                        className="w-full bg-[#e0e3e5] border-none rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#4648d4]/20 focus:bg-white transition-all text-[#191c1e] placeholder:text-[#767586]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#191c1e] mb-2 px-1">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#767586]">
                        <span className="material-symbols-outlined text-xl">lock</span>
                      </div>
                      <input type="password" placeholder="min 6 characters" value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full bg-[#e0e3e5] border-none rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#4648d4]/20 focus:bg-white transition-all text-[#191c1e] placeholder:text-[#767586]" />
                    </div>
                  </div>
                  {error && <p className="text-red-500 text-sm px-1">{error}</p>}
                  <button onClick={handleSignup} disabled={loading}
                    className="w-full bg-linear-to-r from-[#4648d4] to-[#6063ee] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#4648d4]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                    <span>{loading ? 'Creating...' : 'Create Account'}</span>
                    {!loading && <span className="material-symbols-outlined text-lg">app_registration</span>}
                  </button>
                </div>
                <p className="mt-6 text-center text-[#464554] text-sm">
                  Already have an account?{' '}
                  <button onClick={() => { setView('login'); setError(''); }} className="text-[#4648d4] font-bold hover:underline underline-offset-4">Login</button>
                </p>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-[#c7c4d7]/15">
              <p className="text-[10px] text-center text-[#464554] leading-relaxed px-4">
                By continuing, you agree to our{' '}
                <button onClick={() => setModal('terms')} className="underline hover:text-[#4648d4] transition-colors">Terms of Service</button>
                {' '}and{' '}
                <button onClick={() => setModal('privacy')} className="underline hover:text-[#4648d4] transition-colors">Privacy Policy</button>.
                {' '}Your emotional data is anonymised and stays private.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full bg-[#f7f9fb] border-t border-[#c7c4d7]/15 mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center px-12 py-8 w-full max-w-7xl mx-auto">
          <p className="text-sm tracking-wide text-[#191c1e]/60 mb-4 md:mb-0">© 2024 EARS Digital Sanctuary</p>
          <div className="flex space-x-8">
            <button onClick={() => setModal('privacy')} className="text-sm tracking-wide text-[#191c1e]/60 hover:text-[#4648d4] transition-colors">Privacy</button>
            <button onClick={() => setModal('terms')} className="text-sm tracking-wide text-[#191c1e]/60 hover:text-[#4648d4] transition-colors">Terms</button>
            <Link href="#" className="text-sm tracking-wide text-[#191c1e]/60 hover:text-[#4648d4] transition-colors">Help</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
