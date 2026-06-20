import React from 'react';
import { Footprints, Leaf, Sprout, CheckCircle, Bike, Trash2, Award, Info, Heart, Target, Sparkles, Trophy } from 'lucide-react';
import { FootprintEntry, Badge, SustainableHabit } from '../types';

interface DashboardProps {
  currentEmissions: {
    commuteCO2: number;
    electricityCO2: number;
    dietCO2: number;
    travelCO2: number;
    totalCO2: number;
  };
  dailyGoal: number;
  onDailyGoalChange: (val: number) => void;
  logs: FootprintEntry[];
  onDeleteLog: (id: string) => void;
  badges: Badge[];
  habits: SustainableHabit[];
}

const IconMap: Record<string, React.ComponentType<any>> = {
  'Footprints': Footprints,
  'Leaf': Leaf,
  'Sprout': Sprout,
  'CheckCircle': CheckCircle,
  'Bike': Bike,
};

export function Dashboard({
  currentEmissions,
  dailyGoal,
  onDailyGoalChange,
  logs,
  onDeleteLog,
  badges,
  habits
}: DashboardProps) {
  
  const totalEmissionsCurrent = currentEmissions.totalCO2;
  const percentOfGoal = Math.min(100, (totalEmissionsCurrent / dailyGoal) * 100);
  const isOverBudget = totalEmissionsCurrent > dailyGoal;

  // Active status summary
  const completedHabitsCount = habits.filter(h => h.completed).length;
  const totalHabitsSaving = habits.filter(h => h.completed).reduce((acc, h) => acc + h.co2SavedKg, 0);

  return (
    <div className="space-y-6" id="dashboard-container">
      
      {/* Top statistics overview panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Goal limit gauge */}
        <div className="bg-[#0b100c]/70 backdrop-blur-md rounded-2xl p-5 border border-emerald-500/10 shadow-xl lg:col-span-2 flex flex-col justify-between" id="dashboard-budget-card">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-lime-400" />
                <h3 className="font-bold text-white text-sm tracking-tight">Daily Carbon Budget</h3>
              </div>
              <span className={`text-xs font-bold py-1 px-2.5 rounded-full border ${isOverBudget ? 'bg-rose-950/40 border-rose-500/20 text-rose-400' : 'bg-emerald-950/40 border-emerald-500/20 text-lime-400'}`}>
                {percentOfGoal.toFixed(0)}% Budget Used
              </span>
            </div>

            {/* Simulated scale bar */}
            <div className="mt-5">
              <div className="flex justify-between text-xs text-zinc-400 mb-1.5 font-sans">
                <span>Current: <strong className="text-white font-mono">{totalEmissionsCurrent.toFixed(1)} kg</strong></span>
                <span>Budget Max: <strong className="text-white font-mono">{dailyGoal.toFixed(1)} kg</strong></span>
              </div>
              <div className="w-full bg-[#162218] rounded-full h-3 overflow-hidden border border-white/[0.03]">
                <div 
                  className={`h-full transition-all duration-500 ${isOverBudget ? 'bg-gradient-to-r from-orange-500 to-rose-600' : 'bg-gradient-to-r from-[#a3e635] to-[#84cc16]'}`}
                  style={{ width: `${percentOfGoal}%` }}
                />
              </div>
            </div>

            {isOverBudget ? (
              <div className="mt-3.5 flex items-center gap-2 bg-rose-950/20 border border-rose-500/15 p-2.5 rounded-xl text-xs text-rose-300 leading-relaxed">
                <Info className="w-4 h-4 shrink-0 text-rose-400" />
                <span>You are exceeding your sustainability target! Complete active habits below or switch to local transportation/diet to offset this.</span>
              </div>
            ) : (
              <div className="mt-3.5 flex items-center gap-2 bg-emerald-950/20 border border-emerald-500/15 p-2.5 rounded-xl text-xs text-emerald-300 leading-relaxed">
                <Sparkles className="w-4 h-4 text-lime-400 shrink-0" />
                <span>Great job! Your footprint is within the earth-optimal ceiling. You are leading a climate-safe day!</span>
              </div>
            )}
          </div>

          {/* Goal Adjustment range */}
          <div className="mt-5 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-300">Modify Target Budget Limit:</span>
              <span className="text-xs font-mono font-bold text-lime-300">{dailyGoal} kg CO₂ / day</span>
            </div>
            <input 
              type="range"
              min="5"
              max="40"
              step="1"
              value={dailyGoal}
              onChange={(e) => onDailyGoalChange(Number(e.target.value))}
              className="w-full accent-lime-400 h-1 mt-2 bg-neutral-950 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-zinc-500 mt-1">
              <span>Eco-Idealist (5-10kg)</span>
              <span>Average Target (20kg)</span>
              <span>Looser Limits (40kg)</span>
            </div>
          </div>
        </div>

        {/* Action checklist status savings summary */}
        <div className="bg-[#0b100c]/70 backdrop-blur-md rounded-2xl p-5 border border-emerald-500/10 shadow-xl flex flex-col justify-between" id="dashboard-savings-status">
          <div>
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <CheckCircle className="w-4 h-4 text-lime-400" />
              Active Offsets Today
            </div>
            <h3 className="font-extrabold text-3xl font-mono text-lime-400 tracking-tight drop-shadow-[0_0_15px_rgba(163,230,53,0.15)]">
              -{totalHabitsSaving.toFixed(1)} <span className="text-xs font-sans text-zinc-400 font-normal">kg CO₂e</span>
            </h3>
            <p className="text-zinc-400 text-xs mt-1.5 leading-relaxed">
              Offset compiled by completing {completedHabitsCount} sustainable active tasks in the daily habits tab checklist.
            </p>
          </div>

          <div className="mt-5 p-3 rounded-xl bg-black/40 border border-emerald-500/10 text-[11px] text-zinc-300 leading-relaxed">
            <span className="font-bold text-lime-300">Note:</span> Real human habit corrections reduce the carbon load immediately, reducing the atmospheric burden.
          </div>
        </div>

      </div>

      {/* Categories Footprint Breakdown Gauges */}
      <div className="bg-[#0b100c]/70 backdrop-blur-md rounded-2xl p-5 border border-emerald-500/10 shadow-xl">
        <h3 className="font-bold text-white text-sm mb-4">Emissions Source Proportions</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-[#050805]/50 p-3 rounded-xl border border-white/5">
            <div className="text-[11px] text-zinc-400 font-semibold mb-1">Transit & Commute</div>
            <div className="font-mono text-base font-bold text-orange-400">{currentEmissions.commuteCO2.toFixed(1)} kg</div>
            <div className="w-full bg-neutral-950 h-1 mt-1.5 rounded-full overflow-hidden">
              <div className="bg-orange-500 h-full" style={{ width: `${Math.min(100, (currentEmissions.commuteCO2 / (totalEmissionsCurrent || 1) * 100))}%` }} />
            </div>
          </div>

          <div className="bg-[#050805]/50 p-3 rounded-xl border border-white/5">
            <div className="text-[11px] text-zinc-400 font-semibold mb-1">Electricity Grid</div>
            <div className="font-mono text-base font-bold text-lime-400">{currentEmissions.electricityCO2.toFixed(1)} kg</div>
            <div className="w-full bg-neutral-950 h-1 mt-1.5 rounded-full overflow-hidden">
              <div className="bg-lime-400 h-full" style={{ width: `${Math.min(100, (currentEmissions.electricityCO2 / (totalEmissionsCurrent || 1) * 100))}%` }} />
            </div>
          </div>

          <div className="bg-[#050805]/50 p-3 rounded-xl border border-white/5">
            <div className="text-[11px] text-zinc-400 font-semibold mb-1">Diet & Methane</div>
            <div className="font-mono text-base font-bold text-teal-400">{currentEmissions.dietCO2.toFixed(1)} kg</div>
            <div className="w-full bg-neutral-950 h-1 mt-1.5 rounded-full overflow-hidden">
              <div className="bg-teal-400 h-full" style={{ width: `${Math.min(100, (currentEmissions.dietCO2 / (totalEmissionsCurrent || 1) * 100))}%` }} />
            </div>
          </div>

          <div className="bg-[#050805]/50 p-3 rounded-xl border border-white/5">
            <div className="text-[11px] text-zinc-400 font-semibold mb-1">Travel Flights/Hotel</div>
            <div className="font-mono text-base font-bold text-indigo-400">{currentEmissions.travelCO2.toFixed(1)} kg</div>
            <div className="w-full bg-neutral-950 h-1 mt-1.5 rounded-full overflow-hidden">
              <div className="bg-indigo-500 h-full" style={{ width: `${Math.min(100, (currentEmissions.travelCO2 / (totalEmissionsCurrent || 1) * 100))}%` }} />
            </div>
          </div>

        </div>
      </div>

      {/* Double Column content: Badges & Logs history list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Logged emissions history logs list */}
        <div className="bg-[#0b100c]/70 backdrop-blur-md rounded-2xl p-5 border border-emerald-500/10 shadow-xl lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Footprints className="w-4.5 h-4.5 text-lime-400" />
              Logged Daily Activity Logs
            </h3>
            <span className="text-xs bg-emerald-950/40 font-semibold font-mono text-lime-400 py-0.5 px-2.5 rounded-full border border-emerald-500/20">
              {logs.length} Entries
            </span>
          </div>

          {logs.length === 0 ? (
            <div className="p-8 text-center text-zinc-400 border border-dashed border-emerald-500/10 rounded-xl bg-black/30">
              <Footprints className="w-10 h-10 mx-auto text-zinc-500 stroke-[1.2] mb-2" />
              <p className="text-xs">No entries posted yet.</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">Fill calculations & click "Post This to Log History" above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] text-zinc-400 font-semibold uppercase">
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Commuting</th>
                    <th className="pb-2">Grid Power</th>
                    <th className="pb-2">Diet</th>
                    <th className="pb-2">Flights/Travel</th>
                    <th className="pb-2 text-right">Total Daily</th>
                    <th className="pb-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {logs.map((log) => {
                    const isOptimal = log.totalCO2 <= dailyGoal;
                    return (
                      <tr key={log.id} className="text-zinc-350 group hover:bg-white/5">
                        <td className="py-2.5 font-medium font-mono whitespace-nowrap text-zinc-300">
                          {log.date}
                        </td>
                        <td className="py-2.5 font-mono text-orange-400">
                          {log.commuteCO2.toFixed(1)} kg
                        </td>
                        <td className="py-2.5 font-mono text-lime-400">
                          {log.electricityCO2.toFixed(1)} kg
                        </td>
                        <td className="py-2.5 font-mono text-teal-400">
                          {log.dietCO2.toFixed(1)} kg
                        </td>
                        <td className="py-2.5 font-mono text-indigo-400">
                          {log.travelCO2.toFixed(1)} kg
                        </td>
                        <td className="py-2.5 text-right font-mono font-bold">
                          <span className={`py-0.5 px-1.5 rounded-md border ${isOptimal ? 'text-lime-400 bg-emerald-950/40 border-emerald-500/20' : 'text-rose-400 bg-rose-950/40 border-rose-500/20'}`}>
                            {log.totalCO2.toFixed(1)} kg
                          </span>
                        </td>
                        <td className="py-2.5 text-center">
                          <button
                            onClick={() => onDeleteLog(log.id)}
                            className="p-1 text-zinc-500 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                            title="Delete log"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sustainability accomplishments & Badges achievements */}
        <div className="bg-[#0b100c]/70 backdrop-blur-md rounded-2xl p-5 border border-emerald-500/10 shadow-xl flex flex-col justify-between" id="dashboard-badges-card">
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-lime-400" />
              Sustainability Badges
            </h3>

            <div className="space-y-3.5">
              {badges.map((badge) => {
                const BadgeIcon = IconMap[badge.icon] || Trophy;
                return (
                  <div 
                    key={badge.id}
                    className={`flex items-center gap-3.5 p-3 rounded-xl border transition-all ${badge.unlocked ? 'bg-emerald-950/30 border-emerald-500/20' : 'bg-black/30 border-white/5 opacity-55'}`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${badge.unlocked ? 'bg-gradient-to-br from-lime-400 to-emerald-500 text-slate-950 shadow-[0_0_8px_rgba(163,230,53,0.3)] font-bold' : 'bg-zinc-800 text-zinc-500'}`}>
                      <BadgeIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                        {badge.title}
                        {badge.unlocked && <span className="text-[9px] bg-[#bef264] font-bold uppercase tracking-wider text-slate-950 py-0.5 px-1.5 rounded">Unlocked</span>}
                      </h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{badge.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2 text-[10px] text-zinc-500 leading-normal">
            <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
            <span>Badges auto-unlock relative to your footprint patterns and completed checklist items.</span>
          </div>
        </div>

      </div>

    </div>
  );
}
