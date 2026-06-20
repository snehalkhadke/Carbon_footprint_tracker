import React, { useState, useEffect } from 'react';
import { Leaf, Award, Footprints, Sparkles, AlertCircle, BarChart3, HelpCircle, CheckCircle, Home, User, ArrowRight, Flame, Settings, Globe, LogIn, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
// @ts-ignore
import ecoBg from './assets/images/eco_forest_bg_1781528950037.jpg';
// @ts-ignore
import earthGlobeImg from './assets/images/earth_globe_concept_1781530120880.jpg';
import { LocationEnvironmentalData, FootprintEntry, Badge, SustainableHabit } from './types';
import { ENVIRONMENTAL_LOCATIONS, INITIAL_BADGES, INITIAL_HABITS } from './data';
import { LiveTicker } from './components/LiveTicker';
import { LiveCityEmissions } from './components/LiveCityEmissions';
import { Calculators } from './components/Calculators';
import { Dashboard } from './components/Dashboard';
import { HabitsAndCauses } from './components/HabitsAndCauses';
import { AIAgent } from './components/AIAgent';
import { CommunityHub } from './components/CommunityHub';
import { Atmosphere3D } from './components/Atmosphere3D';

import { auth, googleProvider } from './lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const [selectedLocation, setSelectedLocation] = useState<LocationEnvironmentalData>(ENVIRONMENTAL_LOCATIONS[0]);
  const [dailyGoal, setDailyGoal] = useState<number>(15);

  // Load state from localStorage or use defaults
  const [logs, setLogs] = useState<FootprintEntry[]>(() => {
    try {
      const saved = localStorage.getItem('eco_carbon_logs_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [habits, setHabits] = useState<SustainableHabit[]>(() => {
    try {
      const saved = localStorage.getItem('eco_carbon_habits_v1');
      return saved ? JSON.parse(saved) : INITIAL_HABITS;
    } catch {
      return INITIAL_HABITS;
    }
  });

  const [badges, setBadges] = useState<Badge[]>(() => {
    try {
      const saved = localStorage.getItem('eco_carbon_badges_v1');
      return saved ? JSON.parse(saved) : INITIAL_BADGES;
    } catch {
      return INITIAL_BADGES;
    }
  });

  // Keep track of active current calculator values (real-time estimates)
  const [currentCalculators, setCurrentCalculators] = useState({
    commuteCO2: 3.6, // Default fallback
    electricityCO2: 6.0,
    dietCO2: 5.6,
    travelCO2: 2.8,
    totalCO2: 18.0
  });

  // Persist logs in localStorage
  useEffect(() => {
    localStorage.setItem('eco_carbon_logs_v1', JSON.stringify(logs));
  }, [logs]);

  // Persist habits
  useEffect(() => {
    localStorage.setItem('eco_carbon_habits_v1', JSON.stringify(habits));
  }, [habits]);

  // Persist badges
  useEffect(() => {
    localStorage.setItem('eco_carbon_badges_v1', JSON.stringify(badges));
  }, [badges]);

  // Handle location update, matching default calculators relative to grid
  const handleLocationChange = (loc: LocationEnvironmentalData) => {
    setSelectedLocation(loc);
  };

  // Habit Toggle trigger
  const handleToggleHabit = (id: string) => {
    const updatedHabits = habits.map(h => h.id === id ? { ...h, completed: !h.completed } : h);
    setHabits(updatedHabits);
    
    // Check if "all_habits_done" requirement triggered
    const allDone = updatedHabits.every(h => h.completed);
    if (allDone) {
      unlockBadge('badge_4'); // Sustainably Active Badge
    }
  };

  // Habit Reset trigger
  const handleResetHabits = () => {
    const updatedHabits = habits.map(h => ({ ...h, completed: false }));
    setHabits(updatedHabits);
  };

  // Habit Select All trigger
  const handleSelectAllHabits = () => {
    const updatedHabits = habits.map(h => ({ ...h, completed: true }));
    setHabits(updatedHabits);
    unlockBadge('badge_4'); // Sustainably Active Badge
  };

  // Helper to unlock badges
  const unlockBadge = (badgeId: string) => {
    setBadges((prevBadges) => 
      prevBadges.map((b) => {
        if (b.id === badgeId && !b.unlocked) {
          return {
            ...b,
            unlocked: true,
            unlockedDate: new Date().toLocaleDateString(),
          };
        }
        return b;
      })
    );
  };

  // Handle Posting a new Entry
  const handleLogEntry = (entry: Omit<FootprintEntry, 'id' | 'date'>) => {
    const newEntry: FootprintEntry = {
      id: `log_${Date.now()}`,
      date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      ...entry
    };

    const updatedLogs = [newEntry, ...logs];
    setLogs(updatedLogs);

    // Dynamic calculator sync
    setCurrentCalculators({
      commuteCO2: entry.commuteCO2,
      electricityCO2: entry.electricityCO2,
      dietCO2: entry.dietCO2,
      travelCO2: entry.travelCO2,
      totalCO2: entry.totalCO2
    });

    // --- Badge Unlock Evaluations ---
    
    // 1. First Green Step
    if (updatedLogs.length >= 1) {
      unlockBadge('badge_1');
    }

    // 2. Carbon Minimalist (total CO2 below 10kg)
    if (entry.totalCO2 < 10) {
      unlockBadge('badge_2');
    }

    // 3. Plant-Based champion tracker
    // Let's assume if diet metric is particularly low (under vegetarian 2.7kg marker), user qualifies
    if (entry.dietCO2 < 3.0) {
      unlockBadge('badge_3');
    }

    // 4. Active Transit commute
    // If transport factor of the day is low or zero car emission
    if (entry.commuteCO2 === 0 || entry.commuteCO2 < 3.5) {
      unlockBadge('badge_5');
    }
  };

  // Delete specific Daily Log
  const handleDeleteLog = (id: string) => {
    setLogs(logs.filter(l => l.id !== id));
  };

  // Active Tab state for panel tabs switcher
  const [activeTab, setActiveTab] = useState<'home' | 'regional' | 'track' | 'habits' | 'ai' | 'community'>('home');

  // Custom User Name and Tracker Collective Name
  const [userName, setUserName] = useState<string>(() => {
    try {
      return localStorage.getItem('co2_user_name_v1') || 'Eco Citizen';
    } catch {
      return 'Eco Citizen';
    }
  });

  const [trackerName, setTrackerName] = useState<string>(() => {
    try {
      return localStorage.getItem('co2_tracker_name_v1') || 'My Carbon Footprint Tracker';
    } catch {
      return 'My Carbon Footprint Tracker';
    }
  });

  // Trackers historical name list for setup reference
  const [savedTrackerNames, setSavedTrackerNames] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('co2_saved_names_v1');
      return saved ? JSON.parse(saved) : ['My Carbon Footprint Tracker', 'Family Greenhouse Log', 'Berlin Carbon Cooperative'];
    } catch {
      return ['My Carbon Footprint Tracker', 'Family Greenhouse Log', 'Berlin Carbon Cooperative'];
    }
  });

  // Persist names
  useEffect(() => {
    localStorage.setItem('co2_user_name_v1', userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem('co2_tracker_name_v1', trackerName);
    if (trackerName.trim() && !savedTrackerNames.includes(trackerName.trim())) {
      const updated = [...savedTrackerNames, trackerName.trim()];
      setSavedTrackerNames(updated);
      localStorage.setItem('co2_saved_names_v1', JSON.stringify(updated));
    }
  }, [trackerName]);

  // Computed net daily footprint deducting completed habit saves
  const totalHabitsSaving = habits.filter(h => h.completed).reduce((acc, h) => acc + h.co2SavedKg, 0);
  const netCO2 = Math.max(0, currentCalculators.totalCO2 - totalHabitsSaving);

  return (
    <div className="min-h-screen bg-[#020503] text-stone-200 flex flex-col font-sans relative overflow-hidden" id="applet-root">
      
      {/* Full-screen animated eco background image and overlay gradient */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-[0.24] mix-blend-screen animate-eco-bg"
          style={{ backgroundImage: `url(${ecoBg})` }}
        />
        {/* Giant deep moss ambient glows for extra depth */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-500/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-lime-500/5 rounded-full blur-[160px]" />
        <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-emerald-600/5 rounded-full blur-[150px]" />
        
        {/* Soft floating eco particles */}
        {[
          { size: 'w-4 h-4', left: '10%', dur: '22s', delay: '0s' },
          { size: 'w-6 h-6', left: '25%', dur: '30s', delay: '4s' },
          { size: 'w-3 h-3', left: '40%', dur: '18s', delay: '2s' },
          { size: 'w-5 h-5', left: '55%', dur: '26s', delay: '7s' },
          { size: 'w-7 h-7', left: '70%', dur: '35s', delay: '1s' },
          { size: 'w-4 h-4', left: '85%', dur: '24s', delay: '5s' },
          { size: 'w-5 h-5', left: '95%', dur: '28s', delay: '3s' },
          { size: 'w-3 h-3', left: '15%', dur: '20s', delay: '10s' },
          { size: 'w-6 h-6', left: '48%', dur: '32s', delay: '8s' },
          { size: 'w-4 h-4', left: '78%', dur: '25s', delay: '12s' },
        ].map((pt, i) => (
          <div 
            key={i}
            className={`animate-eco-particle ${pt.size}`}
            style={{ 
              left: pt.left,
              '--drift-dur': pt.dur,
              '--drift-delay': pt.delay
            } as React.CSSProperties}
          />
        ))}
        
        {/* Fade to bottom blackout contrast element */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020503]/40 to-[#020503]" />
      </div>

      {/* Visual Header */}
      <header className="backdrop-blur-md bg-[#040905]/75 border-b border-emerald-500/10 sticky top-0 z-50 shadow-2xl shadow-black/30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between relative z-10">
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 active:scale-95 transition-all"
            title="Go to Front Page Home Hub"
          >
            <span className="p-2.5 bg-gradient-to-br from-emerald-500 to-lime-600 text-slate-950 rounded-xl shadow-lg shadow-emerald-500/10">
              <Leaf className="w-5 h-5 shrink-0" />
            </span>
            <div>
              <h1 className="text-lg font-semibold font-display tracking-tight text-white mb-0 font-sans sm:text-xl truncate max-w-[180px] xs:max-w-[280px]">
                {trackerName}
              </h1>
              <p className="text-[9px] text-lime-400 font-black font-sans uppercase tracking-widest mt-0.5">
                Citizen: {userName}
              </p>
            </div>
          </div>

          {/* Quick Stats Header Summary with navigation indicators */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('home')}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                activeTab === 'home' 
                  ? 'bg-lime-400 text-slate-950 shadow-md scale-102 font-bold' 
                  : 'bg-emerald-950/40 text-lime-300 border border-emerald-500/15 hover:border-lime-400/30'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Home Hub</span>
            </button>

            <div className="hidden sm:flex items-center gap-3 pl-3">
              <div className="text-right border-r border-white/10 pr-3">
                <span className="text-[10px] text-zinc-500 uppercase font-semibold font-sans">Active Region</span>
                <p className="text-xs font-bold text-zinc-100">{selectedLocation.name}</p>
              </div>
              <div className="text-right border-r border-white/10 pr-3">
                <span className="text-[10px] text-zinc-500 uppercase font-semibold font-sans">Badges Earned</span>
                <p className="text-xs font-bold text-lime-400 flex items-center gap-1 justify-end">
                  <Award className="w-4 h-4 text-lime-400" />
                  {badges.filter(b => b.unlocked).length} / {badges.length}
                </p>
              </div>
              <div className="text-right pl-1">
                {authLoading ? (
                  <div className="h-8 w-20 animate-pulse bg-white/5 rounded-lg"></div>
                ) : user ? (
                  <button
                    onClick={handleSignOut}
                    className="flex flex-col items-end hover:opacity-80 transition-opacity text-left"
                    title="Sign Out"
                  >
                    <span className="text-[10px] text-zinc-500 uppercase font-semibold font-sans flex items-center gap-1">
                      <LogOut className="w-3 h-3" /> Sign Out
                    </span>
                    <p className="text-xs font-bold text-lime-400 truncate max-w-[100px]">
                      {user.displayName || user.email || 'User'}
                    </p>
                  </button>
                ) : (
                  <button
                    onClick={handleSignIn}
                    className="py-1.5 px-3 bg-lime-400 hover:bg-lime-500 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-[0_0_15px_rgba(163,230,53,0.2)]"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
        


        {/* 3D Dashboard Interactive Module Flashcards Grid (only shown on sub-pages) */}
        {activeTab !== 'home' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10" id="module-flashcards-grid">
            
            {/* Flashcard 1: Calculators & Logs */}
            <button
              onClick={() => setActiveTab('track')}
              className={`text-left rounded-2xl p-5 border transition-all duration-300 transform cursor-pointer relative overflow-hidden flex flex-col justify-between h-[155px] ${
                activeTab === 'track' 
                  ? 'bg-[#0f1711]/70 border-lime-400/40 shadow-[0_0_20px_rgba(163,230,53,0.08)] ring-1 ring-lime-400/10 scale-[1.01]' 
                  : 'bg-black/30 border-white/5 hover:border-emerald-500/20 hover:bg-black/40 hover:scale-[1.01]'
              }`}
              id="flashcard-calculators"
            >
              {/* Visual background glow */}
              <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
              
              <div className="flex items-start justify-between">
                <span className={`p-2 rounded-xl transition-all ${activeTab === 'track' ? 'bg-gradient-to-br from-lime-400 to-lime-600 text-slate-950 shadow-[0_0_12px_rgba(163,230,53,0.3)]' : 'bg-emerald-950/60 text-[#c0ecd3] border border-emerald-500/20'}`}>
                  <BarChart3 className="w-5 h-5 shrink-0" />
                </span>
                <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full ${activeTab === 'track' ? 'text-lime-400 bg-lime-950/80 border border-lime-500/20' : 'text-zinc-500 bg-zinc-900/30'}`}>
                  Active Track
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block">Carbon Weight Burden</span>
                <p className="text-xl font-black font-sans text-white tracking-tight mt-0.5">
                  {netCO2.toFixed(1)} <span className="text-xs font-normal text-zinc-400">kg/day</span>
                </p>
              </div>

              <div className="w-full flex justify-between items-center text-[10px] border-t border-white/5 pt-2 text-zinc-500 mt-1">
                <span>{logs.length} logged days</span>
                <span className={`font-bold flex items-center gap-0.5 ${activeTab === 'track' ? 'text-lime-400' : 'text-zinc-400'}`}>
                  Inspect Calculators &rarr;
                </span>
              </div>
            </button>

            {/* Flashcard 2: Habits & Green Actions */}
            <button
              onClick={() => setActiveTab('habits')}
              className={`text-left rounded-2xl p-5 border transition-all duration-300 transform cursor-pointer relative overflow-hidden flex flex-col justify-between h-[155px] ${
                activeTab === 'habits' 
                  ? 'bg-[#0f1711]/70 border-lime-400/40 shadow-[0_0_20px_rgba(163,230,53,0.08)] ring-1 ring-lime-400/10 scale-[1.01]' 
                  : 'bg-black/30 border-white/5 hover:border-emerald-500/20 hover:bg-black/40 hover:scale-[1.01]'
              }`}
              id="flashcard-habits"
            >
              {/* Visual background glow */}
              <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-teal-500/10 rounded-full blur-xl pointer-events-none" />

              <div className="flex items-start justify-between">
                <span className={`p-2 rounded-xl transition-all ${activeTab === 'habits' ? 'bg-gradient-to-br from-lime-400 to-lime-600 text-slate-950 shadow-[0_0_12px_rgba(163,230,53,0.3)]' : 'bg-teal-950/60 text-[#c0ecd3] border border-teal-500/20'}`}>
                  <HelpCircle className="w-5 h-5 shrink-0" />
                </span>
                <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full ${activeTab === 'habits' ? 'text-lime-400 bg-lime-950/80 border border-lime-500/20' : 'text-zinc-500 bg-zinc-900/30'}`}>
                  Eco Habits
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block">Checklist Completion</span>
                <p className="text-xl font-black font-sans text-white tracking-tight mt-0.5">
                  {habits.filter(h => h.completed).length} / {habits.length} <span className="text-xs font-normal text-zinc-400">habits done</span>
                </p>
              </div>

              <div className="w-full flex justify-between items-center text-[10px] border-t border-white/5 pt-2 text-zinc-500 mt-1">
                <span>Daily routines</span>
                <span className={`font-bold flex items-center gap-0.5 ${activeTab === 'habits' ? 'text-lime-400' : 'text-zinc-400'}`}>
                  Review Habitude &rarr;
                </span>
              </div>
            </button>

            {/* Flashcard 3: Citizens Community Standing */}
            <button
              onClick={() => setActiveTab('community')}
              className={`text-left rounded-2xl p-5 border transition-all duration-300 transform cursor-pointer relative overflow-hidden flex flex-col justify-between h-[155px] ${
                activeTab === 'community' 
                  ? 'bg-[#0f1711]/70 border-lime-400/40 shadow-[0_0_20px_rgba(163,230,53,0.08)] ring-1 ring-lime-400/10 scale-[1.01]' 
                  : 'bg-black/30 border-white/5 hover:border-emerald-500/20 hover:bg-black/40 hover:scale-[1.01]'
              }`}
              id="flashcard-community"
            >
              {/* Visual background glow */}
              <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

              <div className="flex items-start justify-between">
                <span className={`p-2 rounded-xl transition-all ${activeTab === 'community' ? 'bg-gradient-to-br from-lime-400 to-lime-600 text-slate-950 shadow-[0_0_12px_rgba(163,230,53,0.3)]' : 'bg-emerald-950/60 text-[#cbd5e1] border border-emerald-500/20'}`}>
                  <Award className="w-5 h-5 shrink-0" />
                </span>
                <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full ${activeTab === 'community' ? 'text-lime-400 bg-lime-950/80 border border-lime-500/20' : 'text-zinc-500 bg-zinc-900/30'}`}>
                  Standings
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block">Badges & Standings</span>
                <p className="text-xl font-black font-sans text-white tracking-tight mt-0.5">
                  {badges.filter(b => b.unlocked).length} <span className="text-xs font-normal text-zinc-400">Unlocks</span>
                </p>
              </div>

              <div className="w-full flex justify-between items-center text-[10px] border-t border-white/5 pt-2 text-zinc-500 mt-1">
                <span>Rankings live</span>
                <span className={`font-bold flex items-center gap-0.5 ${activeTab === 'community' ? 'text-lime-400' : 'text-zinc-400'}`}>
                  Inspect Standings &rarr;
                </span>
              </div>
            </button>

            {/* Flashcard 4: Gemini AI Advisor */}
            <button
              onClick={() => setActiveTab('ai')}
              className={`text-left rounded-2xl p-5 border transition-all duration-300 transform cursor-pointer relative overflow-hidden flex flex-col justify-between h-[155px] ${
                activeTab === 'ai' 
                  ? 'bg-[#0f1711]/70 border-lime-400/40 shadow-[0_0_20px_rgba(163,230,53,0.08)] ring-1 ring-lime-400/10 scale-[1.01]' 
                  : 'bg-black/30 border-white/5 hover:border-emerald-500/20 hover:bg-black/40 hover:scale-[1.01]'
              }`}
              id="flashcard-ai"
            >
              {/* Visual background glow */}
              <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />

              <div className="flex items-start justify-between">
                <span className={`p-2 rounded-xl transition-all ${activeTab === 'ai' ? 'bg-gradient-to-br from-lime-400 to-lime-600 text-slate-950 shadow-[0_0_12px_rgba(163,230,53,0.3)]' : 'bg-indigo-950/60 text-[#cbd5e1] border border-indigo-500/20 animate-pulse'}`}>
                  <Sparkles className="w-5 h-5 shrink-0" />
                </span>
                <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full ${activeTab === 'ai' ? 'text-lime-400 bg-lime-950/80 border border-lime-500/20' : 'text-zinc-500 bg-zinc-900/30'}`}>
                  AI Coach
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block">Smarter Advice</span>
                <p className="text-xl font-black font-sans text-white tracking-tight mt-0.5 flex items-center gap-1.5">
                  Gemini Coach <span className="w-2 h-2 rounded-full bg-lime-400 animate-ping inline-block" />
                </p>
              </div>

              <div className="w-full flex justify-between items-center text-[10px] border-t border-white/5 pt-2 text-zinc-500 mt-1">
                <span>Scientific models loaded</span>
                <span className={`font-bold flex items-center gap-0.5 ${activeTab === 'ai' ? 'text-lime-400' : 'text-zinc-400'}`}>
                  Consult Advisor &rarr;
                </span>
              </div>
            </button>

          </div>
        )}

        {/* Tab contents mounting dynamically */}
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -30, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-8 text-center flex flex-col items-center justify-center py-6 relative"
              id="home-tab-pane"
            >
              
              {/* Sequence 1: The Title with same earth rotating image */}
              <div className="relative group w-72 h-72 sm:w-96 sm:h-96 my-2 shrink-0 aspect-square select-none flex items-center justify-center">
                {/* Outer biosphere green glow rings */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-lime-400 rounded-full blur-2xl opacity-20 animate-pulse duration-3000 scale-105" />
                <div className="absolute inset-2 bg-emerald-500/10 rounded-full blur-xl animate-pulse duration-1000 scale-[0.98]" />
                
                {/* Spinning particle stars aura */}
                <div className="absolute -inset-4 rounded-full border border-emerald-500/10 animate-spin" style={{ animationDuration: '40s' }} />
                <div className="absolute -inset-8 rounded-full border border-lime-400/5 animate-spin" style={{ animationDuration: '70s', animationDirection: 'reverse' }} />

                {/* Glowing ring overlay border for Earth sphere */}
                <div className="absolute inset-0 rounded-full border-2 border-emerald-400/20 shadow-[0_0_40px_rgba(52,211,153,0.25)] z-20 pointer-events-none" />

                {/* High precision atmospheric Earth image display (slow ambient rotation) */}
                <img 
                  src={earthGlobeImg} 
                  alt="Glowing biosphere earth planet concept" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-full z-10 shadow-[inner_0_0_60px_rgba(0,0,0,0.95)] select-none animate-spin" 
                  style={{ animationDuration: '240s' }}
                />

                {/* Atmospheric environmental gloss flare */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-black/60 via-transparent to-emerald-400/20 z-10 pointer-events-none" />
              </div>

              {/* Title Display & Small Caption */}
              <div className="space-y-4 max-w-4xl relative z-10 px-4">
                <span className="inline-flex items-center gap-2 py-1.5 px-3 rounded-full text-[10px] uppercase tracking-wider font-extrabold font-mono bg-[#09150d] border border-emerald-500/25 text-lime-400 shadow-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-ping" />
                  Regional Carbon Registry Active
                </span>

                {/* Giant Typography Title set directly as Carbon Footprint Tracker */}
                <h2 className="text-4xl sm:text-5xl md:text-7xl font-sans font-black tracking-tighter uppercase leading-none text-transparent bg-clip-text bg-gradient-to-b from-white via-stone-100 to-lime-200 drop-shadow-xl select-none">
                  Carbon Footprint Tracker
                </h2>

                {/* Elegant Small Caption / Meditative Thought */}
                <p className="text-zinc-400 text-xs sm:text-[13px] font-sans font-medium tracking-wide max-w-lg mx-auto leading-relaxed italic bg-emerald-950/20 py-2.5 px-4 rounded-xl border border-emerald-500/5 shadow-inner">
                  "Every breath we draw, every choice we make, registers a silent tally in the sky. Welcome back, <span className="text-lime-300 font-bold not-italic font-sans">{userName}</span>—let's balance the scales today."
                </p>
              </div>

              {/* Interactive Slide-and-Reach Navigation Tabs Suite */}
              <div className="w-full max-w-5xl bg-[#040805]/95 backdrop-blur-md rounded-2xl p-2.5 border border-emerald-500/15 shadow-2xl relative z-10 flex flex-wrap justify-center gap-2" id="home-navigation-tabs-suite">
                {[
                  { id: 'home', label: 'Home Hub', desc: 'Main Registry', icon: Home, color: 'text-emerald-400' },
                  { id: 'regional', label: 'Regional Monitor', desc: 'Telemetry Hub', icon: Globe, color: 'text-[#4ade80]' },
                  { id: 'track', label: 'Calculators', desc: 'Emissions & Logs', icon: BarChart3, color: 'text-lime-400' },
                  { id: 'habits', label: 'Eco Habits', desc: 'Action Offsets', icon: HelpCircle, color: 'text-teal-400' },
                  { id: 'community', label: 'Standings', desc: 'Badge Streaks', icon: Award, color: 'text-amber-400' },
                  { id: 'ai', label: 'AI Advisor', desc: 'Gemini Coach', icon: Sparkles, color: 'text-indigo-400' },
                ].map((tabItem) => {
                  const TabIcon = tabItem.icon;
                  const isSelected = activeTab === tabItem.id;
                  return (
                    <button
                      key={tabItem.id}
                      onClick={() => setActiveTab(tabItem.id as any)}
                      className={`flex-1 min-w-[145px] max-w-[210px] px-3 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2.5 text-left relative overflow-hidden group cursor-pointer ${
                        isSelected
                          ? 'bg-[#0f1711]/90 border border-lime-400/40 shadow-[0_0_15px_rgba(163,230,53,0.1)] ring-1 ring-lime-400/10'
                          : 'bg-black/40 hover:bg-[#0a140d]/60 hover:border-emerald-500/30 border border-white/5'
                      }`}
                    >
                      {/* Visual hover ambient light */}
                      <div className="absolute inset-0 bg-gradient-to-r from-lime-400/0 via-lime-400/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
                      
                      <span className={`p-2 rounded-lg shrink-0 transition-transform duration-300 group-hover:scale-105 ${
                        isSelected ? 'bg-gradient-to-br from-lime-400 to-lime-600 text-slate-950 shadow-md' : 'bg-[#08120a] ' + tabItem.color
                      }`}>
                        <TabIcon className="w-3.5 h-3.5" />
                      </span>
                      
                      <div className="flex flex-col min-w-0">
                        <span className={`text-[11px] font-extrabold tracking-tight truncate ${isSelected ? 'text-lime-300 font-black' : 'text-stone-200 group-hover:text-white'}`}>
                          {tabItem.label}
                        </span>
                        <span className="text-[9px] text-zinc-500 font-mono tracking-tight truncate">
                          {tabItem.desc}
                        </span>
                      </div>

                      {isSelected && (
                        <span className="absolute right-2.5 top-2.5 flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-lime-400"></span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Quick ecological fun fact note */}
              <div className="text-[10px] text-zinc-500 tracking-wider font-mono uppercase pt-4 w-full border-t border-white/5 relative z-10">
                🟢 Dynamic Active Navigation Protocol Is Enabled • Click Earth or Header tabs to switch
              </div>

            </motion.div>
          )}

          {/* Separate tab view for Regional Monitor */}
          {activeTab === 'regional' && (
            <motion.div
              key="regional"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -30, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
              id="regional-tab-pane"
            >
              <div className="w-full text-left bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-emerald-500/10 shadow-2xl relative z-10 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                  <span className="p-2.5 bg-gradient-to-br from-emerald-500 to-lime-600 text-slate-950 rounded-xl">
                    <Globe className="w-5 h-5 shrink-0" />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">Regional Monitor & Environment Hub</h3>
                    <p className="text-xs text-zinc-400 font-mono">Live telemetry feed for selected geographical regions</p>
                  </div>
                </div>
                
                <LiveTicker 
                  selectedLocation={selectedLocation} 
                  onLocationChange={handleLocationChange} 
                />
              </div>

              {/* NEW LIVE API DATA FETCH COMPONENT */}
              <LiveCityEmissions />
            </motion.div>
          )}

          {activeTab === 'track' && (
            <motion.div
              key="track"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -30, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
              id="track-tab-pane"
            >
              <Atmosphere3D 
                currentTotalEmissions={netCO2} 
                selectedLocationName={selectedLocation.name} 
                gridIntensity={selectedLocation.gridIntensityGCO2} 
              />

              <Dashboard 
                currentEmissions={{
                  ...currentCalculators,
                  totalCO2: netCO2
                }}
                dailyGoal={dailyGoal}
                onDailyGoalChange={(val) => setDailyGoal(val)}
                logs={logs}
                onDeleteLog={handleDeleteLog}
                badges={badges}
                habits={habits}
              />

              <Calculators 
                selectedLocation={selectedLocation} 
                onLogEntry={handleLogEntry} 
              />
            </motion.div>
          )}

          {activeTab === 'habits' && (
            <motion.div
              key="habits"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -30, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              id="habits-tab-pane"
            >
              <HabitsAndCauses 
                habits={habits}
                onToggleHabit={handleToggleHabit}
                onResetHabits={handleResetHabits}
                onSelectAllHabits={handleSelectAllHabits}
              />
            </motion.div>
          )}

          {activeTab === 'community' && (
            <motion.div
              key="community"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -30, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              id="community-tab-pane"
            >
              <CommunityHub 
                logs={logs}
                badges={badges}
                selectedLocation={`${selectedLocation.name}, ${selectedLocation.country}`}
              />
            </motion.div>
          )}

          {activeTab === 'ai' && (
            <motion.div
              key="ai"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -30, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              id="ai-tab-pane"
            >
              <AIAgent 
                currentEmissions={{
                  ...currentCalculators,
                  totalCO2: netCO2
                }}
                selectedLocation={selectedLocation}
                habits={habits}
                dailyGoal={dailyGoal}
              />
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Humble Footer */}
      <footer className="bg-[#030604]/80 border-t border-white/5 py-8 mt-16 text-center text-xs text-zinc-500 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="flex items-center gap-1.5 font-medium leading-none text-zinc-400">
            <CheckCircle className="w-4 h-4 text-lime-400" />
            Personal Carbon footprint awareness platform — Conforms to Earth Net-Zero benchmarks.
          </p>
          <p className="font-mono text-[10px] text-zinc-600">
            Ticking Live values correspond to physical estimates.
          </p>
        </div>
      </footer>
    </div>
  );
}
