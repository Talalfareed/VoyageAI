
import React, { useState, useEffect } from 'react';
import { 
  Share2, Printer, ChevronRight, ChevronLeft,
  MapPin, Clock, Coffee, Info, Map as MapIcon, 
  ArrowLeft, CreditCard, Sparkles, AlertCircle, Camera, Loader2, RefreshCw, ExternalLink, Navigation
} from 'lucide-react';
import { Itinerary, TripPreferences, DayPlan } from '../types';
import { generateAIImage, regenerateDayPlan } from '../geminiService';

interface ResultsPageProps {
  itinerary: Itinerary;
  preferences: TripPreferences;
  onRestart: () => void;
  onUpdateDay: (dayNumber: number, newDayPlan: DayPlan) => void;
}

const ResultsPage: React.FC<ResultsPageProps> = ({ itinerary, preferences, onRestart, onUpdateDay }) => {
  const [activeDay, setActiveDay] = useState(1);
  const [showMapView, setShowMapView] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  
  // State to store all generated images
  const [imageCache, setImageCache] = useState<Record<string, string>>({});
  const [loadingTerms, setLoadingTerms] = useState<Record<string, boolean>>({});

  const currentDayPlan = itinerary.days.find(d => d.dayNumber === activeDay) || itinerary.days[0];

  // Logic to fetch image for a specific search term if not already in cache
  const ensureImage = async (term: string, isPortrait: boolean = false) => {
    if (imageCache[term] || loadingTerms[term]) return;

    setLoadingTerms(prev => ({ ...prev, [term]: true }));
    try {
      const dataUrl = await generateAIImage(term, isPortrait);
      setImageCache(prev => ({ ...prev, [term]: dataUrl }));
    } catch (err) {
      console.error(`Failed to generate image for ${term}:`, err);
    } finally {
      setLoadingTerms(prev => ({ ...prev, [term]: false }));
    }
  };

  useEffect(() => {
    const termsToFetch: { term: string; portrait: boolean }[] = [
      { term: currentDayPlan.dayHeroImageSearchTerm, portrait: false },
      ...currentDayPlan.activities.map(a => ({ term: a.imageSearchTerm, portrait: true })),
      ...currentDayPlan.foodRecommendations.map(f => ({ term: f.imageSearchTerm, portrait: false }))
    ];

    termsToFetch.forEach(({ term, portrait }) => {
      ensureImage(term, portrait);
    });
  }, [activeDay, currentDayPlan]);

  const handleRegenerateDay = async () => {
    setIsRegenerating(true);
    try {
      const newDay = await regenerateDayPlan(preferences, activeDay, itinerary);
      onUpdateDay(activeDay, newDay);
    } catch (err) {
      console.error("Failed to regenerate day:", err);
      alert("Failed to regenerate day. Please try again.");
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  const GenerativeImageDisplay: React.FC<{ 
    searchTerm: string; 
    className?: string; 
    alt: string;
  }> = ({ searchTerm, className, alt }) => {
    const imgSrc = imageCache[searchTerm];
    const isLoading = loadingTerms[searchTerm];

    if (isLoading) {
      return (
        <div className={`${className} bg-slate-200 animate-pulse flex items-center justify-center`}>
          <div className="flex flex-col items-center space-y-3">
            <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Painting...</span>
          </div>
        </div>
      );
    }

    if (!imgSrc) {
      return (
        <div className={`${className} bg-slate-100 flex items-center justify-center p-8 text-center`}>
          <div className="flex flex-col items-center">
            <Camera className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Generating...</p>
          </div>
        </div>
      );
    }

    return <img src={imgSrc} alt={alt} className={`${className} object-cover`} />;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-32">
      {/* Header Bar */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-[100]">
        <div className="max-w-screen-2xl mx-auto px-6 h-20 flex items-center justify-between">
          <button onClick={onRestart} className="flex items-center text-slate-900 font-black hover:text-blue-600 transition-colors uppercase text-xs tracking-widest">
            <ArrowLeft className="w-5 h-5 mr-3" />
            Start Over
          </button>
          
          <div className="hidden lg:flex items-center space-x-3">
            <div className="px-5 py-2.5 bg-blue-600 rounded-2xl text-white font-black text-sm shadow-xl shadow-blue-200">
              {preferences.destination}
            </div>
            <div className="px-5 py-2.5 bg-white border-2 border-slate-50 rounded-2xl text-slate-500 font-black text-sm shadow-sm">
              {preferences.days} Days
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button 
              disabled={isRegenerating}
              onClick={handleRegenerateDay} 
              className="flex items-center px-4 py-3 bg-white border-2 border-slate-100 hover:border-blue-500 rounded-2xl text-slate-700 font-bold text-sm transition-all shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRegenerating ? 'animate-spin' : ''}`} />
              {isRegenerating ? 'Regenerating...' : 'Regenerate Day'}
            </button>
            <button onClick={handleExportPDF} className="p-3 bg-white border-2 border-slate-50 hover:bg-slate-50 rounded-2xl text-slate-400 transition-all shadow-sm">
              <Printer className="w-5 h-5" />
            </button>
            <button className="flex items-center px-6 py-3 bg-slate-900 text-white rounded-[20px] font-black text-sm shadow-xl hover:bg-slate-800 transition-all">
              <Share2 className="w-4 h-4 mr-3" />
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative h-[55vh] w-full overflow-hidden bg-slate-900">
        <GenerativeImageDisplay 
          searchTerm={currentDayPlan.dayHeroImageSearchTerm} 
          alt={currentDayPlan.title}
          className="w-full h-full opacity-70 scale-105 transition-all duration-[10s] ease-linear hover:scale-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/40" />
        <div className="absolute bottom-16 left-0 w-full px-6">
          <div className="max-w-7xl mx-auto">
            <span className="inline-flex items-center px-5 py-2 rounded-full bg-blue-600 text-white font-black text-[10px] uppercase tracking-[0.3em] mb-6 backdrop-blur-md shadow-2xl">
              Chapter {activeDay}
            </span>
            <h1 className="text-5xl lg:text-8xl font-black text-white tracking-tighter max-w-5xl leading-[0.9] drop-shadow-2xl">
              {currentDayPlan.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Sidebar */}
          <aside className="lg:w-80 flex-shrink-0">
            <div className="bg-white/95 backdrop-blur-2xl rounded-[48px] border-4 border-white p-6 shadow-2xl shadow-slate-300/50 sticky top-28">
              <h3 className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-6 border-b border-slate-50">Journal Index</h3>
              <div className="space-y-3">
                {itinerary.days.map(day => (
                  <button
                    key={day.dayNumber}
                    onClick={() => setActiveDay(day.dayNumber)}
                    className={`w-full group rounded-[32px] p-5 transition-all flex items-center gap-5 ${
                      activeDay === day.dayNumber 
                        ? 'bg-blue-600 text-white shadow-2xl shadow-blue-200 translate-x-3' 
                        : 'hover:bg-slate-50 text-slate-500'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-[20px] flex items-center justify-center font-black text-sm flex-shrink-0 transition-all ${
                      activeDay === day.dayNumber ? 'bg-white text-blue-600' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {day.dayNumber}
                    </div>
                    <div className="text-left overflow-hidden">
                      <p className={`font-black truncate text-sm tracking-tight ${activeDay === day.dayNumber ? 'text-white' : 'text-slate-900'}`}>
                        {day.title}
                      </p>
                      <p className={`text-[10px] font-black uppercase tracking-widest ${activeDay === day.dayNumber ? 'text-white/60' : 'text-slate-400'}`}>Day {day.dayNumber}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0 pb-20">
            <div className="flex items-center justify-between mb-16">
              <div className="flex items-center gap-6">
                <div className="flex items-center px-6 py-3 bg-white rounded-[24px] border-4 border-white shadow-xl shadow-slate-200/40">
                  <Clock className="w-4 h-4 mr-3 text-blue-600" />
                  <span className="text-xs font-black text-slate-900 uppercase tracking-[0.15em]">{preferences.pace} Pace</span>
                </div>
                <div className="flex items-center px-6 py-3 bg-white rounded-[24px] border-4 border-white shadow-xl shadow-slate-200/40">
                  <MapPin className="w-4 h-4 mr-3 text-teal-500" />
                  <span className="text-xs font-black text-slate-900 uppercase tracking-[0.15em]">{preferences.radius}KM Scale</span>
                </div>
              </div>
              <button 
                onClick={() => setShowMapView(!showMapView)}
                className={`flex items-center px-8 py-4 rounded-[28px] font-black transition-all text-[10px] uppercase tracking-[0.25em] border-4 ${
                  showMapView 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-2xl' 
                  : 'bg-white text-slate-900 border-white shadow-xl hover:border-blue-600/20'
                }`}
              >
                <MapIcon className="w-4 h-4 mr-3" />
                {showMapView ? 'View Gallery' : 'View Route Map'}
              </button>
            </div>

            <div className="relative">
              {/* Map View Integration */}
              <div className={`${showMapView ? 'block' : 'hidden'} animate-in fade-in zoom-in duration-500`}>
                <div className="bg-slate-100 rounded-[64px] border-4 border-white shadow-2xl p-10 lg:p-16 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                     {/* Decorative Grid */}
                     <div className="grid grid-cols-12 h-full w-full border-slate-900">
                        {Array.from({length: 144}).map((_,i) => <div key={i} className="border border-slate-900/10" />)}
                     </div>
                  </div>

                  <div className="relative z-10 flex flex-col items-center">
                    <div className="mb-12 text-center">
                      <h2 className="text-4xl font-black text-slate-900 mb-2">Smart Route Map</h2>
                      <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Optimized path for {currentDayPlan.title}</p>
                    </div>

                    <div className="w-full max-w-4xl space-y-12">
                      {currentDayPlan.activities.map((activity, idx) => (
                        <div key={idx} className="relative flex items-center gap-10 group">
                          {/* Route Line Connector */}
                          {idx < currentDayPlan.activities.length - 1 && (
                            <div className="absolute left-[39px] top-16 bottom-[-48px] w-1.5 bg-gradient-to-b from-blue-500 to-teal-400 rounded-full z-0 opacity-30" />
                          )}
                          
                          {/* Marker */}
                          <div className="w-20 h-20 rounded-full bg-white border-4 border-blue-500 shadow-xl flex items-center justify-center font-black text-blue-600 z-10 flex-shrink-0 group-hover:scale-110 transition-transform">
                            {idx + 1}
                          </div>

                          {/* Location Card */}
                          <div className="flex-1 bg-white p-6 rounded-[32px] border-2 border-slate-50 shadow-lg hover:shadow-2xl transition-all flex flex-col md:flex-row gap-6">
                            <GenerativeImageDisplay 
                              searchTerm={activity.imageSearchTerm} 
                              alt={activity.title}
                              className="w-full md:w-32 h-32 rounded-2xl flex-shrink-0"
                            />
                            <div className="flex-1 flex flex-col justify-center">
                              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">{activity.timeOfDay}</span>
                              <h4 className="text-xl font-black text-slate-900 mb-2">{activity.title}</h4>
                              <p className="text-xs font-bold text-slate-400 flex items-center mb-4">
                                <MapPin className="w-3 h-3 mr-1" />
                                {activity.location}
                              </p>
                              <div className="flex items-center gap-3">
                                <a 
                                  href={activity.googleMapsUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-colors"
                                >
                                  <Navigation className="w-3 h-3 mr-2" />
                                  Navigate
                                </a>
                                <a 
                                  href={activity.googleMapsUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                                  title="Open in Maps"
                                >
                                  <ExternalLink className="w-5 h-5" />
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-20 p-8 bg-blue-600 rounded-[40px] text-white w-full max-w-4xl flex items-center justify-between shadow-2xl shadow-blue-200">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white/20 rounded-[24px] flex items-center justify-center backdrop-blur-md">
                          <Clock className="w-8 h-8" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest">Est. Travel Time</p>
                          <p className="text-2xl font-black">Day Total: ~{currentDayPlan.activities.length * 1.5} Hours Active</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setShowMapView(false)}
                        className="px-8 py-4 bg-white text-slate-900 rounded-[24px] font-black uppercase text-[10px] tracking-widest shadow-xl"
                      >
                        Exit Map View
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gallery / Detail View */}
              <div className={`${!showMapView ? 'block' : 'hidden'} space-y-28 animate-in fade-in slide-in-from-right-12 duration-1000`}>
                <div className="space-y-20">
                  {currentDayPlan.activities.map((activity, idx) => (
                    <div key={idx} className="group relative">
                      <div className="flex flex-col lg:flex-row gap-12 lg:items-stretch">
                        <div className="lg:w-96 h-80 lg:h-auto rounded-[56px] overflow-hidden shadow-2xl shadow-slate-300 relative flex-shrink-0 group-hover:scale-[1.03] transition-all duration-500 ease-out border-4 border-white">
                          <GenerativeImageDisplay 
                            searchTerm={activity.imageSearchTerm} 
                            alt={activity.title}
                            className="w-full h-full"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent" />
                          <div className="absolute bottom-8 left-8 right-8">
                             <div className="flex items-center text-white/90 gap-2.5">
                                <MapPin className="w-4 h-4 text-blue-400" />
                                <span className="text-xs font-black uppercase tracking-[0.2em]">{activity.location}</span>
                             </div>
                          </div>
                        </div>

                        <div className="flex-1 bg-white rounded-[56px] p-10 lg:p-14 border-4 border-white shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                           <div className="flex items-center justify-between mb-8">
                              <span className={`px-5 py-2 rounded-full font-black text-[10px] uppercase tracking-[0.3em] shadow-sm ${
                                activity.timeOfDay === 'Morning' ? 'bg-amber-100 text-amber-700' : 
                                activity.timeOfDay === 'Afternoon' ? 'bg-blue-100 text-blue-700' : 'bg-indigo-100 text-indigo-700'
                              }`}>
                                {activity.timeOfDay}
                              </span>
                              <div className="flex items-center font-black text-slate-400 text-[10px] uppercase tracking-[0.3em]">
                                <Clock className="w-4 h-4 mr-3" />
                                {activity.duration}
                              </div>
                           </div>

                           <h3 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6 tracking-tight group-hover:text-blue-600 transition-colors leading-none">
                             {activity.title}
                           </h3>
                           <p className="text-slate-500 text-xl leading-relaxed mb-10 font-medium italic opacity-90">
                             "{activity.description}"
                           </p>

                           <div className="p-8 bg-slate-50/70 rounded-[36px] border-2 border-white flex gap-6 shadow-inner">
                              <Sparkles className="w-8 h-8 text-blue-600 flex-shrink-0" />
                              <div className="space-y-1">
                                <p className="text-blue-600 uppercase text-[10px] font-black tracking-[0.3em] mb-2">AI Reasoning</p>
                                <p className="text-base font-bold text-slate-800 leading-relaxed">
                                  {activity.whyIncluded}
                                </p>
                              </div>
                           </div>

                           {activity.travelTimeNext && (
                            <div className="mt-10 pt-10 border-t-4 border-dashed border-slate-100 flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-3 h-3 rounded-full bg-blue-600 animate-ping" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Next Destination</span>
                              </div>
                              <span className="font-black text-slate-900 text-lg tabular-nums tracking-widest">{activity.travelTimeNext}</span>
                            </div>
                           )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Gastronomy Section */}
                <div className="bg-white rounded-[72px] p-12 lg:p-20 shadow-2xl shadow-slate-300/40 border-4 border-white overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-orange-100/50 rounded-full blur-[100px] -mr-40 -mt-40" />
                  <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-16">
                      <div className="space-y-4">
                        <div className="w-20 h-20 bg-orange-100 rounded-[32px] flex items-center justify-center text-orange-600 mb-8 shadow-xl shadow-orange-100/50">
                          <Coffee className="w-10 h-10" />
                        </div>
                        <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">Gastro Intelligence.</h2>
                        <p className="text-slate-500 text-2xl font-medium tracking-tight">Authentic flavors analyzed for your palate.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
                      {currentDayPlan.foodRecommendations.map((food, i) => (
                        <div key={i} className="group cursor-pointer">
                          <div className="h-80 rounded-[56px] overflow-hidden mb-8 shadow-2xl border-4 border-white transition-all duration-500 group-hover:rotate-1">
                            <GenerativeImageDisplay 
                              searchTerm={food.imageSearchTerm} 
                              alt={food.name} 
                              className="w-full h-full transition-transform duration-700 group-hover:scale-110"
                            />
                          </div>
                          <div className="px-4">
                            <span className="text-[10px] font-black uppercase text-orange-600 tracking-[0.4em] mb-4 block">{food.meal} Selection</span>
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-3xl font-black text-slate-900 tracking-tight">{food.name}</h4>
                              <a href={food.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-orange-500 transition-colors">
                                <MapPin className="w-5 h-5" />
                              </a>
                            </div>
                            <p className="text-slate-500 text-lg font-medium leading-relaxed opacity-80">{food.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Local Logic */}
                <div className="bg-slate-900 rounded-[72px] p-12 lg:p-20 text-white overflow-hidden relative shadow-2xl shadow-slate-900/50">
                  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full -mr-40 -mt-40" />
                  <div className="relative z-10">
                    <div className="flex items-center mb-16">
                      <div className="w-20 h-20 bg-white/10 backdrop-blur-2xl rounded-[32px] flex items-center justify-center text-white mr-8 border border-white/10 shadow-2xl">
                        <Info className="w-10 h-10" />
                      </div>
                      <div>
                        <h2 className="text-5xl font-black tracking-tighter leading-none mb-2">Local Logic.</h2>
                        <p className="text-blue-400 font-black uppercase text-xs tracking-[0.4em]">Expert insights for {preferences.destination}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {currentDayPlan.localTips.map((tip, i) => (
                        <div key={i} className="p-10 rounded-[48px] bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 group hover:-translate-y-2">
                          <AlertCircle className="w-8 h-8 mb-8 text-blue-400 group-hover:scale-125 transition-transform" />
                          <p className="font-black text-xl leading-[1.3] tracking-tight text-white/95">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      
      {/* Floating Navigation Controls */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[200]">
        <div className="bg-white/70 backdrop-blur-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border border-white/50 p-3 rounded-[40px] flex items-center gap-3 min-w-[360px] justify-between">
          <button 
            disabled={activeDay === 1}
            onClick={() => setActiveDay(activeDay - 1)}
            className="p-5 bg-white hover:bg-slate-50 rounded-[28px] transition-all shadow-sm disabled:opacity-20 active:scale-90"
          >
            <ChevronLeft className="w-7 h-7 text-slate-900" />
          </button>
          
          <div className="flex-1 flex flex-col items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mb-1">Index</span>
            <span className="font-black text-slate-900 text-sm tracking-widest tabular-nums">DAY {activeDay} / {itinerary.days.length}</span>
          </div>

          <button 
            disabled={activeDay === itinerary.days.length}
            onClick={() => setActiveDay(activeDay + 1)}
            className="p-5 bg-slate-900 hover:bg-slate-800 rounded-[28px] transition-all shadow-2xl disabled:opacity-20 active:scale-90"
          >
            <ChevronRight className="w-7 h-7 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
