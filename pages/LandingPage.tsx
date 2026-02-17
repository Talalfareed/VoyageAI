
import React, { useState } from 'react';
import { MapPin, Plane, Compass, Star } from 'lucide-react';

interface LandingPageProps {
  onStart: (dest: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [destination, setDestination] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (destination.trim()) onStart(destination);
  };

  return (
    <div className="relative overflow-hidden bg-white">
      {/* Decorative background blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-teal-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-600 font-semibold text-sm mb-6 border border-blue-100">
            <Star className="w-4 h-4 mr-2" />
            AI-Powered Travel Intelligence
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight mb-8">
            Plan the perfect trip <br />
            <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">in seconds.</span>
          </h1>
          
          <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Forget spending hours researching. Our AI crafts bespoke itineraries tailored to your unique tastes, pace, and curiosity.
          </p>

          <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3 p-2 rounded-2xl bg-white shadow-2xl shadow-slate-200 border border-slate-100">
              <div className="flex-1 flex items-center px-4 space-x-3">
                <MapPin className="text-slate-400 w-6 h-6" />
                <input
                  type="text"
                  placeholder="Where do you want to go?"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full h-14 bg-transparent focus:outline-none text-slate-700 text-lg font-medium"
                />
              </div>
              <button
                type="submit"
                className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] flex items-center justify-center"
              >
                Plan My Trip
                <Plane className="ml-2 w-5 h-5" />
              </button>
            </div>
          </form>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="flex flex-col items-center p-6 rounded-3xl bg-white shadow-sm border border-slate-50">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900">AI-Optimized Routes</h3>
              <p className="text-sm text-slate-500 mt-2 text-center">Minimize travel time with smart geographic grouping of activities.</p>
            </div>
            <div className="flex flex-col items-center p-6 rounded-3xl bg-white shadow-sm border border-slate-50">
              <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 mb-4">
                <Star className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900">Personalized Pacing</h3>
              <p className="text-sm text-slate-500 mt-2 text-center">Whether you want to relax or explore every corner, we adjust for you.</p>
            </div>
            <div className="flex flex-col items-center p-6 rounded-3xl bg-white shadow-sm border border-slate-50">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-4">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900">Local Hidden Gems</h3>
              <p className="text-sm text-slate-500 mt-2 text-center">Beyond the usual tourists spots—discover authentic local culture.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
