
import React, { useState, useMemo } from 'react';
import { PortfolioData } from '../types';
import ProjectCard from './ProjectCard';
import { Link } from 'react-router-dom';

interface PortfolioViewProps {
  data: PortfolioData;
}

const SectionDivider: React.FC<{ flip?: boolean; accentWidth?: string }> = ({ flip, accentWidth = '20%' }) => (
    <div className={`architectural-divider ${flip ? 'mb-8' : 'mt-8'}`}>
        <div className="line-main"></div>
        <div 
            className={`line-accent-red-thick ${flip ? 'right-0' : 'left-0'}`}
            style={{ width: accentWidth }}
        ></div>
    </div>
);

const PortfolioView: React.FC<PortfolioViewProps> = ({ data }) => {
  const [activeFilter, setActiveFilter] = useState('全部');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const featuredProjects = useMemo(() => {
    return [...data.projects]
      .filter(p => p.isFeatured)
      .sort((a, b) => (a.featuredAt || 0) - (b.featuredAt || 0))
      .slice(0, 3);
  }, [data.projects]);

  const categoriesToShow = useMemo(() => {
    if (activeFilter === '全部') return data.categories.filter(c => c !== '全部');
    return [activeFilter];
  }, [activeFilter, data.categories]);

  const copyEmail = () => {
    navigator.clipboard.writeText(data.profile.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nameParts = data.profile.name.split(' ');
  const firstName = nameParts[0] || 'Cecilia';
  const lastName = nameParts.slice(1).join(' ');

  return (
    <div className="min-h-screen pb-32">
      <nav className="fixed top-0 left-0 w-full z-50 p-6 md:p-10 flex justify-between items-center mix-blend-difference text-white">
        <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center font-mono text-[8px]">{firstName.charAt(0)}</div>
            <div className="font-mono text-[9px] uppercase tracking-[0.3em] hidden md:block">{data.profile.name} — CURATED ARCHIVE</div>
        </div>
        <div className="flex gap-10 items-center">
            <Link to="/admin" className="font-mono text-[9px] uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity">ADMIN PANEL</Link>
            <div className="w-[1px] h-3 bg-white/20"></div>
            <div className="font-mono text-[9px] uppercase tracking-widest opacity-40">VOL. 01 — 2026</div>
        </div>
      </nav>

      <header className="relative min-h-[95vh] flex flex-col pt-32 px-6 md:px-12 mb-8 overflow-hidden">
        <div className="max-w-[1500px] mx-auto w-full z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-12 reveal-up" style={{ animationDelay: '0.2s' }}>
                <div className="space-y-4">
                    <span className="font-mono text-[10px] uppercase tracking-[0.6em] text-stone-400 block mb-2">Portfolio Selection</span>
                    <h1 className="editorial-title font-serif text-stone-900">
                        {firstName} <br/>
                        <span className="italic pl-12 text-[#9e2a2a]">{lastName}</span>
                    </h1>
                </div>
                <p className="font-serif text-2xl md:text-3xl italic text-stone-500 max-w-md leading-snug">“{data.profile.bio}”</p>
                <div className="pt-4">
                    <button 
                        onClick={() => setIsContactModalOpen(true)}
                        className="relative inline-flex items-center gap-10 bg-stone-900 text-white px-14 py-7 rounded-full transition-all shadow-2xl hover:bg-[#9e2a2a] group active:scale-95"
                    >
                        <span className="font-sans text-[10px] font-bold uppercase tracking-[0.4em]">GET IN TOUCH</span>
                        <div className="w-10 h-10 rounded-full bg-[#9e2a2a] flex items-center justify-center group-hover:rotate-45 group-hover:bg-white/20 transition-all duration-700">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </div>
                    </button>
                </div>
            </div>

            <div className="lg:col-span-7 flex items-center justify-center py-8 relative lg:-ml-24 reveal-up" style={{ animationDelay: '0.4s' }}>
                {featuredProjects.length > 0 ? (
                  <div className="relative flex items-center justify-center w-full max-w-4xl">
                      {featuredProjects.map((proj, idx) => {
                          let tiltClass = idx === 0 ? "card-tilted-left" : idx === 2 ? "card-tilted-right" : "card-straight";
                          return (
                              <div key={proj.id} className={`relative group w-[40%] aspect-cover transition-all duration-700 ${tiltClass}`} style={{ margin: idx === 1 ? '0 -50px' : '0' }}>
                                  <a href={proj.link} target="_blank" rel="noopener noreferrer" className="block w-full h-full bg-white rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/5 card-hover">
                                      <img src={proj.imageUrl} alt={proj.title} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-1000" />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                                          <p className="font-heading text-white text-xl uppercase tracking-widest leading-tight">{proj.title}</p>
                                          <p className="text-white/50 text-[10px] uppercase tracking-widest mt-2">{proj.category}</p>
                                      </div>
                                  </a>
                              </div>
                          );
                      })}
                      <div className="absolute -bottom-8 -right-4 z-50"><div className="stamp-badge">Curated <br/> Archive</div></div>
                  </div>
                ) : (
                  <div className="w-full aspect-square border-2 border-dashed border-stone-200 rounded-[40px] flex items-center justify-center text-stone-300 font-mono text-xs uppercase tracking-widest">
                    No featured projects yet
                  </div>
                )}
            </div>
        </div>
      </header>

      <main className="max-w-[1500px] mx-auto px-6 md:px-12 mt-24">
        <div className="py-8 mb-20 relative reveal-up">
            <SectionDivider flip accentWidth="8%" />
            <div className="flex flex-col md:flex-row justify-between items-center px-4 py-12">
                <div className="font-heading text-[13px] text-stone-400 mb-8 md:mb-0 uppercase tracking-[1em]">INDEX OF WORKS</div>
                <div className="flex flex-wrap justify-center gap-x-14 gap-y-6">
                    {data.categories.map(cat => (
                    <button key={cat} onClick={() => setActiveFilter(cat)} className={`font-heading text-base md:text-xl uppercase tracking-[0.4em] transition-all line-hover-effect pb-2 ${activeFilter === cat ? 'text-stone-900 font-bold' : 'text-stone-400 hover:text-stone-700'}`}>
                        {cat}
                    </button>
                    ))}
                </div>
            </div>
            <SectionDivider accentWidth="5%" />
        </div>

        <div className="space-y-48">
            {categoriesToShow.map((cat, catIdx) => {
                const projects = data.projects.filter(p => p.category === cat);
                if (projects.length === 0) return null;
                const displayProjects = activeFilter === '全部' ? projects.slice(0, 3) : projects;

                return (
                    <section key={cat} className="reveal-up">
                        <div className="flex justify-between items-end mb-16 border-b border-stone-200/40 pb-6">
                            <div className="space-y-2">
                                <span className="font-mono text-[9px] text-[#9e2a2a] tracking-[0.7em] uppercase">SECTION {(catIdx+1).toString().padStart(2, '0')}</span>
                                <h2 className="font-heading text-2xl md:text-3xl text-stone-700 tracking-[0.5em] uppercase">{cat}</h2>
                            </div>
                            {activeFilter === '全部' && projects.length > 3 && (
                                <button onClick={() => setActiveFilter(cat)} className="font-heading text-[11px] font-bold text-[#9e2a2a] tracking-[0.4em] uppercase hover:opacity-70 transition-opacity">Expand Section +</button>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-28 gap-x-14">
                            {displayProjects.map((proj, idx) => (
                                <ProjectCard key={proj.id} project={proj} index={idx + 1} />
                            ))}
                        </div>
                    </section>
                );
            })}
        </div>
      </main>

      <footer className="mt-64 border-t border-stone-200/50 pt-24 pb-28 px-6 md:px-12 max-w-[1500px] mx-auto flex flex-col md:flex-row justify-between gap-20">
          <div className="max-w-lg space-y-10">
              <p className="font-serif text-3xl md:text-4xl italic text-stone-400 leading-relaxed">“{data.profile.bio}”</p>
              <p className="font-mono text-[10px] text-stone-300 tracking-[0.4em] uppercase">{data.profile.name} — Curated Archive © 2026</p>
          </div>
          <div className="text-right space-y-4">
              <p className="font-mono text-[10px] text-stone-300 uppercase tracking-[0.6em]">Collaborate / Inquire</p>
              <button onClick={() => setIsContactModalOpen(true)} className="font-heading text-xl md:text-3xl text-stone-800 hover:text-[#9e2a2a] underline underline-offset-[12px] decoration-stone-200 transition-colors">{data.profile.email}</button>
          </div>
      </footer>

      {isContactModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-stone-900/60 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-white rounded-[40px] w-full max-w-lg p-10 md:p-14 shadow-2xl relative animate-in zoom-in-95 duration-500">
                <button onClick={() => setIsContactModalOpen(false)} className="absolute top-8 right-8 text-stone-300 hover:text-stone-900 transition-colors p-2">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div className="space-y-8 text-center">
                    <div className="w-16 h-16 bg-[#9e2a2a]/5 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8 text-[#9e2a2a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-heading text-2xl tracking-widest uppercase text-stone-800">Get in Touch</h3>
                        <p className="text-stone-400 text-sm font-light leading-relaxed px-4">For digital experience collaborations or editorial inquiries, please reach out below.</p>
                    </div>
                    <div className="bg-stone-50 p-6 rounded-3xl border border-stone-200 flex flex-col gap-4">
                        <span className="font-mono text-sm text-stone-900 break-all select-all">{data.profile.email}</span>
                        <button 
                            onClick={copyEmail}
                            className={`py-4 rounded-2xl font-bold text-[10px] tracking-widest uppercase transition-all shadow-sm active:scale-95 ${copied ? 'bg-green-500 text-white' : 'bg-stone-900 text-white hover:bg-[#9e2a2a]'}`}
                        >
                            {copied ? '✓ Email Copied' : 'Copy Email Address'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioView;
