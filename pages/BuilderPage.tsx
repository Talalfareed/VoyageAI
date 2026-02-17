
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Wand2, Calendar, Map, Activity as ActivityIcon, Utensils, Globe, ShieldCheck, Sparkles, MapPin as MapPinIcon } from 'lucide-react';
import { TripPreferences, TravelTheme, PaceType, Itinerary } from '../types';
import { generateItinerary } from '../geminiService';

interface BuilderPageProps {
  initialPrefs: TripPreferences;
  onGenerate: (prefs: TripPreferences, result: Itinerary) => void;
  onBack: () => void;
}

const THEMES: { id: TravelTheme; icon: React.ReactNode; color: string }[] = [
  { id: 'Cultural', icon: <Globe className="w-6 h-6" />, color: 'bg-blue-50 text-blue-600' },
  { id: 'Foodie', icon: <Utensils className="w-6 h-6" />, color: 'bg-orange-50 text-orange-600' },
  { id: 'Adventure', icon: <ActivityIcon className="w-6 h-6" />, color: 'bg-emerald-50 text-emerald-600' },
  { id: 'Relaxation', icon: <ShieldCheck className="w-6 h-6" />, color: 'bg-purple-50 text-purple-600' },
  { id: 'Luxury', icon: <StarIcon />, color: 'bg-amber-50 text-amber-600' },
  { id: 'Budget', icon: <WalletIcon />, color: 'bg-teal-50 text-teal-600' },
  { id: 'Outdoor', icon: <TreeIcon />, color: 'bg-green-50 text-green-600' },
  { id: 'Indoor', icon: <HomeIcon />, color: 'bg-indigo-50 text-indigo-600' },
];

function StarIcon() { return <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>; }
function WalletIcon() { return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>; }
function TreeIcon() { return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3l1.912 5.885h6.188l-5.004 3.636 1.912 5.885L12 14.77l-5.008 3.636 1.912-5.885-5.004-3.636h6.188L12 3z" /></svg>; }
function HomeIcon() { return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>; }

const BuilderPage: React.FC<BuilderPageProps> = ({ initialPrefs, onGenerate, onBack }) => {
  const [step, setStep] = useState(1);
  const [prefs, setPrefs] = useState<TripPreferences>(initialPrefs);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleToggleTheme = (themeId: TravelTheme) => {
    setPrefs(prev => ({
      ...prev,
      themes: prev.themes.includes(themeId)
        ? prev.themes.filter(t => t !== themeId)
        : [...prev.themes, themeId]
    }));
  };

  const handleGenerateClick = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await generateItinerary(prefs);
      onGenerate(prefs, result);
    } catch (err: any) {
      setError(err.message || 'An error occurred during generation.');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 3));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-full transition-colors flex items-center text-slate-900 font-black uppercase text-xs tracking-widest">
          <ChevronLeft className="w-5 h-5 mr-2" />
          Back
        </button>
        <div className="flex items-center space-x-2">
          {[1, 2, 3].map(i => (
            <div key={i} className={`w-12 h-2 rounded-full transition-all duration-500 ${i <= step ? 'bg-blue-600' : 'bg-slate-200'}`} />
          ))}
        </div>
        <div className="w-20" />
      </header>

      <main className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full p-6 gap-10">
        <div className="flex-1 space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
          {step === 1 && (
            <div className="space-y-10">
              <div className="space-y-3">
                <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-tight">Your Destination.</h2>
                <p className="text-slate-500 text-xl font-medium">Where and for how long are we dreaming?</p>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-[0.25em] block">Target Location</span>
                  <div className="relative group">
                    <Map className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-7 h-7 transition-colors group-focus-within:text-blue-600" />
                    <input
                      type="text"
                      className="w-full h-20 pl-16 pr-8 bg-white border-4 border-white rounded-[32px] focus:ring-8 focus:ring-blue-600/5 focus:border-blue-600 outline-none font-black text-slate-900 text-2xl transition-all shadow-xl shadow-slate-200/50"
                      placeholder="e.g. Amalfi Coast, Italy"
                      value={prefs.destination}
                      onChange={e => setPrefs({ ...prefs, destination: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-[0.25em] block">Trip Duration</span>
                    <div className="bg-white p-8 rounded-[40px] border-4 border-white shadow-xl shadow-slate-200/50">
                      <div className="flex items-end justify-between mb-8">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-blue-50 rounded-[24px] flex items-center justify-center text-blue-600 shadow-inner">
                            <Calendar className="w-8 h-8" />
                          </div>
                          <div>
                            <span className="text-5xl font-black text-slate-900 tabular-nums">{prefs.days}</span>
                            <span className="ml-2 text-slate-400 font-black uppercase text-xs tracking-widest">Days</span>
                          </div>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="14"
                        className="w-full h-3 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-600"
                        value={prefs.days}
                        onChange={e => setPrefs({ ...prefs, days: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-[0.25em] block">Exploration Range</span>
                    <div className="bg-white p-8 rounded-[40px] border-4 border-white shadow-xl shadow-slate-200/50">
                      <div className="flex items-end justify-between mb-8">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-teal-50 rounded-[24px] flex items-center justify-center text-teal-600 shadow-inner">
                            <Map className="w-8 h-8" />
                          </div>
                          <div>
                            <span className="text-5xl font-black text-slate-900 tabular-nums">{prefs.radius}</span>
                            <span className="ml-2 text-slate-400 font-black uppercase text-xs tracking-widest">KM</span>
                          </div>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="50"
                        step="2"
                        className="w-full h-3 bg-slate-100 rounded-full appearance-none cursor-pointer accent-teal-500"
                        value={prefs.radius}
                        onChange={e => setPrefs({ ...prefs, radius: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-10">
              <div className="space-y-3">
                <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-tight">The Aesthetic.</h2>
                <p className="text-slate-500 text-xl font-medium">Select the themes that pulse through your trip.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {THEMES.map(theme => {
                  const isSelected = prefs.themes.includes(theme.id);
                  return (
                    <button
                      key={theme.id}
                      onClick={() => handleToggleTheme(theme.id)}
                      className={`p-8 rounded-[48px] border-4 transition-all flex flex-col items-center justify-center space-y-5 relative group ${
                        isSelected
                          ? 'border-blue-600 bg-white ring-[12px] ring-blue-600/5 shadow-2xl scale-[1.05]'
                          : 'border-white bg-white hover:border-slate-100 shadow-xl shadow-slate-200/30'
                      }`}
                    >
                      <div className={`p-5 rounded-[28px] ${theme.color} transform transition-all duration-500 ${isSelected ? 'scale-125 rotate-6' : 'group-hover:scale-110'}`}>
                        {theme.icon}
                      </div>
                      <span className={`font-black text-sm tracking-widest uppercase ${isSelected ? 'text-slate-900' : 'text-slate-400'}`}>{theme.id}</span>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-6">
                <span className="text-xs font-black text-slate-400 uppercase tracking-[0.25em] block">Desired Movement Pace</span>
                <div className="flex p-3 bg-white rounded-[40px] border-4 border-white shadow-xl shadow-slate-200/50">
                  {['Relaxed', 'Balanced', 'Packed'].map(p => (
                    <button
                      key={p}
                      onClick={() => setPrefs({ ...prefs, pace: p as PaceType })}
                      className={`flex-1 py-6 rounded-[32px] font-black tracking-widest uppercase text-sm transition-all duration-300 ${
                        prefs.pace === p ? 'bg-slate-900 text-white shadow-2xl scale-[1.02]' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-10">
              <div className="space-y-3">
                <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-tight">Refinements.</h2>
                <p className="text-slate-500 text-xl font-medium">Any special requirements for our intelligence to process?</p>
              </div>

              <div className="space-y-8">
                <label className="block">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-[0.25em] block mb-4">Specific Constraints</span>
                  <textarea
                    placeholder="e.g. Vegetarian only, toddler-friendly, visit at least 3 temples, early riser..."
                    className="w-full p-10 bg-white border-4 border-white rounded-[48px] focus:ring-8 focus:ring-blue-600/5 focus:border-blue-600 outline-none h-60 font-black text-slate-900 text-xl shadow-xl shadow-slate-200/50 resize-none placeholder:text-slate-300 placeholder:font-bold"
                    value={prefs.constraints.join(', ')}
                    onChange={e => setPrefs({ ...prefs, constraints: [e.target.value] })}
                  />
                </label>
                
                <div 
                  onClick={() => setPrefs({ ...prefs, budgetAware: !prefs.budgetAware })}
                  className="flex items-center justify-between p-10 bg-white rounded-[48px] border-4 border-white shadow-xl shadow-slate-200/50 cursor-pointer hover:border-blue-100 transition-all group"
                >
                  <div className="flex items-center space-x-6">
                    <div className={`w-16 h-16 rounded-[28px] flex items-center justify-center transition-all duration-500 ${prefs.budgetAware ? 'bg-amber-100 text-amber-600 rotate-12' : 'bg-slate-100 text-slate-400'}`}>
                      <WalletIcon />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-2xl tracking-tight">Budget Optimization</h4>
                      <p className="text-lg text-slate-500 font-medium">AI will generate cost estimates for your route.</p>
                    </div>
                  </div>
                  <div className={`w-16 h-9 rounded-full transition-all relative ${prefs.budgetAware ? 'bg-blue-600' : 'bg-slate-200'}`}>
                    <div className={`absolute top-1 w-7 h-7 bg-white rounded-full transition-all shadow-md ${prefs.budgetAware ? 'left-8' : 'left-1'}`} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-16 border-t-4 border-slate-100/50">
            {step > 1 ? (
              <button onClick={prevStep} className="px-10 py-5 font-black text-slate-400 uppercase tracking-widest text-sm hover:text-slate-900 transition-all">
                Previous
              </button>
            ) : <div />}
            {step < 3 ? (
              <button onClick={nextStep} className="px-14 py-6 bg-slate-900 text-white rounded-[32px] font-black uppercase text-sm tracking-[0.2em] shadow-2xl hover:bg-blue-600 hover:scale-[1.05] transition-all flex items-center">
                Next Step
                <ChevronRight className="ml-3 w-5 h-5" />
              </button>
            ) : (
              <button
                disabled={isLoading}
                onClick={handleGenerateClick}
                className="px-16 py-7 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-[36px] font-black uppercase text-sm tracking-[0.3em] shadow-2xl shadow-blue-300 hover:opacity-95 hover:scale-[1.05] transition-all flex items-center disabled:opacity-50 disabled:scale-100"
              >
                {isLoading ? (
                  <>
                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin mr-4" />
                    Analyzing Data...
                  </>
                ) : (
                  <>
                    Craft My Journey
                    <Wand2 className="ml-4 w-6 h-6" />
                  </>
                )}
              </button>
            )}
          </div>
          {error && <p className="text-red-600 font-black text-center bg-red-50 p-6 rounded-[32px] border-4 border-red-100/50">{error}</p>}
        </div>

        <aside className="w-full md:w-[420px] space-y-8">
          <div className="bg-white p-10 rounded-[60px] shadow-2xl shadow-slate-200/50 border-4 border-white sticky top-28">
            <h3 className="text-2xl font-black text-slate-900 mb-10 flex items-center tracking-tight leading-none">
              <Sparkles className="w-7 h-7 mr-4 text-blue-600" />
              Intelligence Dashboard
            </h3>
            <div className="space-y-8">
              <div className="flex items-center space-x-5 p-6 rounded-[36px] bg-slate-50/70 border-2 border-white">
                <div className="w-14 h-14 bg-white rounded-[24px] flex items-center justify-center shadow-lg text-blue-600">
                  <MapPinIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Destination</p>
                  <p className="font-black text-slate-900 text-xl tracking-tight">{prefs.destination || '???'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-5 p-6 rounded-[36px] bg-slate-50/70 border-2 border-white">
                <div className="w-14 h-14 bg-white rounded-[24px] flex items-center justify-center shadow-lg text-teal-500">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Duration</p>
                  <p className="font-black text-slate-900 text-xl tracking-tight">{prefs.days} Days</p>
                </div>
              </div>
              
              <div className="pt-4 px-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] block mb-6">Theme Architecture</p>
                <div className="flex flex-wrap gap-3">
                  {prefs.themes.map(t => (
                    <span key={t} className="px-6 py-3 bg-white text-slate-900 text-xs font-black rounded-full border-2 border-slate-50 shadow-sm uppercase tracking-widest">
                      {t}
                    </span>
                  ))}
                  {prefs.themes.length === 0 && <span className="text-sm text-slate-300 font-black italic">No themes specified</span>}
                </div>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default BuilderPage;
