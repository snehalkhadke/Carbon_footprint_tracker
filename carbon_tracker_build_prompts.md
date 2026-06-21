# 🌿 Carbon Footprint Tracker — Complete Build Prompt Series
### Step-by-step prompts to recreate the full project from scratch

---

## HOW TO USE THIS

Copy each prompt **one at a time** into Google AI Studio (or Cursor / Replit AI).  
Wait for the output before moving to the next prompt.  
Each prompt builds directly on the previous one — don't skip.

Tech Stack: **React + TypeScript + Vite + TailwindCSS + Express + Firebase + Gemini AI**

---

---

## PROMPT 1 — Project Scaffold & Base Structure

```
Create a full-stack web app called "EcoTrack — Carbon Footprint Tracker".

Tech stack:
- Frontend: React 19, TypeScript, Vite, TailwindCSS v4
- Backend: Express.js server using TypeScript (server.ts)
- Both run together via a single dev command (tsx server.ts)
- The Express server serves the Vite frontend in development via createViteServer()

Folder structure to create:
/
├── server.ts              ← Express backend (port 3000)
├── vite.config.ts         ← Vite config with React + Tailwind plugins
├── tsconfig.json
├── package.json
├── index.html
├── src/
│   ├── main.tsx           ← React entry point
│   ├── App.tsx            ← Root component with page routing state
│   ├── index.css          ← Global Tailwind base styles
│   ├── types.ts           ← All TypeScript interfaces
│   ├── data.ts            ← Emission constants + static seed data
│   └── lib/
│       └── firebase.ts    ← Firebase init (reads from env vars)
│   └── components/        ← (empty for now)

In package.json, scripts:
- "dev": "tsx server.ts"
- "build": "vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --outfile=dist/server.cjs"
- "start": "node dist/server.cjs"

Dependencies to install:
react, react-dom, typescript, vite, @vitejs/plugin-react, @tailwindcss/vite,
tailwindcss, express, tsx, esbuild, @types/express, @types/node,
firebase, @google/genai, dotenv, lucide-react, motion, recharts

server.ts should:
- Set up Express with express.json() middleware
- Initialize Vite dev server and mount it as middleware
- Listen on PORT 3000
- Have placeholder routes for /api/gemini/analyze and /api/gemini/chat (return 501 for now)
- Read GEMINI_API_KEY from process.env via dotenv

Do not add any UI yet. Just the working scaffold.
```

---

## PROMPT 2 — TypeScript Types & Data Constants

```
Now populate src/types.ts and src/data.ts with all the core data structures and constants.

In src/types.ts, define these interfaces:

1. CommuteData — distance (number), transportType (string), fuelType (string)
2. ElectricityData — monthlyKwh (number), gridMix (string)
3. DietData — dietType (string), localFoodPercent (number), foodWasteLevel (string)
4. TravelData — flightHoursYearly, trainHoursYearly, hotelNightsYearly, monthlyTravelExpenses (all numbers)
5. FootprintEntry — id, date (YYYY-MM-DD string), commuteCO2, electricityCO2, dietCO2, travelCO2, totalCO2 (all numbers)
6. Badge — id, title, description, icon (string), requirementType (union of: 'total_entries' | 'low_carbon_day' | 'all_habits_done' | 'green_commute' | 'diet_warrior'), unlocked (boolean), unlockedDate? (string)
7. SustainableHabit — id, category (union of: 'commuting'|'electricity'|'diet'|'travel'|'lifestyle'), title, description, co2SavedKg (number), completed (boolean)
8. EmissionSourceInfo — id, category, title, cause, consequences, solutions (string[])
9. LocationEnvironmentalData — id, name, country, co2PerDayPerCapita, gridIntensityGCO2, regionalEmissionsPerSecond, locationNote, currentAirQuality, realtimeAdvice
10. ChatMessage — role ('user' | 'model'), parts: { text: string }[]
11. CommentExperience — id, author, location, text, likes, tags (string[]), date
12. LeaderboardUser — rank, name, location, dailyAvgKg, badgesCount, streakDays, isYou? (boolean)

In src/data.ts, export these constants:

COMMUTE_EMISSION_FACTORS: Record<string, number> — kg CO2 per mile for:
petrol_car: 0.24, diesel_car: 0.27, electric_car: 0.06, motorcycle: 0.15,
bus: 0.08, train: 0.04, bicycle_walking: 0.0

DIET_BASE_EMISSIONS: Record<string, number> — daily kg CO2e:
high_meat: 7.2, average_meat: 5.6, low_meat: 3.8, vegetarian: 2.7, vegan: 1.5

FOOD_WASTE_FACTORS: Record<string, number>:
none: 0.0, low: 0.4, medium: 0.9, high: 1.9

INITIAL_BADGES: Badge[] — 5 badges:
1. "First Green Step" — requirementType: total_entries
2. "Carbon Minimalist" — requirementType: low_carbon_day (under 10 kg total)
3. "Plant-Based Champion" — requirementType: diet_warrior (vegetarian/vegan diet)
4. "Sustainably Active" — requirementType: all_habits_done
5. "Active Commuter" — requirementType: green_commute (bicycle/walking/train/bus)

INITIAL_HABITS: SustainableHabit[] — 5 habits across categories:
1. category:diet — "100% Meatless Meals" — co2SavedKg: 2.1
2. category:electricity — "Switch Off Standby Devices" — co2SavedKg: 0.7
3. category:commuting — "Cycle or Walk Today" — co2SavedKg: 1.8
4. category:lifestyle — "Zero Single-Use Plastic" — co2SavedKg: 0.5
5. category:travel — "No Car Day" — co2SavedKg: 2.4

ENVIRONMENTAL_LOCATIONS: LocationEnvironmentalData[] — 8 cities:
Include: Mumbai (India), London (UK), New York (USA), Berlin (Germany),
Beijing (China), São Paulo (Brazil), Lagos (Nigeria), Sydney (Australia)
Each with realistic gridIntensityGCO2 (g CO2/kWh), co2PerDayPerCapita (kg), 
regionalEmissionsPerSecond (kg/sec), and brief locationNote + realtimeAdvice.

INITIAL_COMMENTS: CommentExperience[] — 4 sample community posts
INITIAL_LEADERBOARD: LeaderboardUser[] — 6 users, one with isYou: true
CAUSES_AND_SOLUTIONS: EmissionSourceInfo[] — 4 entries: Transport, Electricity, Diet, Aviation
```

---

## PROMPT 3 — Firebase Auth Setup

```
Set up Firebase authentication in src/lib/firebase.ts.

The file should:
1. Import initializeApp from "firebase/app"
2. Import getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence from "firebase/auth"
3. Import getFirestore from "firebase/firestore"
4. Read Firebase config from environment variables using import.meta.env:
   - VITE_FIREBASE_API_KEY
   - VITE_FIREBASE_AUTH_DOMAIN
   - VITE_FIREBASE_PROJECT_ID
   - VITE_FIREBASE_STORAGE_BUCKET
   - VITE_FIREBASE_MESSAGING_SENDER_ID
   - VITE_FIREBASE_APP_ID
5. Initialize the Firebase app with these config values
6. Export: auth, db (Firestore), googleProvider (GoogleAuthProvider instance)
7. Call setPersistence(auth, browserLocalPersistence) to keep users logged in

Also update App.tsx to:
- Import { auth, googleProvider } from './lib/firebase'
- Import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth'
- Add useState for: user (FirebaseUser | null) and authLoading (boolean, starts true)
- Use useEffect with onAuthStateChanged to track auth state, set authLoading to false when resolved
- Add handleSignIn() that calls signInWithPopup(auth, googleProvider)
- Add handleSignOut() that calls signOut(auth)
- Pass user, authLoading, handleSignIn, handleSignOut as props/state for later use

Create a .env.local file template (without real values) showing what env vars are needed.
Create firestore.rules with this security rule:
  allow read, write: if request.auth != null && request.auth.uid == userId;
  (scoped to match /users/{userId} documents)
```

---

## PROMPT 4 — Main App Shell & Navigation

```
Build the App.tsx shell with full navigation structure.

The app should have these top-level navigation tabs:
1. Home (icon: Home) — Hero landing section
2. Calculators (icon: Footprints) — Emission calculators  
3. Dashboard (icon: BarChart3) — Personal analytics
4. Live Data (icon: Globe) — Live city emissions
5. Habits & Causes (icon: CheckCircle) — Habit tracker
6. AI Advisor (icon: Sparkles) — Gemini AI agent
7. Community (icon: Award) — Community hub

Visual design:
- Dark theme: background color #030a05 (near black with green tint)
- Accent: lime-400 (#a3e635) and emerald-500
- Font: system font stack, with font-bold for headings
- Bottom navigation bar on mobile, sidebar or top nav on desktop
- Glassmorphism cards: bg-[#0b100c]/70 backdrop-blur-md border border-emerald-500/10

App state to manage (useState):
- activeTab: string (default 'home')
- selectedLocation: LocationEnvironmentalData (default ENVIRONMENTAL_LOCATIONS[0])
- dailyGoal: number (default 15 kg CO2/day)
- logs: FootprintEntry[] (persisted to localStorage key 'eco_carbon_logs_v1')
- habits: SustainableHabit[] (persisted to localStorage key 'eco_carbon_habits_v1')  
- badges: Badge[] (persisted to localStorage key 'eco_carbon_badges_v1')
- currentCalculators: object with commuteCO2, electricityCO2, dietCO2, travelCO2, totalCO2

Badge unlock logic (run in useEffect whenever logs or habits change):
- total_entries: unlock if logs.length >= 1
- low_carbon_day: unlock if any log has totalCO2 < 10
- diet_warrior: unlock if any calculator session used 'vegetarian' or 'vegan'
- all_habits_done: unlock if all habits are completed
- green_commute: unlock based on transport type selection

Helper: handleLogEntry(entry) — adds new FootprintEntry to logs with auto-generated id and today's date
Helper: handleToggleHabit(id) — flips completed boolean for a habit
Helper: handleDeleteLog(id) — removes a log entry by id

Header should show:
- App name "EcoTrack" with leaf icon
- Location selector dropdown (from ENVIRONMENTAL_LOCATIONS)
- Google Sign In / Sign Out button (using user state from Prompt 3)
- User's display name and photo if signed in

Use AnimatePresence + motion.div from "motion/react" to animate tab transitions.
```

---

## PROMPT 5 — Emission Calculators Component

```
Build src/components/Calculators.tsx — the 4-section carbon emission calculator.

Props interface CalculatorsProps:
- selectedLocation: LocationEnvironmentalData
- onLogEntry: (entry: Omit<FootprintEntry, 'id' | 'date'>) => void
- onCalculatorChange: (values: { commuteCO2, electricityCO2, dietCO2, travelCO2, totalCO2 }) => void

The component has 4 expandable calculator sections using tab/accordion UI:

SECTION 1 — COMMUTE CALCULATOR
State: commuteDistance (default 15), transportType (default 'petrol_car')
Transport options: Petrol Car, Diesel Car, Electric Car, Motorcycle, Bus, Train, Bicycle/Walking
Formula: commuteEmissions = commuteDistance * COMMUTE_EMISSION_FACTORS[transportType]
UI: Slider for distance (0-100 miles), radio buttons or select for transport type
Show result: X kg CO2e/day

SECTION 2 — ELECTRICITY CALCULATOR
State: monthlyKwh (default 450)
Formula: electricityEmissions = (monthlyKwh * selectedLocation.gridIntensityGCO2 / 1000) / 30
Note: Grid intensity comes from the selected LOCATION — changing city changes emissions!
UI: Number input for kWh/month, show the current grid mix label
Display: "Your grid: X g CO2/kWh (location name)"

SECTION 3 — DIET CALCULATOR
State: dietType (default 'average_meat'), localFoodPercent (default 40), foodWasteLevel (default 'low')
Diet options: High Meat, Average Meat, Low Meat (Flexitarian), Vegetarian, Vegan
Formula:
  base = DIET_BASE_EMISSIONS[dietType]
  localDiscount = 1 - (localFoodPercent * 0.15 / 100)  ← up to 15% discount
  dietEmissions = (base * localDiscount) + FOOD_WASTE_FACTORS[foodWasteLevel]
UI: Radio buttons for diet type, slider for local food %, select for waste level

SECTION 4 — TRAVEL CALCULATOR
State: flightHours (10), trainHours (20), hotelNights (8), monthlyExpenses (150)
Formula:
  travelEmissions = (flightHours * 0.255 / 365) + (trainHours * 0.006 / 365) + (hotelNights * 20.4 / 365) + (monthlyExpenses * 0.00412 / 30)
UI: 4 number inputs with labels

SUMMARY BAR (always visible at bottom):
- Show all 4 values in colored cards
- Show TOTAL CO2e/day in large number
- "Log Today's Footprint" button → calls onLogEntry with all 4 values + total
- Show a color-coded status: green (<10 kg), yellow (10-20 kg), red (>20 kg)

Use useEffect to recalculate each section whenever inputs change.
Call onCalculatorChange() whenever any value updates so App.tsx stays in sync.
```

---

## PROMPT 6 — Dashboard & Analytics Component

```
Build src/components/Dashboard.tsx — personal carbon analytics dashboard.

Props interface DashboardProps:
- currentEmissions: { commuteCO2, electricityCO2, dietCO2, travelCO2, totalCO2 }
- dailyGoal: number
- onDailyGoalChange: (val: number) => void
- logs: FootprintEntry[]
- onDeleteLog: (id: string) => void
- badges: Badge[]
- habits: SustainableHabit[]

Import these from lucide-react: Footprints, Leaf, Sprout, CheckCircle, Bike, Trash2, Award, Target, Trophy

Create an IconMap: Record<string, React.ComponentType> that maps icon name strings to Lucide components for badge rendering.

PANEL 1 — Daily Carbon Budget Gauge (takes 2/3 width on desktop)
- Show totalCO2 vs dailyGoal
- A progress bar: (totalCO2 / dailyGoal) * 100, capped at 100%
- Color: green if under goal, amber if 80-100%, red if over
- Show "X kg / Y kg goal" label
- Editable daily goal: small input or +/- buttons (calls onDailyGoalChange)
- Show "UNDER BUDGET" or "OVER BUDGET by Z kg" status text

PANEL 2 — Emissions Breakdown (4 colored cards)
- Commute (blue), Electricity (yellow), Diet (green), Travel (orange)
- Each shows kg CO2e/day and icon
- Show which is the highest driver with a subtle highlight

PANEL 3 — 7-Day History Chart
- Use recharts AreaChart or BarChart
- X axis: dates, Y axis: totalCO2 (kg)
- Show last 7 log entries
- Reference line at dailyGoal value
- Empty state: "No logs yet. Use the Calculators tab to log your first day."

PANEL 4 — Log History Table
- List all logs in reverse chronological order
- Each row: date | commute | electricity | diet | travel | total | delete button
- Delete button calls onDeleteLog(id) with trash icon
- Show total count: "X days tracked"

PANEL 5 — Badges (grid layout)
- Show all badges as cards
- Unlocked: bright lime border, icon colored, show unlock date
- Locked: grayscale, "🔒 Locked" label
- Show badge title + description below icon

PANEL 6 — Habit Summary
- Show count of completed habits vs total
- Show total CO2 saved today from completed habits
- List habits with checkmark status (read-only here, toggle is in HabitsAndCauses)
```

---

## PROMPT 7 — Live Ticker & Location Component

```
Build src/components/LiveTicker.tsx — real-time city emissions counter.

Props interface LiveTickerProps:
- selectedLocation: LocationEnvironmentalData
- onLocationChange: (location: LocationEnvironmentalData) => void

The component shows a live running counter of emissions from the selected city/region.

State:
- cumulativeEmissions: number (starts at 0)
- A ref timerRef for the interval

Logic:
- On selectedLocation change: reset cumulativeEmissions to 0, clear old interval
- Start new setInterval every 100ms:
  valPerTick = selectedLocation.regionalEmissionsPerSecond * (100 / 1000)
  cumulativeEmissions += valPerTick
- Clean up interval on unmount

UI Layout:
- Large animated number showing cumulativeEmissions (formatted with toLocaleString(), 2 decimals)
- Label: "kg CO₂ emitted by [city] since you opened this page"
- Location info panel:
  - City name + country
  - Grid intensity: X g CO2/kWh
  - Avg per capita: X kg CO2/day
  - Air quality status
  - Realtime advice text
- Location selector: dropdown or tab-style buttons for all ENVIRONMENTAL_LOCATIONS
  - Clicking a city calls onLocationChange and resets the counter
- Show a pulsing dot animation (CSS) next to "LIVE" label
- Background: dark glassmorphism card with subtle green glow

Styling note: Use a monospace font for the running number to prevent layout jump.
The counter number should update smoothly — consider CSS transition on the number element.
```

---

## PROMPT 8 — Live City Air Quality Component

```
Build src/components/LiveCityEmissions.tsx — real-time air quality data fetcher.

This component fetches LIVE data from two free APIs (no API key needed):
1. Open-Meteo Geocoding API: https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1
2. Open-Meteo Air Quality API: https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lat}&longitude={lon}&current=carbon_monoxide,nitrogen_dioxide,ozone,pm10,pm2_5,european_aqi&hourly=carbon_monoxide&past_days=3

State:
- city: string (user input)
- loading: boolean
- error: string | null
- data: { location, country, airQuality: AirQualityData, hourlyData: HourlyData[] } | null
- isExporting: boolean

Interfaces:
AirQualityData: { time, carbon_monoxide, nitrogen_dioxide, ozone, pm10, pm2_5, european_aqi }
HourlyData: { time: string, co: number }

fetchCityData flow:
1. Validate city input (not empty)
2. Fetch geocoding API → extract latitude, longitude, country
3. Fetch air quality API with those coordinates
4. Parse current air quality + hourly CO data (last 72 entries for the chart)
5. Set data state

UI:
- Search bar with city name input + "Fetch Live Data" button
- Loading skeleton while fetching
- Error message if API fails
- Results panel:
  - City name + country + coordinates
  - 6 metric cards: CO, NO2, Ozone, PM10, PM2.5, AQI
    - Each card shows the value + unit + a color-coded risk level (low/medium/high/very high)
    - AQI color: 0-50 green, 51-100 yellow, 101-150 orange, 150+ red
  - Recharts AreaChart of hourly CO over last 72 hours:
    - XAxis: time labels (show every 12h)
    - YAxis: CO value in μg/m³
    - Tooltip showing time + CO value
    - Gradient fill: green to amber
  - Export to PNG button — use dom-to-image-more library:
    import domtoimage from 'dom-to-image-more'
    const url = await domtoimage.toPng(chartRef.current)
    → download as carbon_chart.png

Add import AnimatePresence, motion from 'motion/react' for smooth data reveal animation.
```

---

## PROMPT 9 — Habits & Causes Component

```
Build src/components/HabitsAndCauses.tsx — daily habit tracker + emission education.

Props interface HabitsAndCausesProps:
- habits: SustainableHabit[]
- onToggleHabit: (id: string) => void
- onResetHabits?: () => void
- onSelectAllHabits?: () => void

The component has two tabs: "Active Life Habit Tracker" and "Emission Causes & Global Solutions"

TAB 1 — HABIT TRACKER

For each habit in habits array:
- Show a checkbox (square when uncompleted, checkmark when completed)
- Habit title + description
- co2SavedKg badge (e.g. "saves 2.1 kg CO2")
- Category badge: color-coded pill (commuting=blue, electricity=yellow, diet=green, travel=orange, lifestyle=purple)
- Clicking toggles onToggleHabit(habit.id)

Bottom summary row:
- "X/5 habits completed today"
- "Saving X.X kg CO₂ today" (sum of completed habits' co2SavedKg)
- "Reset All" button (calls onResetHabits)
- "Complete All" button (calls onSelectAllHabits)

Completed habits should have a subtle lime-green highlight background.
Use motion.div for a smooth toggle animation when checking/unchecking.

TAB 2 — EMISSION CAUSES & SOLUTIONS

Map over CAUSES_AND_SOLUTIONS (from data.ts). For each EmissionSourceInfo show:
- Category pill + icon
- Title (e.g. "Road Transport", "Residential Electricity")
- Cause section: 2-3 sentence explanation
- Consequences section with a warning-colored card
- Solutions list: bulleted list of 3-4 actionable steps

Use accordion expand/collapse — click a cause card to expand its full details.
Show only title + category when collapsed.

Visual design:
- Habits: checklist style, lime accents for completed
- Causes: dark cards with category-colored left border
- Solutions: emerald bullet points with leaf icon prefix
```

---

## PROMPT 10 — Atmosphere 3D Globe Component

```
Build src/components/Atmosphere3D.tsx — interactive 3D atmospheric climate visualizer.

This is a PURE CSS + SVG 3D globe (no Three.js). It simulates atmospheric layers.

Props interface Atmosphere3DProps:
- currentTotalEmissions: number (kg CO2/day from calculators)
- selectedLocationName: string
- gridIntensity: number (g CO2/kWh)

State:
- rotationY: number (0)
- rotationX: number (15)
- isDragging: boolean
- activeLayer: 'ozone' | 'geothermal' | 'glacier' | 'aerosols'
- simulatedYear: number (2026)
- autoRotate: boolean (true)

Physics:
- rotationSpeed = 0.2 + (currentTotalEmissions * 0.03)  ← emissions make the globe spin faster
- yearScale = 1 + (simulatedYear - 2026) * 0.05
- durationSec = Math.max(2, 360 / (rotationSpeed * 60))
- CSS animation: @keyframes globeSpin with the computed duration

3D Globe rendering using CSS transforms:
- Main sphere: 240px diameter circle with radial gradient
  - Color shifts based on emissions: green (low) → yellow → orange → red (high)
  - Background gradient: at 60% opacity based on gridIntensity
- Atmosphere ring: slightly larger circle with blur and color overlay
- 3 latitude arc lines (SVG ellipses) to show globe curvature
- Continents: simple SVG path blobs in darker green
- Polar ice caps: white SVG ellipses at top/bottom that shrink as simulatedYear increases
- Cloud layer: animated white blobs with opacity tied to emissions level

Drag rotation:
- onMouseDown: save dragStart coords, setIsDragging(true), setAutoRotate(false)
- onMouseMove: compute delta from start, update rotationX/rotationY
- onMouseUp/Leave: setIsDragging(false)
- Apply transform: rotateX(${rotationX}deg) rotateY(${rotationY}deg) to globe wrapper

Layer selector (4 tabs below globe):
- Ozone: show "Ozone depletion index: X% (estimated from emissions)"
- Geothermal: show "Surface heat anomaly: +X°C above baseline"
- Glacier: show "Ice mass retention: X% (shrinks with simulatedYear)"
- Aerosols: show "Particulate density: X μg/m³"

Year slider (2026–2100):
- Shows how emissions compound over time
- Ice caps shrink, atmosphere reddening increases as year goes up
- "Climate Projection: Year [simulatedYear]"

Emission impact legend:
- Show a color scale bar from green to red
- Mark current emissions position on the scale
- Labels: "Climate-Safe (<10 kg)" → "High Impact (>25 kg)"

Make it responsive and mobile touch-friendly (use onTouchStart/Move/End events too).
```

---

## PROMPT 11 — AI Agent Component (Gemini-Powered)

```
Build src/components/AIAgent.tsx — Gemini AI climate advisor with two modes.

Props interface AIAgentProps:
- currentEmissions: { commuteCO2, electricityCO2, dietCO2, travelCO2, totalCO2 }
- selectedLocation: LocationEnvironmentalData
- habits: SustainableHabit[]
- dailyGoal: number

Interface AnalysisResult:
{ score: string, biggestDriver: string, tips: string[], regionalInsight: string }

STATE:
Analysis mode:
- analysis: AnalysisResult | null
- loadingAnalysis: boolean
- errorAnalysis: string | null

Chat mode:
- chatMessages: ChatMessage[] — initialize with one model greeting message:
  "Hello! I am your AI Climate Advisor. Ask me anything about carbon emissions, green diets, transport choices, or renewable energy."
- chatInput: string
- sendingChat: boolean

PART 1 — ANALYSIS PANEL:
"Analyze My Footprint" button:
- POST to /api/gemini/analyze with body: { currentEmissions, location: selectedLocation, habits, dailyGoal }
- On success: display analysis result
- On error: show errorAnalysis message with retry button

Analysis result display:
- Score card: large grade letter (A+, A, B+, B, C, D, F) with color coding
- Biggest driver card: which emission category is highest and why
- Tips list: 3 bullet points with leaf icon, each tip in a card
- Regional insight: location-specific climate fact
- "Re-analyze" button to refresh

PART 2 — CHAT PANEL:
Scrollable message history:
- User messages: right-aligned, lime/green background
- Model messages: left-aligned, dark card with bot icon
- Auto-scroll to bottom on new messages using useRef + scrollIntoView

Input form:
- Text input + "Send" button
- On send: POST to /api/gemini/chat with body: { message: userText, history: chatMessages }
- Append user message immediately, then append model response when received
- Show "typing..." indicator while sendingChat is true
- Disable input while sendingChat

LAYOUT:
- Two-column layout on desktop: Analysis left | Chat right
- Single column on mobile: Analysis on top, Chat below
- Header: sparkles icon + "AI Climate Advisor" title + small badge "Powered by Gemini"

Error states: friendly message explaining GEMINI_API_KEY needs to be set in environment.
```

---

## PROMPT 12 — Backend: Gemini API Routes

```
Complete server.ts with the two Gemini AI API endpoints.

Read GEMINI_API_KEY from process.env. Initialize @google/genai:
import { GoogleGenAI, Type } from "@google/genai"
const aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "dummy_key" })

Implement lazy initialization: only create the client when first needed.

ENDPOINT 1: POST /api/gemini/analyze
Request body: { currentEmissions, location, habits, dailyGoal }

Build this system prompt for Gemini:
"You are a climate science expert analyzing a user's carbon footprint data.
Respond ONLY with a JSON object — no markdown, no preamble.
JSON structure: { score: string, biggestDriver: string, tips: string[], regionalInsight: string }
- score: a letter grade (A+, A, B+, B, C+, C, D, F) with one sentence explanation
- biggestDriver: identify which of commute/electricity/diet/travel is highest, explain why in 1 sentence
- tips: exactly 3 specific, actionable suggestions as strings
- regionalInsight: one fact about emissions in the user's city/country"

User prompt: stringify the emissions data + location + habits summary

Model cascade: try gemini-2.5-flash first, fallback to gemini-2.5-pro, then gemini-2.0-flash
Parse the JSON response (strip ```json fences if present).

ALGORITHMIC FALLBACK (if no API key or all models fail):
- Compute grade based on totalCO2 vs dailyGoal ratio
- Find highest emission category
- Return pre-written tips based on highest category
- Return location-specific regional insight from the location data

Return the AnalysisResult JSON.

ENDPOINT 2: POST /api/gemini/chat
Request body: { message: string, history: ChatMessage[] }

System prompt:
"You are EcoTrack AI — a friendly, expert climate advisor. 
Keep responses under 150 words. Be encouraging and specific.
Focus on practical carbon reduction strategies."

Build the conversation history from request body + new user message.
Use generateContent with the full conversation (multi-turn).
Return: { reply: string }

Same model cascade as above.
Algorithmic fallback: return a contextually relevant tip based on keywords in the message.

Add error handling with proper HTTP status codes (400, 500).
Log errors but don't expose stack traces in the response.
```

---

## PROMPT 13 — Community Hub Component

```
Build src/components/CommunityHub.tsx — community experiences + leaderboard.

Props interface CommunityHubProps:
- logs: FootprintEntry[]
- badges: Badge[]
- selectedLocation: string

Two sub-tabs: "Citizen Experiences" and "Carbon Leaderboard"

SUB-TAB 1 — CITIZEN EXPERIENCES

State:
- comments: CommentExperience[] — initialized from localStorage key 'eco_carbon_comments_v1', fallback to INITIAL_COMMENTS
- authorName: string, experienceText: string, selectedTag: string (default 'habits')
- searchQuery: string
- likedComments: Record<string, boolean>

Tags available: ['habits', 'diet', 'electricity', 'transport', 'travel', 'tips']

Post form:
- Input: "Your name" (authorName)
- Textarea: "Share your green experience..." (experienceText)
- Tag selector: pill buttons for each tag
- "Share Experience" button → creates new CommentExperience, prepends to comments, saves to localStorage

Comment card (for each comment):
- Author name (bold) + location + date
- Experience text
- Tags as colored pills
- Like button with heart icon: shows likes count, clicking increments and saves likedComments state
- Liked comments get a filled heart icon (red)

Real-time search bar:
- Filter comments by: author name, text content, or tags
- Show "X results" count

SUB-TAB 2 — CARBON LEADERBOARD

Dynamic leaderboard — compute user's row from logs + badges:
- yourStats.avg = average totalCO2 from logs (or 18.0 if no logs)
- yourStats.badges = count of unlocked badges
- yourStats.streak = min(30, max(1, logs.length * 2))

Merge into INITIAL_LEADERBOARD: update the row where isYou === true with live values.
Sort by dailyAvgKg ascending (lowest emissions = rank 1).
Reassign rank numbers after sort.

Leaderboard table columns:
- Rank (1, 2, 3 get trophy icons: gold, silver, bronze)
- Name (YOUR row highlighted in lime)
- Location
- Daily Avg (kg CO2e) — color coded: green <12, yellow 12-20, red >20
- Badges count
- Streak days

Show user's current rank prominently at top: "You are currently ranked #X globally"

Personal summary card (above leaderboard):
- Show user's badge count, streak, and avg emissions
- Motivational message based on rank ("Top 10% — Keep it up!")
```

---

## PROMPT 14 — Home / Hero Page

```
Build the Home tab content inside App.tsx (or a separate src/components/Home.tsx).

The home tab is the landing experience users see first.

HERO SECTION:
- Full-width banner with a background image (eco_forest or earth globe)
- Overlaid dark gradient: from-[#030a05]/90 via-[#030a05]/60 to-transparent
- Headline: "Track Your Carbon. Heal the Planet."
- Subheadline: "Understand your daily CO₂ footprint and build greener habits — one day at a time."
- Two CTA buttons:
  1. "Start Tracking" → switches to Calculators tab
  2. "View Live Data" → switches to Live Data tab
- Animate in with motion.div: opacity 0→1, y: 30→0, duration 0.8s

STATS ROW (if logs exist):
- "Days Tracked: X"
- "Total CO₂ Logged: X kg"
- "Habits Completed: X"
- "Badges Earned: X"
Each stat in a glassmorphism card. If no logs: show "Start your journey" placeholder.

LIVE TICKER PREVIEW:
- Embed the LiveTicker component here (show the real-time city counter)
- This is the "wow factor" first thing users see updating live

QUICK ACTIONS GRID (2x2 or 2x3):
- Log Today (→ Calculators tab)
- View Dashboard (→ Dashboard tab)
- Check Air Quality (→ Live Data tab)
- Ask AI Advisor (→ AI Advisor tab)
Each card: icon + title + short description + arrow
Hover animation: slight lift (translateY: -4px)

LOCATION CONTEXT:
- Show currently selected location's daily per-capita average
- Show "Your goal: X kg/day" with edit option
- Simple progress bar: currentTotal vs dailyGoal

SIGN IN PROMPT (if not signed in):
- Subtle card at bottom: "Sign in with Google to sync your data across devices"
- Google G icon + "Continue with Google" button
- If signed in: show user avatar + "Welcome back, [name]!"
```

---

## PROMPT 15 — Polish, Animations & Responsive Design

```
Final polish pass on the entire EcoTrack app.

1. GLOBAL ANIMATIONS
Add to every major section mount:
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

For tab transitions use AnimatePresence with exit={{ opacity: 0, x: -20 }}

Add staggered animation to list items (badge grid, habit list, leaderboard):
  transition={{ delay: index * 0.05 }}

2. RESPONSIVE LAYOUT
Mobile (< 768px):
- Bottom navigation bar (fixed, 5 main tabs with icons only)
- Stack all panels vertically
- Calculator sections: full-width accordion instead of side-by-side

Desktop (>= 768px):
- Top navigation bar with full labels
- Dashboard: 3-column grid
- Community: 2-column layout (form left, feed right)
- AI Advisor: 2-column (analysis left, chat right)

3. EMPTY STATES
For every list/chart with no data:
- Dashboard history chart: "No footprint logged yet. Head to Calculators to start."
- Community feed: "Be the first to share your green journey!"
- Badges (all locked): "Complete activities to unlock your first badge."
Include a relevant icon and CTA button in each empty state.

4. LOADING STATES
- Skeleton cards (animate-pulse gray blocks) while Firebase auth loads
- Chat typing indicator: 3 bouncing dots while AI responds
- Button disabled + spinner icon while API calls are in flight

5. COLOR & THEME CONSISTENCY
Dark background: #030a05 (root), #0b100c (cards)
Accents: lime-400 for primary actions, emerald-500 for borders/glows
Text: white (headings), zinc-300 (body), zinc-500 (labels)
Danger/over-budget: red-400
Warning/near-limit: amber-400

6. HEADER IMPROVEMENTS
- On scroll: header becomes more opaque (backdrop-blur increases)
- User avatar: circular crop, 32px, with green ring if signed in
- Location dropdown: searchable, shows country flag emoji + city name

7. FOOTER
Simple 1-line footer: "EcoTrack © 2026 — Data from Open-Meteo & Gemini AI | Built with React + Firebase"

8. PERFORMANCE
- Wrap heavy components (Atmosphere3D, recharts) in React.lazy + Suspense
- Memoize leaderboard sort with useMemo
- Debounce search input in CommunityHub (300ms)

9. ACCESSIBILITY
- All interactive elements have aria-labels
- Color is never the only indicator (always add icon or text)
- Focus rings visible on keyboard navigation (outline-lime-400)
```

---

## PROMPT 16 — Security Hardening & Deployment Config

```
Harden the project security and prepare it for deployment on Netlify.

1. ENVIRONMENT VARIABLES — remove all hardcoded secrets

In src/lib/firebase.ts, use import.meta.env.VITE_* variables (never hardcode API keys):
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

In server.ts, use process.env.GEMINI_API_KEY (already env-based — verify this).

2. GITIGNORE — ensure these are ALL blocked:
.env
.env.local
.env.production
.env.development
.env*
!.env.example
firebase-applet-config.json
*.json (only if it contains credentials — use more specific name)

3. CREATE .env.example (commit this, it shows shape without values):
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
GEMINI_API_KEY=your_gemini_api_key

4. NETLIFY DEPLOYMENT
Create netlify.toml:
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

5. FIREBASE SECURITY RULES (firestore.rules):
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}

6. README.md — complete setup instructions:
- Clone repo
- npm install
- Copy .env.example to .env.local and fill in values
- Set up Firebase project (enable Google Auth + Firestore)
- Get Gemini API key from Google AI Studio
- npm run dev
- Deployment: push to GitHub → connect to Netlify → add env vars in Netlify dashboard

7. Add input validation in server.ts:
- Check all required fields exist before processing
- Return 400 with specific error message if missing
- Sanitize strings (trim, max length check) before sending to Gemini
- Rate limit hint: add a comment noting production should add express-rate-limit
```

---

## QUICK REFERENCE — What Each Prompt Builds

| Prompt | What You Get |
|--------|-------------|
| 1 | Project scaffold, Vite + Express setup |
| 2 | All TypeScript types + data constants |
| 3 | Firebase Auth (Google Sign-In) |
| 4 | App shell, navigation, global state |
| 5 | 4-section emission calculators |
| 6 | Dashboard with charts + badges |
| 7 | Live city ticker component |
| 8 | Open-Meteo air quality fetcher + chart |
| 9 | Habit tracker + causes education |
| 10 | CSS 3D globe visualizer |
| 11 | Gemini AI chat + analysis UI |
| 12 | Express backend Gemini endpoints |
| 13 | Community feed + leaderboard |
| 14 | Home/hero landing page |
| 15 | Animations, responsive, polish |
| 16 | Security hardening + Netlify deploy |

---

*Total: 16 prompts → full production-ready Carbon Footprint Tracker*
