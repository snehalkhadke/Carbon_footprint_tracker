import React, { useState, useEffect, useRef } from 'react';
import { Globe, AlertTriangle, ShieldCheck, Thermometer, Wind, Eye, RotateCw, Settings2, Sliders, Flame, Snowflake, HelpCircle } from 'lucide-react';

interface Atmosphere3DProps {
  currentTotalEmissions: number;
  selectedLocationName: string;
  gridIntensity: number;
}

type ProjectionLayer = 'ozone' | 'geothermal' | 'glacier' | 'aerosols';

export function Atmosphere3D({ currentTotalEmissions, selectedLocationName, gridIntensity }: Atmosphere3DProps) {
  // State for 3D orbital direction
  const [rotationY, setRotationY] = useState(0);
  const [rotationX, setRotationX] = useState(15);
  const [isDragging, setIsDragging] = useState(false);
  const [activeLayer, setActiveLayer] = useState<ProjectionLayer>('ozone');
  const [simulatedYear, setSimulatedYear] = useState<number>(2026);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  
  const dragStartRef = useRef({ x: 0, y: 0, rotX: 0, rotY: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Determine rotation parameters for dynamic styling
  const yearScale = 1 + (simulatedYear - 2026) * 0.05;
  const baseSpeed = 0.2 + (currentTotalEmissions * 0.03);
  const rotationSpeed = baseSpeed * yearScale;
  const durationSec = Math.max(2, 360 / (rotationSpeed * 60));

  // Drag-and-drop 3D tactile interaction controllers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setAutoRotate(false);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      rotX: rotationX,
      rotY: rotationY
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    
    // Smooth translation coordinates
    setRotationY((dragStartRef.current.rotY + deltaX * 0.5) % 360);
    setRotationX(Math.max(-65, Math.min(65, dragStartRef.current.rotX - deltaY * 0.5)));
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Dynamic multipliers based on simulated future scenario
  const co2Multiplier = 1 + ((simulatedYear - 2026) * 0.04);
  const calculatedCO2 = currentTotalEmissions * co2Multiplier;

  // Determine health categorization
  const isOptimal = calculatedCO2 < 12;
  const isHeavy = calculatedCO2 >= 22;

  // Calculate Glacier Ice Cap Volume (Sinks to zero if high carbon or later simulated years!)
  const maxIceCapSize = 34; // Maximum height representation of ice caps
  const currentIceCapVolume = Math.max(0, Math.round(maxIceCapSize - (calculatedCO2 * 1.2) - (simulatedYear - 2026) * 0.4));
  const iceCapStateLabel = currentIceCapVolume > 20 
    ? { text: 'Robust (Shielding Albedo)', color: 'text-sky-300' } 
    : currentIceCapVolume > 5 
      ? { text: 'Compromised (Thermal Leaks)', color: 'text-amber-300' } 
      : { text: 'Critical Deficit (Melt Threshold Triggered)', color: 'text-rose-400 font-bold' };

  // Atmosphere flare container borders
  const statusColor = isOptimal 
    ? 'border-emerald-500/20 text-lime-300 bg-emerald-955/25 bg-emerald-950/20 shadow-emerald-500/5' 
    : isHeavy 
      ? 'border-rose-500/25 text-rose-400 bg-rose-950/20 shadow-rose-500/5' 
      : 'border-[#bef264]/20 text-lime-350 text-lime-300 bg-emerald-955/15 bg-emerald-950/10 shadow-lime-500/5';

  return (
    <div className="bg-[#0b100c]/80 backdrop-blur-md border border-emerald-500/10 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-6" id="three-d-atmosphere-scaffold">
      
      {/* Inject performant CSS animations (0% React render overhead) */}
      <style>{`
        @keyframes slide-continents {
          0% { transform: translate(0px, 0); }
          100% { transform: translate(-320px, 0); }
        }
        @keyframes orbit-satellite {
          0% { transform: translate(105px, 0); z-index: 35; }
          25% { transform: translate(0px, 36px); z-index: 35; }
          49% { z-index: 35; }
          50% { transform: translate(-105px, 0); z-index: 5; }
          75% { transform: translate(0px, -36px); z-index: 5; }
          99% { z-index: 5; }
          100% { transform: translate(105px, 0); z-index: 35; }
        }
        .animate-slide-continents {
          animation: slide-continents var(--duration, 20s) linear infinite;
        }
        .animate-orbit-satellite {
          animation: orbit-satellite var(--duration, 20s) linear infinite;
        }
      `}</style>

      {/* Visual background cosmos space stars overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-4 left-10 w-1 bg-white rounded-full h-1 animate-pulse" />
        <div className="absolute top-20 right-20 w-1.5 h-1.5 bg-lime-400 rounded-full animate-ping" />
        <div className="absolute bottom-10 left-1/3 w-1 h-1 bg-orange-400 rounded-full animate-pulse" />
        <div className="absolute bottom-16 right-1/4 w-1 h-1 bg-indigo-400 rounded-full animate-ping" />
        <div className="absolute top-1/2 left-8 w-1 h-1 bg-sky-300 rounded-full" />
      </div>

      {/* Atmospheric flare background color */}
      <div className={`absolute -right-24 -top-24 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-colors duration-1000 ${
        isOptimal ? 'bg-emerald-500/10' : isHeavy ? 'bg-rose-600/15 animate-pulse' : 'bg-orange-500/10'
      }`} />

      {/* COLUMN 1 (4 spans): Left side telemetry, category selection, projection layer selectors */}
      <div className="lg:col-span-5 space-y-5 relative z-10 flex flex-col justify-between" id="sim-telemetry-controls">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 py-1 px-3 rounded-full text-[10px] uppercase tracking-wider font-extrabold font-mono bg-[#050805]/95 border border-emerald-500/15 text-lime-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-450 bg-lime-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-lime-500"></span>
              </span>
              Climate Matrix 3D v2.4
            </span>

            {/* Simulated Year Badge */}
            <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-[10px] uppercase font-bold font-mono bg-emerald-950 text-lime-300 border border-emerald-500/10">
              Simulated Year: {simulatedYear}
            </span>
          </div>

          <div>
            <h3 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2 font-display">
              <Globe className="w-5 h-5 text-lime-400" />
              Dynamic Radiative Balance
            </h3>
            <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
              Tactile, interactive model simulating the greenhouse envelope surrounding Earth. Unchecked emissions create heat entrapment belts that physically alter global balances.
            </p>
          </div>

          {/* Interactive Projection Layer Switcher */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
              <Settings2 className="w-3.5 h-3.5 text-lime-400" />
              Toggle Active Simulation projection:
            </span>
            <div className="grid grid-cols-2 gap-2" id="sim-layer-toggles">
              <button
                onClick={() => setActiveLayer('ozone')}
                className={`py-2 px-3 text-left rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  activeLayer === 'ozone' 
                    ? 'border-lime-400 bg-emerald-950 text-white shadow-md' 
                    : 'border-white/5 bg-[#050805]/40 text-zinc-400 hover:text-zinc-205 hover:text-zinc-200 hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-1.5 font-display">
                  <span className="w-1.5 h-1.5 rounded-full bg-lime-450 bg-lime-400" />
                  Troposphere Dome
                </div>
              </button>

              <button
                onClick={() => setActiveLayer('glacier')}
                className={`py-2 px-3 text-left rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  activeLayer === 'glacier' 
                    ? 'border-sky-400 bg-sky-950 text-white shadow-md' 
                    : 'border-white/5 bg-[#050805]/40 text-zinc-400 hover:text-zinc-200 hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-1.5 font-display">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-450" />
                  Polar Ice Caps
                </div>
              </button>

              <button
                onClick={() => setActiveLayer('geothermal')}
                className={`py-2 px-3 text-left rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  activeLayer === 'geothermal' 
                    ? 'border-rose-400 bg-rose-950 text-white shadow-md' 
                    : 'border-white/5 bg-[#050805]/40 text-zinc-400 hover:text-zinc-200 hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-1.5 font-display">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-455 bg-rose-400" />
                  Industrial Heat Belts
                </div>
              </button>

              <button
                onClick={() => setActiveLayer('aerosols')}
                className={`py-2 px-3 text-left rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  activeLayer === 'aerosols' 
                    ? 'border-amber-400 bg-amber-950 text-white shadow-md' 
                    : 'border-white/5 bg-[#050805]/40 text-zinc-400 hover:text-zinc-200 hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-1.5 font-display">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-450" />
                  Aerosol Smog Smudges
                </div>
              </button>
            </div>
          </div>

          {/* Interactive Simulation Future Slider */}
          <div className="bg-black/40 border border-emerald-500/10 p-3.5 rounded-2xl space-y-2" id="future-scenario-slider">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-zinc-300 flex items-center gap-1 font-display">
                <Sliders className="w-3.5 h-3.5 text-lime-400" />
                Forecast Time Travel
              </span>
              <span className="font-mono text-lime-300 font-bold bg-emerald-950 py-0.5 px-2 rounded-md border border-emerald-500/10">
                Year {simulatedYear}
              </span>
            </div>
            
            <input 
              type="range"
              min={2026}
              max={2080}
              step={5}
              value={simulatedYear}
              onChange={(e) => setSimulatedYear(Number(e.target.value))}
              className="w-full text-lime-400 bg-[#162218] rounded-lg appearance-none h-1.5 cursor-pointer accent-lime-400"
            />
            
            <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
              <span>2026 (Baseline)</span>
              <span>2050 (Paris Target)</span>
              <span>2080 (Forcing peak)</span>
            </div>
          </div>
        </div>

        {/* Dynamic Diagnostics report base panel */}
        <div className={`p-4 rounded-2xl border ${statusColor} space-y-2`} id="diagnostic-conclusion font-sans">
          <div className="flex items-center gap-2">
            {isOptimal ? (
              <ShieldCheck className="w-4 h-4 text-lime-400 shrink-0" />
            ) : isHeavy ? (
              <AlertTriangle className="w-4 h-4 text-rose-450 text-rose-400 shrink-0 animate-bounce" />
            ) : (
              <Thermometer className="w-4 h-4 text-orange-400 shrink-0 animate-pulse" />
            )}
            <span className="text-xs font-bold uppercase tracking-wider">
              {simulatedYear === 2026 ? 'Present standing' : `Scenario simulation (${simulatedYear})`}
            </span>
          </div>

          <p className="text-xs leading-relaxed opacity-90">
            {isOptimal ? (
              <span>Your minimal footprint keeps atmospheric temperature loops stable. Planetary heat dispersion is healthy.</span>
            ) : isHeavy ? (
              <span className="font-bold text-rose-200">
                Severe Radiative Forcing. Ice caps have dissolved, locking global grids into high feedback loops.
              </span>
            ) : (
              <span>Modest forcing. Carbon levels are forming insulation traps but grid structures remain adaptively manageable.</span>
            )}
          </p>

          <div className="pt-2 border-t border-white/10 text-[10px] flex items-center justify-between text-slate-350">
            <span>CO₂ Concentration Projection:</span>
            <strong className="font-mono text-white">{(420 + (calculatedCO2 * 6.5)).toFixed(0)} PPM</strong>
          </div>
        </div>
      </div>

      {/* COLUMN 2 (7 spans): Right side visualizer with dragging status controls and canvas */}
      <div className="lg:col-span-7 flex flex-col justify-between items-center relative min-h-[380px]" id="sim-globe-display">
        
        {/* Dynamic Active Layer Subtitle Badge */}
        <div className="w-full flex items-center justify-between bg-slate-900/60 border border-slate-800 p-2.5 rounded-xl text-xs relative z-20">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                activeLayer === 'ozone' ? 'bg-indigo-400' : activeLayer === 'glacier' ? 'bg-sky-400' : activeLayer === 'geothermal' ? 'bg-rose-400' : 'bg-amber-400'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                activeLayer === 'ozone' ? 'bg-indigo-500' : activeLayer === 'glacier' ? 'bg-sky-500' : activeLayer === 'geothermal' ? 'bg-rose-500' : 'bg-amber-500'
              }`}></span>
            </span>
            <span className="font-bold uppercase tracking-widest text-[10px] text-slate-300">
              {activeLayer === 'ozone' && 'Tropospheric Heat Trap Mesh'}
              {activeLayer === 'glacier' && 'Sub-polar Cryospheric Storage'}
              {activeLayer === 'geothermal' && 'Industrial Heat Dispersion Centers'}
              {activeLayer === 'aerosols' && 'Suspended Particulate Contrails'}
            </span>
          </div>

          <button 
            onClick={() => setAutoRotate(!autoRotate)}
            className={`py-1 px-2.5 rounded text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all ${
              autoRotate ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            <RotateCw className={`w-3 h-3 ${autoRotate ? 'animate-spin' : ''}`} />
            {autoRotate ? 'AUTO' : 'MANUAL'}
          </button>
        </div>

        {/* 100% Stable Vector Projection Holographic Globe Stage */}
        <div 
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className={`flex items-center justify-center relative flex-1 w-full select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          id="real-3d-stage"
        >
          {/* Atmosphere layer container matching selection */}
          <div className="w-[230px] h-[230px] sm:w-[260px] sm:h-[260px] relative flex items-center justify-center">
            
            {/* 1. Troposphere Outermost Insulation Envelope */}
            {activeLayer === 'ozone' && (
              <div 
                className={`absolute rounded-full border border-dashed transition-all duration-700 flex items-center justify-center pointer-events-none ${
                  isOptimal 
                    ? 'w-[230px] h-[230px] border-emerald-500/30 bg-emerald-500/2 animate-[pulse_3s_infinite]' 
                    : isHeavy 
                      ? 'w-[250px] h-[250px] border-rose-500/80 bg-rose-500/10 animate-[pulse_1.5s_infinite]' 
                      : 'w-[240px] h-[240px] border-orange-500/50 bg-orange-500/5 animate-[pulse_2.2s_infinite]'
                }`}
              />
            )}

            {/* 2. Geothermal Hot Heat Rings */}
            {activeLayer === 'geothermal' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                <div className={`absolute rounded-full border-2 border-red-500/30 animate-ping duration-1000 ${
                  isHeavy ? 'w-[240px] h-[240px]' : 'w-[210px] h-[210px] opacity-30'
                }`} />
                <div className={`absolute rounded-full border border-orange-500/40 animate-pulse ${
                  isHeavy ? 'w-[190px] h-[190px]' : 'w-[170px] h-[170px] opacity-10'
                }`} />
              </div>
            )}

            {/* SVG Interactive Holographic Planet rendering */}
            <svg 
              className="w-[160px] h-[160px] sm:w-[180px] sm:h-[180px] relative overflow-hidden transition-all duration-700 rounded-full z-10"
              viewBox="0 0 200 200"
              id="holographic-globe-svg"
              style={{
                boxShadow: isOptimal 
                  ? 'inset 0 0 35px rgba(0,0,0,0.92), 0 0 32px rgba(52,211,153,0.35)' 
                  : isHeavy 
                    ? 'inset 0 0 45px rgba(0,0,0,0.96), 0 0 40px rgba(244,63,94,0.55)' 
                    : 'inset 0 0 35px rgba(0,0,0,0.92), 0 0 35px rgba(249,115,22,0.4)'
              }}
            >
              <defs>
                {/* Globe circular clipping bounds to restrict visual continents and coordinates */}
                <clipPath id="globe-clip-bounds">
                  <circle cx="100" cy="100" r="80" />
                </clipPath>

                {/* Inner atmospheric scatter atmospheric density glow */}
                <radialGradient id="hologram-shading" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#020617" stopOpacity="0" />
                  <stop offset="85%" stopColor={isOptimal ? '#10b981' : isHeavy ? '#f43f5e' : '#f97316'} stopOpacity="0.08" />
                  <stop offset="100%" stopColor={isOptimal ? '#10b981' : isHeavy ? '#f43f5e' : '#f97316'} stopOpacity="0.32" />
                </radialGradient>

                {/* Grid metallic linear gradient */}
                <linearGradient id="grid-metallic-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={isOptimal ? '#34d399' : isHeavy ? '#f43f5e' : '#fb923c'} stopOpacity="0.32" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.08" />
                </linearGradient>
              </defs>

              {/* Space Void Planet Base Background */}
              <circle cx="100" cy="100" r="80" fill="#020617" />

              {/* Seamless Continent Map Layer - Slides based on calculated rotationY to simulate 3D rotation */}
              <g clipPath="url(#globe-clip-bounds)" id="continents-clip-wrapper">
                <g 
                  className={isDragging || !autoRotate ? "" : "animate-slide-continents"}
                  style={{
                    transform: isDragging || !autoRotate ? `translate(${-(rotationY % 360) * (320 / 360)}px, 0)` : undefined,
                    '--duration': `${durationSec}s`
                  } as any}
                >
                  {/* Tiling Continents Set 1 */}
                  <g fill={isOptimal ? '#10b981' : isHeavy ? '#ef4444' : '#f97316'} fillOpacity="0.25">
                    {/* North America mapping */}
                    <path d="M 40 50 Q 55 45 70 50 Q 80 55 75 70 Q 70 80 50 85 Q 40 70 30 65 Z" />
                    {/* South America mapping */}
                    <path d="M 50 85 Q 65 95 60 115 Q 55 130 50 145 Q 40 135 45 110 Z" />
                    {/* Eurasia & Africa mapping */}
                    <path d="M 110 40 Q 140 45 155 55 Q 165 75 145 85 Q 120 75 115 80 Q 95 72 105 55 Z" />
                    <path d="M 115 80 Q 130 90 125 110 Q 120 120 110 135 Q 98 120 102 95 Z" />
                    {/* Australia mapping */}
                    <path d="M 160 110 Q 175 112 170 125 Q 155 128 150 118 Z" />
                  </g>

                  {/* Tiling Continents Set 2 (Symmetrically offset by 320px for seamless infinite wrapping) */}
                  <g transform="translate(320, 0)" fill={isOptimal ? '#10b981' : isHeavy ? '#ef4444' : '#f97316'} fillOpacity="0.25">
                    <path d="M 40 50 Q 55 45 70 50 Q 80 55 75 70 Q 70 80 50 85 Q 40 70 30 65 Z" />
                    <path d="M 50 85 Q 65 95 60 115 Q 55 130 50 145 Q 40 135 45 110 Z" />
                    <path d="M 110 40 Q 140 45 155 55 Q 165 75 145 85 Q 120 75 115 80 Q 95 72 105 55 Z" />
                    <path d="M 115 80 Q 130 90 125 110 Q 120 120 110 135 Q 98 120 102 95 Z" />
                    <path d="M 160 110 Q 175 112 170 125 Q 155 128 150 118 Z" />
                  </g>
                </g>
              </g>

              {/* Holographic scanner grid lines */}
              <g clipPath="url(#globe-clip-bounds)" stroke="url(#grid-metallic-grad)" strokeWidth="0.8" fill="none" opacity="0.65">
                {/* Horizontal Latitudinal scanners */}
                <line x1="20" y1="50" x2="180" y2="50" />
                <line x1="10" y1="75" x2="190" y2="75" />
                <line x1="0" y1="100" x2="200" y2="100" />
                <line x1="10" y1="125" x2="190" y2="125" />
                <line x1="20" y1="150" x2="180" y2="150" />

                {/* Vertical scan curves approximating longitudinal roundness */}
                <path d="M 100 20 A 45 80 0 0 1 100 180" strokeOpacity="0.4" />
                <path d="M 100 20 A 75 80 0 0 1 100 180" strokeOpacity="0.3" />
                <path d="M 100 20 A 75 80 0 0 0 100 180" strokeOpacity="0.3" />
                <path d="M 100 20 A 45 80 0 0 0 100 180" strokeOpacity="0.4" />
                
                {/* Central prime axis */}
                <line x1="100" y1="20" x2="100" y2="180" strokeWidth="1.2" strokeOpacity="0.6" />
              </g>

              {/* Glacier Ice Cap Cryospheric Storage (Reactive height shrink) */}
              {activeLayer === 'glacier' && currentIceCapVolume > 0 && (
                <g clipPath="url(#globe-clip-bounds)">
                  {/* Northern Glacier Cap */}
                  <ellipse 
                    cx="100" 
                    cy="20" 
                    rx={Math.max(12, currentIceCapVolume * 1.5)} 
                    ry={Math.max(6, currentIceCapVolume * 0.55)} 
                    fill="#f0f9ff" 
                    fillOpacity="0.85" 
                    stroke="#e0f2fe" 
                    strokeWidth="0.5" 
                  />
                  {/* Southern Glacier Cap */}
                  <ellipse 
                    cx="100" 
                    cy="180" 
                    rx={Math.max(12, currentIceCapVolume * 1.5)} 
                    ry={Math.max(6, currentIceCapVolume * 0.55)} 
                    fill="#f0f9ff" 
                    fillOpacity="0.85" 
                    stroke="#e0f2fe" 
                    strokeWidth="0.5" 
                  />
                </g>
              )}

              {/* Geothermal Heat Belt Warning waves */}
              {activeLayer === 'geothermal' && (
                <g clipPath="url(#globe-clip-bounds)">
                  <ellipse cx="100" cy="100" rx="78" ry="14" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="6 4" opacity="0.6" />
                  <ellipse cx="100" cy="100" rx="78" ry="7" fill="none" stroke="#f97316" strokeWidth="1.2" opacity="0.4" />
                </g>
              )}

              {/* Suspending particulate Smog contrails */}
              {activeLayer === 'aerosols' && (
                <g clipPath="url(#globe-clip-bounds)" fill="none" strokeWidth="2.5" opacity={isHeavy ? 0.8 : 0.3}>
                  <path d="M 0 92 Q 45 106 100 92 T 200 92" stroke={isHeavy ? '#fbbf24' : '#d97706'} strokeDasharray="3 3" />
                  <path d="M 0 112 Q 45 98 100 112 T 200 112" stroke={isHeavy ? '#fbbf24' : '#d97706'} strokeDasharray="2 2" />
                </g>
              )}

              {/* High-fidelity outer glass lens ambient shading */}
              <circle cx="100" cy="100" r="80" fill="url(#hologram-shading)" pointerEvents="none" />

              {/* Crisp clean outermost coordinates bounds line */}
              <circle cx="100" cy="100" r="80" fill="none" stroke={isOptimal ? '#059669' : isHeavy ? '#be123c' : '#ea580c'} strokeWidth="1.25" />
            </svg>

            {/* Orbiting Policy/Emissions Satellite - Simulates elliptical translation without 3D depth */}
            <div 
              className={`absolute w-4.5 h-4.5 bg-emerald-400 rounded-full shadow-[0_0_12px_#10b981] flex items-center justify-center pointer-events-none ${
                isDragging || !autoRotate ? "z-35" : "animate-orbit-satellite"
              }`}
              style={{
                transform: isDragging || !autoRotate ? `translate(${Math.cos((rotationY * Math.PI) / 180) * 105}px, ${Math.sin((rotationY * Math.PI) / 180) * 36}px)` : undefined,
                '--duration': `${durationSec}s`
              } as any}
            >
              <span className="animate-ping absolute inset-0 rounded-full bg-emerald-400/80" />
              <span className="text-[7px] text-slate-950 font-black font-sans leading-none">CO₂</span>
            </div>

          </div>

          {/* Interactive touch legend indicators */}
          <div className="absolute left-2 top-10 pointer-events-none z-20 flex flex-col gap-2">
            <span className="bg-slate-900/90 border border-slate-800 text-[10px] font-mono py-1 px-2.5 rounded-lg flex items-center gap-1.5 shadow-md">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              Forcing Matrix
            </span>
            <span className="bg-slate-900/90 border border-slate-800 text-[10px] font-mono py-1 px-2.5 rounded-lg flex items-center gap-1.5 shadow-md">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              Albedo index
            </span>
          </div>

          <div className="absolute right-2 bottom-10 pointer-events-none z-20 flex flex-col gap-2">
            <span className="bg-slate-900/90 border border-slate-800 text-[10px] font-mono py-1 px-2.5 rounded-lg flex items-center gap-1.5 shadow-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Policy Shield
            </span>
          </div>

        </div>

        {/* Tactical interactive feedback text status */}
        <div className="w-full text-center space-y-1 relative z-20">
          <p className="text-[10px] text-slate-500 font-mono">
            * Drag direct layout to inspect arctic coordinates. Move simulated slider to test future years.
          </p>

          {activeLayer === 'glacier' && (
            <div className="bg-slate-900/40 border border-slate-800/80 p-2.5 rounded-xl flex items-center justify-between text-xs max-w-sm mx-auto">
              <span className="text-slate-400 font-semibold font-sans">Arctic Glacier Layer Volume:</span>
              <span className={`font-mono font-bold ${iceCapStateLabel.color}`}>{iceCapStateLabel.text}</span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
