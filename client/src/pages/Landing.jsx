import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Sparkles } from 'lucide-react';

export default function Landing() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(query ? `/jobs?search=${encodeURIComponent(query)}` : '/jobs');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* Hero */}
      <section className="flex-1 flex items-center relative overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,.015)_1px,transparent_1px)] bg-[size:72px_72px]" />
        {/* Soft radial glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-blue-50/80 via-blue-50/20 to-transparent rounded-full blur-3xl" />

        <div className="relative max-w-2xl mx-auto px-6 py-28 md:py-36 w-full">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-medium tracking-wide mb-8">
              <Sparkles className="w-3 h-3" />
              AI-POWERED MATCHING
            </div>

            <h1 className="text-[2.75rem] md:text-[3.5rem] font-extrabold text-gray-950 tracking-tight leading-[1.08]">
              Find the role that
              <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                fits your skills
              </span>
            </h1>

            <p className="mt-5 text-[17px] text-gray-400 max-w-md mx-auto leading-relaxed font-normal">
              Your profile scored against every open position.
              See exactly where you match and where you don't.
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} className="mt-10 max-w-md mx-auto">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center bg-white border border-gray-200 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] group-focus-within:border-blue-300 group-focus-within:shadow-[0_2px_16px_rgba(59,130,246,0.08)] transition-all duration-300">
                  <Search className="ml-4 w-[18px] h-[18px] text-gray-300 shrink-0" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Role, skill, or company..."
                    className="flex-1 pl-3 pr-2 py-3.5 bg-transparent text-[15px] text-gray-900 placeholder-gray-300 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="mr-1.5 px-4 py-2 bg-gray-900 text-white text-[13px] font-medium rounded-xl hover:bg-gray-800 active:scale-[0.97] transition-all shrink-0"
                  >
                    Search
                  </button>
                </div>
              </div>
            </form>

            {/* Links */}
            <div className="mt-8 flex items-center justify-center gap-8 text-[13px] text-gray-400 font-medium">
              <Link to="/register" className="group flex items-center gap-1 hover:text-gray-600 transition-colors">
                Create account
                <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <span className="w-px h-3.5 bg-gray-200" />
              <Link to="/login" className="group flex items-center gap-1 hover:text-gray-600 transition-colors">
                Sign in
                <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-gray-100/80 bg-gray-50/50">
        <div className="max-w-3xl mx-auto px-6 py-20">
          <p className="text-center text-[11px] font-semibold tracking-[0.15em] text-gray-300 uppercase mb-14">
            How it works
          </p>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              { step: '01', title: 'Create profile', desc: 'Add your skills and experience. Takes about two minutes.' },
              { step: '02', title: 'Get matched', desc: 'Every listing scored against your profile with skill gap analysis.' },
              { step: '03', title: 'Apply with AI', desc: 'One-click cover letter generation tailored to each position.' },
            ].map((item) => (
              <div
                key={item.step}
                className="group relative bg-white rounded-2xl p-7 border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.05)] hover:border-gray-200 transition-all duration-300"
              >
                <span className="text-[11px] font-bold tracking-widest text-gray-200 group-hover:text-blue-400 transition-colors duration-300">
                  {item.step}
                </span>
                <h3 className="mt-4 text-[15px] font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-[13px] text-gray-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100/80 py-7">
        <p className="text-center text-[12px] text-gray-300 tracking-wide">
          AI Job Board &mdash; Capstone Project by Naga Manohar Sharma Sankaramanchi
        </p>
      </footer>
    </div>
  );
}
