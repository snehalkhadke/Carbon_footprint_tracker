import { Badge, SustainableHabit, EmissionSourceInfo, LocationEnvironmentalData, CommentExperience, LeaderboardUser } from './types';

// Carbon conversion constants (kg CO2e per mile/unit)
export const COMMUTE_EMISSION_FACTORS: Record<string, number> = {
  'petrol_car': 0.24,   // 240g CO2 per mile
  'diesel_car': 0.27,   // 270g CO2 per mile
  'electric_car': 0.06, // charging offset (average mix)
  'motorcycle': 0.15,
  'bus': 0.08,
  'train': 0.04,
  'bicycle_walking': 0.0,
};

export const DIET_BASE_EMISSIONS: Record<string, number> = {
  'high_meat': 7.2,    // kg CO2e/day
  'average_meat': 5.6, // kg CO2e/day
  'low_meat': 3.8,     // Flexitarian kg CO2e/day
  'vegetarian': 2.7,   // kg CO2e/day
  'vegan': 1.5,        // kg CO2e/day
};

export const FOOD_WASTE_FACTORS: Record<string, number> = {
  'none': 0.0,
  'low': 0.4,    // kg CO2e/day
  'medium': 0.9, // kg CO2e/day
  'high': 1.9,   // kg CO2e/day
};

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'badge_1',
    title: 'First Green Step',
    description: 'Log your daily carbon footprint for the first time.',
    icon: 'Footprints',
    requirementType: 'total_entries',
    unlocked: false,
  },
  {
    id: 'badge_2',
    title: 'Carbon Minimalist',
    description: 'Log a total daily emmision under 10 kg of CO2e (climate-safe target).',
    icon: 'Leaf',
    requirementType: 'low_carbon_day',
    unlocked: false,
  },
  {
    id: 'badge_3',
    title: 'Plant-Based Champion',
    description: 'Log an entry with a Vegetarian or Vegan diet type.',
    icon: 'Sprout',
    requirementType: 'diet_warrior',
    unlocked: false,
  },
  {
    id: 'badge_4',
    title: 'Sustainably Active',
    description: 'Unlock by completing all lifestyle habits in a single day.',
    icon: 'CheckCircle',
    requirementType: 'all_habits_done',
    unlocked: false,
  },
  {
    id: 'badge_5',
    title: 'Active Commuter',
    description: 'Log a commute using active transit (Bicycle, Walking, or Train/Bus).',
    icon: 'Bike',
    requirementType: 'green_commute',
    unlocked: false,
  }
];

export const INITIAL_HABITS: SustainableHabit[] = [
  {
    id: 'habit_1',
    category: 'diet',
    title: '100% Meatless Meals',
    description: 'Avoid meat and dairy products to cut deep-rooted agricultural methane.',
    co2SavedKg: 2.1,
    completed: false,
  },
  {
    id: 'habit_2',
    category: 'commuting',
    title: 'Active Transit Choice',
    description: 'Walk, cycle, or use public transport instead of driving a solo fuel car today.',
    co2SavedKg: 4.8,
    completed: false,
  },
  {
    id: 'habit_3',
    category: 'electricity',
    title: 'Vampire Draw Slayer',
    description: 'Unplug chargers, laptops, and consoles when fully charged or not in use.',
    co2SavedKg: 0.6,
    completed: false,
  },
  {
    id: 'habit_4',
    category: 'electricity',
    title: 'Natural Temperature Control',
    description: 'Postpone heat or AC usage. Open windows or use layers for comfort.',
    co2SavedKg: 1.5,
    completed: false,
  },
  {
    id: 'habit_5',
    category: 'lifestyle',
    title: 'Zero Single-Use Plastic',
    description: 'Opt for reusable mugs, water bottles, and canvas tote grocery bags instead.',
    co2SavedKg: 0.4,
    completed: false,
  },
  {
    id: 'habit_6',
    category: 'electricity',
    title: 'Wash Laundry at 30°C',
    description: 'Heating water accounts for 90% of washing machine energy. Dry naturally line-dry.',
    co2SavedKg: 0.9,
    completed: false,
  },
];

export const ENVIRONMENTAL_LOCATIONS: LocationEnvironmentalData[] = [
  {
    id: 'loc_nyc',
    name: 'New York City',
    country: 'United States',
    co2PerDayPerCapita: 42.1,
    gridIntensityGCO2: 380, // NY grid mix
    regionalEmissionsPerSecond: 1690, // city wide kg/s
    currentAirQuality: 'Moderate (55 AQI)',
    locationNote: 'Significant skyscraper HVAC and heavy urban vehicle density.',
    realtimeAdvice: 'Grid load is high today. Minimize peak hour charging (4 PM - 9 PM) to reduce fossil fuel fallback generation.',
  },
  {
    id: 'loc_london',
    name: 'London',
    country: 'United Kingdom',
    co2PerDayPerCapita: 14.8,
    gridIntensityGCO2: 190, // wind & gas mix
    regionalEmissionsPerSecond: 450,
    currentAirQuality: 'Clean (32 AQI)',
    locationNote: 'Low emission zone policies have successfully reduced diesel smog.',
    realtimeAdvice: 'Generous wind generation is currently feeding the UK grid! Now is an active low-carbon window for heavy appliances.',
  },
  {
    id: 'loc_tokyo',
    name: 'Tokyo',
    country: 'Japan',
    co2PerDayPerCapita: 24.1,
    gridIntensityGCO2: 460, // gas, coal, some solar
    regionalEmissionsPerSecond: 1320,
    currentAirQuality: 'Good (38 AQI)',
    locationNote: 'Highly efficient rail transport offset by extensive carbon-fueled heating.',
    realtimeAdvice: 'Summer heat humidity is elevating grid reserves. Prefer energy-saving mode for HVAC units and eco-schedule electronics.',
  },
  {
    id: 'loc_mumbai',
    name: 'Mumbai',
    country: 'India',
    co2PerDayPerCapita: 5.6,
    gridIntensityGCO2: 720, // heavy coal dependency
    regionalEmissionsPerSecond: 640,
    currentAirQuality: 'Unhealthy (125 AQI)',
    locationNote: 'Low per-capita carbon due to public transit bias, but highly coal-centered grid.',
    realtimeAdvice: 'Grid reliance on thermal power remains very high. Unplugging inactive chargers saves a critical 720g of CO2 per kWh avoided.',
  },
  {
    id: 'loc_paris',
    name: 'Paris',
    country: 'France',
    co2PerDayPerCapita: 13.1,
    gridIntensityGCO2: 55, // heavily Nuclear (low emissions!)
    regionalEmissionsPerSecond: 280,
    currentAirQuality: 'Excellent (25 AQI)',
    locationNote: 'Remarkably low grid footprint due to state nuclear program.',
    realtimeAdvice: 'Power generation is extremely clean today (55g CO2/kWh). Your primary leverage lies in reducing gas heating and private diesel commuter mileage.',
  },
  {
    id: 'loc_berlin',
    name: 'Berlin',
    country: 'Germany',
    co2PerDayPerCapita: 21.4,
    gridIntensityGCO2: 350, // mix of solar, wind, coal
    regionalEmissionsPerSecond: 390,
    currentAirQuality: 'Good (40 AQI)',
    locationNote: 'Prominent bicycle networks, but grid still uses seasonal coal reserves.',
    realtimeAdvice: 'Cloudy weather has lowered solar grid input. Leverage natural light to offset lighting demands.',
  },
  {
    id: 'loc_sydney',
    name: 'Sydney',
    country: 'Australia',
    co2PerDayPerCapita: 39.5,
    gridIntensityGCO2: 610, // coal + expanding solar grids
    regionalEmissionsPerSecond: 520,
    currentAirQuality: 'Good (35 AQI)',
    locationNote: 'Substantial suburban footprints and high fossil air-conditioning reliance.',
    realtimeAdvice: 'High solar output at midday! Run heavy cycles now to match peak local renewable supply.',
  },
];

export const CAUSES_AND_SOLUTIONS: EmissionSourceInfo[] = [
  {
    id: 'transport',
    category: 'commuting',
    title: 'Personal Transport & Commuting',
    cause: 'Burning fossil fuels (petrol and diesel) in internal combustion engines (ICE) releases immense quantities of CO2, nitrogen oxides, and fine particulate matter directly into the lower atmosphere.',
    consequences: 'Vehicle smog degrades respiratory health, forms acid rain, and accounts for over 22% of total global carbon emissions, trapping heat instantly and accelerating local ozone depletion.',
    solutions: [
      'Transition to walking, bicycling, or micro-mobility for short trips under 3 miles.',
      'Utilize mass transit systems (electric buses/subway/trains) which decrease emissions per-capita by up to 85%.',
      'Optimize vehicle maintenance (proper tire inflation, clean filters) and implement carpooling habits.'
    ]
  },
  {
    id: 'electricity',
    category: 'electricity',
    title: 'Household Energy Dependency',
    cause: 'Generating electricity in peak gas/coal plants is highly inefficient. Continuous background usage, poor insulation, water-heaters, and inactive appliances running vampire loads drain the local electrical grid constantly.',
    consequences: 'Constant extraction of coal and natural gas causes water supply degradation, while high peak grid loads trigger expensive, heavy-emissions "peaker" oil plants to start.',
    solutions: [
      'Install LED smart lighting and replace old heavy appliances with Energy Star certified models.',
      'Unplug silent drawing devices (televisions, soundbars, micro-consoles) or use switchable smart power strips.',
      'Improve home air sealing, utilize heavy draft curtains, and lower washing water temperature.'
    ]
  },
  {
    id: 'dietary',
    category: 'diet',
    title: 'Food Supply Chain & Animal Agriculture',
    cause: 'Massive beef, sheep, and dairy farming contributes global methane CH4 (which has 28x the heat-trapping power of CO2). Long-distance cold food transport, global feed crops, and organic decomposition in landfills release greenhouse gases.',
    consequences: 'Deforestation of vital rainforests for grazing land destroys carbon sinks, while decomposing municipal garbage landfills are a primary contributor to human-made climate change.',
    solutions: [
      'Eat more plant-based meals (Vegan or Vegetarian options reduce food emissions by over 60%).',
      'Reduce household food waste by carefully planning meals and utilizing leftover ingredients.',
      'Support local seasonal farmers to reduce cold-storage transit shipping miles.'
    ]
  },
  {
    id: 'travel',
    category: 'travel',
    title: 'Aviation Footprints & Jet-Fuel Combustion',
    cause: 'Aviation accounts for massive emissions per seat, directly deposited into the sensitive radiative altitude regions of the atmosphere that increase warming impacts than surface emissions.',
    consequences: 'High-altitude jet contrails generate thin cirrus clouds that act like heavy insulation sheets, trapping heat that would otherwise escape into space.',
    solutions: [
      'Replace short-haul domestic flights with highly efficient electric high-speed passenger rail systems.',
      'Consolidate travel itineraries into less frequent, longer stays rather than frequent weekend flights.',
      'Work remotely where possible to bypass corporate long-distance flights and single-occupant travel.'
    ]
  }
];

export const INITIAL_COMMENTS: CommentExperience[] = [
  {
    id: 'c_1',
    author: 'Clara Jenkins',
    location: 'London',
    text: 'I started commuting with the cycle network in London after looking at our peak grid offsets here. Saved about 4.5kg CO2e today alone!',
    likes: 18,
    tags: ['commuting', 'electric'],
    date: 'Jun 13, 2026'
  },
  {
    id: 'c_2',
    author: 'Hiroshi Sato',
    location: 'Tokyo',
    text: 'Japan relies heavily on fossil power during summer humidity, but switching my laundry to a cold cycle (30°C) and hang drying made a huge difference on my electric meter metrics.',
    likes: 24,
    tags: ['electricity', 'habits'],
    date: 'Jun 14, 2026'
  },
  {
    id: 'c_3',
    author: 'Amara Diop',
    location: 'Paris',
    text: 'Our grid in France is mostly nuclear so it is very clean, but my main challenge is food systems. Swapped to a vegan lunch today and trimmed my baseline from 5.6kg to 1.5kg!',
    likes: 31,
    tags: ['diet', 'vegan'],
    date: 'Jun 15, 2026'
  },
  {
    id: 'c_4',
    author: 'Marcus Vance',
    location: 'New York City',
    text: 'Unplugged all vampire load electronics in my room, including my gaming console which usually stays on standby. The direct decrease is amazing.',
    likes: 12,
    tags: ['electricity', 'minimalist'],
    date: 'Jun 15, 2026'
  }
];

export const INITIAL_LEADERBOARD: LeaderboardUser[] = [
  { rank: 1, name: 'Sven Lindqvist', location: 'Stockholm, Sweden', dailyAvgKg: 4.2, badgesCount: 5, streakDays: 24 },
  { rank: 2, name: 'Clara Jenkins', location: 'London, UK', dailyAvgKg: 6.8, badgesCount: 4, streakDays: 15 },
  { rank: 3, name: 'Amara Diop', location: 'Paris, France', dailyAvgKg: 7.1, badgesCount: 4, streakDays: 12 },
  { rank: 4, name: 'Hiroshi Sato', location: 'Tokyo, Japan', dailyAvgKg: 9.5, badgesCount: 3, streakDays: 9 },
  { rank: 5, name: 'You (Current Guest)', location: 'Active Region', dailyAvgKg: 18.0, badgesCount: 0, streakDays: 1, isYou: true },
  { rank: 6, name: 'Marcus Vance', location: 'New York, USA', dailyAvgKg: 21.3, badgesCount: 3, streakDays: 6 },
  { rank: 7, name: 'Rajesh Patel', location: 'Mumbai, India', dailyAvgKg: 24.8, badgesCount: 2, streakDays: 4 }
];
