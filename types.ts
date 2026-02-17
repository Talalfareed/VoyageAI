
export type TravelTheme = 'Outdoor' | 'Indoor' | 'Foodie' | 'Cultural' | 'Adventure' | 'Relaxation' | 'Luxury' | 'Budget';
export type PaceType = 'Relaxed' | 'Balanced' | 'Packed';

export interface TripPreferences {
  destination: string;
  days: number;
  radius: number;
  themes: TravelTheme[];
  pace: PaceType;
  constraints: string[];
  budgetAware: boolean;
}

export interface Activity {
  timeOfDay: 'Morning' | 'Afternoon' | 'Evening';
  title: string;
  description: string;
  duration: string;
  location: string;
  googleMapsUrl: string;
  travelTimeNext?: string;
  whyIncluded: string;
  imageSearchTerm: string;
}

export interface FoodRecommendation {
  meal: string;
  name: string;
  description: string;
  imageSearchTerm: string;
  googleMapsUrl: string;
}

export interface DayPlan {
  dayNumber: number;
  title: string;
  activities: Activity[];
  foodRecommendations: FoodRecommendation[];
  localTips: string[];
  dayHeroImageSearchTerm: string;
}

export interface Itinerary {
  itineraryName: string;
  totalBudgetEstimate?: string;
  days: DayPlan[];
}
