export interface CommuteData {
  distance: number; // in miles/days or km/day
  transportType: string;
  fuelType: string;
}

export interface ElectricityData {
  monthlyKwh: number;
  gridMix: string;
}

export interface DietData {
  dietType: string;
  localFoodPercent: number;
  foodWasteLevel: string;
}

export interface TravelData {
  flightHoursYearly: number;
  trainHoursYearly: number;
  hotelNightsYearly: number;
  monthlyTravelExpenses: number;
}

export interface FootprintEntry {
  id: string;
  date: string; // YYYY-MM-DD
  commuteCO2: number; // kg CO2e per day
  electricityCO2: number; // kg CO2e per day
  dietCO2: number; // kg CO2e per day
  travelCO2: number; // kg CO2e per day
  totalCO2: number; // kg CO2e per day
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirementType: 'total_entries' | 'low_carbon_day' | 'all_habits_done' | 'green_commute' | 'diet_warrior';
  unlocked: boolean;
  unlockedDate?: string;
}

export interface SustainableHabit {
  id: string;
  category: 'commuting' | 'electricity' | 'diet' | 'travel' | 'lifestyle';
  title: string;
  description: string;
  co2SavedKg: number; // Daily offset
  completed: boolean;
}

export interface EmissionSourceInfo {
  id: string;
  category: string;
  title: string;
  cause: string;
  consequences: string;
  solutions: string[];
}

export interface LocationEnvironmentalData {
  id: string;
  name: string;
  country: string;
  co2PerDayPerCapita: number; // Average daily kg CO2e per person in this country
  gridIntensityGCO2: number; // g CO2 / kWh
  regionalEmissionsPerSecond: number; // Total city/metro wide emissions in kg CO2 per second
  locationNote: string;
  currentAirQuality: string;
  realtimeAdvice: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface CommentExperience {
  id: string;
  author: string;
  location: string;
  text: string;
  likes: number;
  tags: string[];
  date: string;
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  location: string;
  dailyAvgKg: number;
  badgesCount: number;
  streakDays: number;
  isYou?: boolean;
}
