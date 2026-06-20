import { useState } from 'react';
import { HelpCircle, TreePine, AlertTriangle, Lightbulb, CheckSquare, Square, Info, ShieldCheck } from 'lucide-react';
// @ts-ignore
import causesBg from '../assets/images/eco_causes_bg_1781534868071.jpg';
import { SustainableHabit, EmissionSourceInfo } from '../types';
import { CAUSES_AND_SOLUTIONS } from '../data';

interface HabitsAndCausesProps {
  habits: SustainableHabit[];
  onToggleHabit: (id: string) => void;
  onResetHabits?: () => void;
  onSelectAllHabits?: () => void;
}

export function HabitsAndCauses({ 
  habits, 
  onToggleHabit, 
  onResetHabits, 
  onSelectAllHabits 
}: HabitsAndCausesProps) {
  const [activeTab, setActiveTab] = useState<'habits' | 'causes'>('habits');

  return (
    <div className="bg-[#0b100c]/70 backdrop-blur-md rounded-2xl p-6 border border-emerald-500/10 shadow-xl" id="habits-causes-container">
      
      {/* Tab selection design */}
      <div className="flex border-b border-white/5 mb-6" id="habits-causes-tabs">
        <button
          onClick={() => setActiveTab('habits')}
          className={`pb-3 text-sm font-bold transition-all px-4 cursor-pointer border-b-2 -mb-px ${activeTab === 'habits' ? 'border-lime-400 text-lime-400 font-display' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
        >
          Active Life Habit Tracker
        </button>
        <button
          onClick={() => setActiveTab('causes')}
          className={`pb-3 text-sm font-bold transition-all px-4 cursor-pointer border-b-2 -mb-px ${activeTab === 'causes' ? 'border-lime-400 text-lime-400 font-display' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
        >
          Emission Causes & Global Solutions
        </button>
      </div>

      {activeTab === 'habits' ? (
        <div className="space-y-4" id="habits-checklist-panel">
          <div className="flex items-start gap-3 bg-emerald-950/20 p-4 rounded-xl border border-emerald-500/10">
            <TreePine className="w-5 h-5 text-lime-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-lime-300 uppercase tracking-widest block font-display">
                Actionable Daily Habit Offsets
              </h4>
              <p className="text-zinc-300 text-xs leading-relaxed mt-0.5">
                Toggle the sustainable habits you performed today. Checking off actions directly decreases your cumulative daily estimate and unlocks active status achievements.
              </p>
            </div>
          </div>

          {/* Dynamic Checklist Progress dashboard bar & controls */}
          <div className="bg-black/40 border border-emerald-500/10 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center text-xs font-bold text-zinc-300 mb-2">
                <span className="flex items-center gap-1.5 text-zinc-200 uppercase tracking-wider text-[10px]">
                  <ShieldCheck className="w-4 h-4 text-lime-400" />
                  Eco-Action progress state
                </span>
                <span className="font-mono text-lime-355 text-xs shrink-0 font-bold text-lime-300">
                  {habits.filter(h => h.completed).length} / {habits.length} Done (-{habits.filter(h => h.completed).reduce((sum, h) => sum + h.co2SavedKg, 0).toFixed(1)} kg CO₂e)
                </span>
              </div>
              <div className="w-full bg-[#162218] rounded-full h-2.5 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-lime-450 from-[#bef264] to-[#a3e635] shadow-[0_0_8px_rgba(163,230,53,0.3)] transition-all duration-300 rounded-full"
                  style={{ width: `${(habits.filter(h => h.completed).length / habits.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex gap-2 shrink-0 md:self-end">
              {onSelectAllHabits && habits.some(h => !h.completed) && (
                <button
                  onClick={onSelectAllHabits}
                  className="bg-emerald-950/45 hover:bg-emerald-900/60 text-lime-300 border border-emerald-500/20 text-[11px] font-bold py-1.5 px-3 rounded-lg transition-all cursor-pointer"
                  id="checklist-select-all-btn"
                >
                  Complete All
                </button>
              )}
              {onResetHabits && habits.some(h => h.completed) && (
                <button
                  onClick={onResetHabits}
                  className="bg-rose-955/40 bg-rose-950/30 hover:bg-rose-900/50 text-rose-400 border border-rose-500/20 text-[11px] font-bold py-1.5 px-3 rounded-lg transition-all cursor-pointer"
                  id="checklist-reset-btn"
                >
                  Clear checkmarks
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {habits.map((habit) => (
              <div 
                key={habit.id}
                onClick={() => onToggleHabit(habit.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 select-none ${habit.completed ? 'bg-[#0f1d11]/70 border-lime-400/30 ring-1 ring-lime-400/20 shadow-[0_0_12px_rgba(163,230,53,0.05)]' : 'bg-[#050805]/40 border-white/5 hover:bg-[#050805]/70'}`}
              >
                <div className={`mt-0.5 shrink-0 ${habit.completed ? 'text-lime-450 text-lime-450' : 'text-zinc-600'}`}>
                  {habit.completed ? (
                    <CheckSquare className="w-5 h-5 text-lime-400" />
                  ) : (
                    <Square className="w-5 h-5 text-zinc-500" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-1.5">
                    <h5 className={`font-bold text-xs ${habit.completed ? 'text-zinc-500 line-through' : 'text-white'}`}>
                      {habit.title}
                    </h5>
                    <span className="text-[10px] font-mono font-bold bg-emerald-950 text-lime-300 border border-emerald-500/10 px-2 rounded-full whitespace-nowrap">
                      -{habit.co2SavedKg} kg
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-normal">
                    {habit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div 
          className="space-y-6 relative rounded-2xl overflow-hidden border border-emerald-500/10 p-6 md:p-8" 
          id="emissions-causes-educational-panel"
          style={{
            backgroundImage: `url(${causesBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Ambient overlay to keep text ultra-legible and give that high-end deep gloss look */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#040805]/95 via-[#030603]/92 to-[#040805]/95 pointer-events-none z-0" />
          
          <div className="relative z-10 space-y-6">
            <div className="p-4 bg-black/50 backdrop-blur-sm rounded-xl border border-white/5 flex gap-3 text-xs text-zinc-300 leading-relaxed">
              <HelpCircle className="w-5 h-5 text-lime-450 text-lime-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">Scientific Footnote Summary:</span>
                Human industry deposits over 36 billion metric tons of greenhouse gases into the carbon cycle yearly. True net-zero depends on recognizing key structural causes and installing systematic solutions.
              </div>
            </div>

            {/* Causes catalog cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="causes-grid">
              {CAUSES_AND_SOLUTIONS.map((source) => (
                <div key={source.id} className="bg-[#050805]/80 backdrop-blur-[4px] border border-emerald-500/10 rounded-xl p-5 hover:border-[#a3e635]/30 transition-all flex flex-col justify-between shadow-xl">
                  <div>
                    <h4 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${source.category === 'commuting' ? 'bg-orange-550 bg-orange-500' : source.category === 'electricity' ? 'bg-lime-400' : source.category === 'diet' ? 'bg-teal-400' : 'bg-indigo-400'}`} />
                      {source.title}
                    </h4>

                    {/* Causes segment */}
                    <div className="mt-3.5 space-y-2.5">
                      <div className="text-[11px] leading-relaxed">
                        <span className="font-bold text-lime-300 block uppercase tracking-wide text-[9px] mb-0.5">Primary Cause:</span>
                        <p className="text-zinc-300">{source.cause}</p>
                      </div>

                      <div className="text-[11px] leading-relaxed">
                        <span className="font-bold text-zinc-300 block uppercase tracking-wide text-[9px] mb-0.5">Environmental Consequences:</span>
                        <p className="text-zinc-400 flex items-start gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
                          {source.consequences}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Solutions component */}
                  <div className="mt-4 pt-4 border-t border-white/5 bg-emerald-950/20 p-3 rounded-xl border border-emerald-500/10">
                    <div className="text-[10px] uppercase font-bold text-lime-300 tracking-wider flex items-center gap-1.5 mb-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                      Actionable Solutions to Lower Impact:
                    </div>
                    <ul className="space-y-1.5 font-sans">
                      {source.solutions.map((sol, index) => (
                        <li key={index} className="text-[11px] text-zinc-350 list-disc list-inside leading-snug">
                          {sol}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
