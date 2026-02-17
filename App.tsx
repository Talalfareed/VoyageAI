
import React, { useState } from 'react';
import LandingPage from './pages/LandingPage';
import BuilderPage from './pages/BuilderPage';
import ResultsPage from './pages/ResultsPage';
import { TripPreferences, Itinerary, DayPlan } from './types';

export enum AppStep {
  Landing,
  Builder,
  Results
}

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.Landing);
  const [preferences, setPreferences] = useState<TripPreferences>({
    destination: '',
    days: 3,
    radius: 10,
    themes: ['Cultural', 'Foodie'],
    pace: 'Balanced',
    constraints: [],
    budgetAware: true
  });
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);

  const handleStartPlanning = (destination: string) => {
    setPreferences(prev => ({ ...prev, destination }));
    setCurrentStep(AppStep.Builder);
  };

  const handleGenerate = (finalPrefs: TripPreferences, result: Itinerary) => {
    setPreferences(finalPrefs);
    setItinerary(result);
    setCurrentStep(AppStep.Results);
  };

  const handleUpdateDay = (dayNumber: number, newDayPlan: DayPlan) => {
    if (!itinerary) return;
    const newDays = itinerary.days.map(d => d.dayNumber === dayNumber ? newDayPlan : d);
    setItinerary({ ...itinerary, days: newDays });
  };

  const handleRestart = () => {
    setCurrentStep(AppStep.Landing);
    setItinerary(null);
  };

  return (
    <div className="min-h-screen">
      {currentStep === AppStep.Landing && (
        <LandingPage onStart={handleStartPlanning} />
      )}
      {currentStep === AppStep.Builder && (
        <BuilderPage 
          initialPrefs={preferences} 
          onGenerate={handleGenerate} 
          onBack={() => setCurrentStep(AppStep.Landing)}
        />
      )}
      {currentStep === AppStep.Results && itinerary && (
        <ResultsPage 
          itinerary={itinerary} 
          preferences={preferences}
          onRestart={handleRestart}
          onUpdateDay={handleUpdateDay}
        />
      )}
    </div>
  );
};

export default App;
