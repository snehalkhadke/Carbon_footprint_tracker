import { useState, useEffect, useRef } from 'react';
import { MapPin, Activity, Zap, Compass, AlertCircle, Info, Flame } from 'lucide-react';
import { LocationEnvironmentalData } from '../types';
import { ENVIRONMENTAL_LOCATIONS } from '../data';

interface LiveTickerProps {
  selectedLocation: LocationEnvironmentalData;
  onLocationChange: (location: LocationEnvironmentalData) => void;
}

export function LiveTicker({ selectedLocation, onLocationChange }: LiveTickerProps) {
  const [cumulativeEmissions, setCumulativeEmissions] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset ticker on location change
  useEffect(() => {
    setCumulativeEmissions(0);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const intervalBase = 100; // tick every 100ms
    const valPerTick = selectedLocation.regionalEmissionsPerSecond * (intervalBase / 1000);

    timerRef.current = setInterval(() => {
      setCumulativeEmissions((prev) => prev + valPerTick);
    }, intervalBase);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [selectedLocation]);

  return (
    <div className="bg-[#0b100c]/70 backdrop-blur-md text-white rounded-3xl p-6 shadow-2xl border border-emerald-500/10 relative overflow-hidden" id="live-carbon-ticker-container">
      {/* Background radial accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#a3e635]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 text-lime-400 font-medium tracking-wide text-xs uppercase">
            <Activity className="w-4 h-4 animate-pulse text-lime-400" />
            Live Surrounding Area Emissions Ticker
          </div>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white mt-1 flex items-center gap-2">
            Regional Monitor
          </h2>
          <p className="text-zinc-400 text-sm mt-1 max-w-lg leading-relaxed">
            Humans emit billions of tons of CO2 yearly. This tracker estimates the physical carbon emitted into the atmosphere in real time across the metropolitan surroundings of your selected region.
          </p>
        </div>

        {/* Location Dropdown selector */}
        <div className="flex flex-col gap-1.5 justify-end min-w-[200px]" id="location-select-wrapper">
          <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-lime-400" />
            Switch Active Region:
          </label>
          <select 
            id="location-picker-dropdown"
            className="bg-black/55 text-lime-300 py-2.5 px-3.5 rounded-xl border border-emerald-500/20 font-sans text-sm focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 cursor-pointer"
            value={selectedLocation.id}
            onChange={(e) => {
              const matched = ENVIRONMENTAL_LOCATIONS.find(l => l.id === e.target.value);
              if (matched) onLocationChange(matched);
            }}
          >
            {ENVIRONMENTAL_LOCATIONS.map((loc) => (
              <option key={loc.id} value={loc.id} className="bg-[#0b100c] text-white">
                {loc.name}, {loc.country}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main live ticker screen - designed like an electric diagnostic grid board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 pt-6 border-t border-white/5 relative z-10">
        
        {/* Ticking counter */}
        <div className="lg:col-span-2 bg-[#050805]/80 rounded-2xl p-5 border border-[#a3e635]/10 flex flex-col justify-between">
          <div>
            <div className="text-zinc-400 text-xs font-medium flex items-center gap-1.5 mb-2">
              <Flame className="w-4 h-4 text-orange-400 animate-bounce" />
              Est. Atmospheric CO₂ Emitted in Metropolitain {selectedLocation.name}
            </div>
            <div className="font-mono text-4xl sm:text-5xl font-bold text-orange-400 tracking-tight flex items-baseline gap-2">
              <span className="drop-shadow-[0_0_15px_rgba(251,146,60,0.2)]">{cumulativeEmissions.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
              <span className="text-base text-zinc-400 font-sans">kg CO₂e</span>
            </div>
            <p className="text-zinc-500 text-xs mt-1.5 font-mono">
              Accumulated since you opened this view of the panel
            </p>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-zinc-400 border-t border-white/5 pt-3.5">
            <div>
              <span className="text-zinc-500 font-medium">Constant Rate: </span>
              <span className="text-orange-300 font-semibold font-mono">
                {selectedLocation.regionalEmissionsPerSecond.toLocaleString()} kg/second
              </span>
            </div>
            <div>
              <span className="text-zinc-500 font-medium">Capita/person baseline: </span>
              <span className="text-lime-300 font-semibold font-mono">
                {selectedLocation.co2PerDayPerCapita} kg/day
              </span>
            </div>
          </div>
        </div>

        {/* Regional Environmental stats Card */}
        <div className="bg-[#050805]/50 rounded-2xl p-5 border border-white/5 flex flex-col justify-between">
          <div>
            <div className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2.5">
              Regional Grid Status
            </div>

            {/* Grid Intensity Meter */}
            <div className="flex items-center gap-3">
              <Zap className={`w-7 h-7 ${selectedLocation.gridIntensityGCO2 > 500 ? 'text-rose-400' : selectedLocation.gridIntensityGCO2 > 250 ? 'text-amber-400' : 'text-lime-400'}`} />
              <div>
                <div className="text-lg font-bold font-mono tracking-tight text-white">
                  {selectedLocation.gridIntensityGCO2} <span className="text-xs text-zinc-400 font-sans">g CO₂e/kWh</span>
                </div>
                <div className="text-[11px] text-zinc-500">
                  Grid Carbon Intensity Index
                </div>
              </div>
            </div>

            <div className="mt-4 p-2.5 rounded-lg bg-black/40 text-xs text-zinc-400 leading-relaxed border border-white/5">
              <span className="font-semibold text-zinc-300">Region Note: </span>
              {selectedLocation.locationNote}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
            <span>Air Quality Index:</span>
            <span className="font-semibold text-lime-400 font-mono">
              {selectedLocation.currentAirQuality}
            </span>
          </div>
        </div>

      </div>

      {/* Location specifics live sustainability warning message */}
      <div className="mt-5 bg-emerald-950/20 border border-emerald-500/10 rounded-2xl p-4 flex items-start gap-3 relative z-10">
        <Compass className="w-5 h-5 text-lime-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-lime-300 uppercase tracking-wide">
            Real-Time Location Suggestion ({selectedLocation.name})
          </h4>
          <p className="text-zinc-300 text-xs leading-relaxed mt-0.5">
            {selectedLocation.realtimeAdvice}
          </p>
        </div>
      </div>
    </div>
  );
}
