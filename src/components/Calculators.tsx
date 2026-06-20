import { useState, useEffect } from 'react';
import { Bike, Car, Zap, Utensils, Plane, ChevronRight, Fuel, AlertCircle, ShoppingBag } from 'lucide-react';
import { LocationEnvironmentalData, CommuteData, ElectricityData, DietData, TravelData, FootprintEntry } from '../types';
import { COMMUTE_EMISSION_FACTORS, DIET_BASE_EMISSIONS, FOOD_WASTE_FACTORS } from '../data';

interface CalculatorsProps {
  selectedLocation: LocationEnvironmentalData;
  onLogEntry: (entry: Omit<FootprintEntry, 'id' | 'date'>) => void;
}

export function Calculators({ selectedLocation, onLogEntry }: CalculatorsProps) {
  // 1. Commute State
  const [commuteDistance, setCommuteDistance] = useState<number>(15);
  const [transportType, setTransportType] = useState<string>('petrol_car');

  // 2. Electricity State
  const [monthlyKwh, setMonthlyKwh] = useState<number>(450);

  // 3. Diet State
  const [dietType, setDietType] = useState<string>('average_meat');
  const [localFoodPercent, setLocalFoodPercent] = useState<number>(40);
  const [foodWasteLevel, setFoodWasteLevel] = useState<string>('low');

  // 4. Travel State
  const [flightHours, setFlightHours] = useState<number>(10);
  const [trainHours, setTrainHours] = useState<number>(20);
  const [hotelNights, setHotelNights] = useState<number>(8);
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(150);

  // Computed Emissions per day in kg CO2e
  const [commuteEmissions, setCommuteEmissions] = useState(0);
  const [electricityEmissions, setElectricityEmissions] = useState(0);
  const [dietEmissions, setDietEmissions] = useState(0);
  const [travelEmissions, setTravelEmissions] = useState(0);

  // Re-calculate commute emissions
  useEffect(() => {
    const factor = COMMUTE_EMISSION_FACTORS[transportType] ?? 0;
    setCommuteEmissions(commuteDistance * factor);
  }, [commuteDistance, transportType]);

  // Re-calculate electricity emissions based on current location grid intensity!
  useEffect(() => {
    // formula: (monthlyKwh * (intensity in gCO2/kWh) / 1000g) / 30 days
    const dailyEmission = (monthlyKwh * selectedLocation.gridIntensityGCO2) / 1000 / 30;
    setElectricityEmissions(dailyEmission);
  }, [monthlyKwh, selectedLocation.gridIntensityGCO2]);

  // Re-calculate diet emissions
  useEffect(() => {
    const base = DIET_BASE_EMISSIONS[dietType] ?? 4.0;
    // local food gives up to 15% discount
    const localDiscountMultiplier = 1 - (localFoodPercent * 0.15 / 100);
    const wasteFactor = FOOD_WASTE_FACTORS[foodWasteLevel] ?? 0.5;
    
    setDietEmissions((base * localDiscountMultiplier) + wasteFactor);
  }, [dietType, localFoodPercent, foodWasteLevel]);

  // Re-calculate travel emissions
  useEffect(() => {
    // 90kg CO2 per commercial flight hour / 365
    // 15kg CO2 per passenger train hour / 365
    // 20kg CO2 per hotel night / 365
    // 0.1kg CO2 per dollar of regional travel expenditures / 30
    const flightDaily = (flightHours * 90) / 365;
    const trainDaily = (trainHours * 15) / 365;
    const hotelDaily = (hotelNights * 20) / 365;
    const expenseProxyDaily = (monthlyExpenses * 0.1) / 30;

    setTravelEmissions(flightDaily + trainDaily + hotelDaily + expenseProxyDaily);
  }, [flightHours, trainHours, hotelNights, monthlyExpenses]);

  const totalDailyFootprint = commuteEmissions + electricityEmissions + dietEmissions + travelEmissions;

  const handleLogClick = () => {
    onLogEntry({
      commuteCO2: commuteEmissions,
      electricityCO2: electricityEmissions,
      dietCO2: dietEmissions,
      travelCO2: travelEmissions,
      totalCO2: totalDailyFootprint
    });
  };

  return (
    <div className="space-y-6" id="calculators-container">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white font-display tracking-tight">
            Emissions Cost Calculators
          </h2>
          <p className="text-zinc-400 text-xs mt-0.5">
            Fill in your typical parameters below. Calculations are modified dynamically relative to regional statistics.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Commuting Calculator */}
        <div className="bg-[#0b100c]/60 backdrop-blur-md rounded-2xl p-5 border border-emerald-500/10 shadow-lg flex flex-col justify-between" id="calculator-commuting">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="p-2.5 rounded-xl bg-orange-950/40 border border-orange-500/20 text-orange-400">
                <Car className="w-5 h-5" />
              </span>
              <span className="text-xs font-mono font-bold text-orange-400 bg-orange-950/40 border border-orange-500/20 py-1 px-2.5 rounded-full">
                {commuteEmissions.toFixed(2)} kg CO₂e / day
              </span>
            </div>
            <h3 className="font-bold text-white text-sm tracking-tight">
              1. Commute & Private Transport
            </h3>
            <p className="text-zinc-400 text-xs leading-relaxed mt-1">
              Fossil fuels combusted inside cars release direct greenhouse gases.
            </p>

            <div className="space-y-4 mt-5">
              <div>
                <label className="text-xs font-semibold text-zinc-300 flex justify-between">
                  <span>Daily Transit Distance:</span>
                  <span className="font-mono text-lime-400">{commuteDistance} miles</span>
                </label>
                <input 
                  type="range"
                  min="0"
                  max="120"
                  step="1"
                  value={commuteDistance}
                  onChange={(e) => setCommuteDistance(Number(e.target.value))}
                  className="w-full accent-orange-500 h-1.5 bg-neutral-950 rounded-lg appearance-none cursor-pointer mt-2"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">
                  Primary Mode of Transit:
                </label>
                <select
                  value={transportType}
                  onChange={(e) => setTransportType(e.target.value)}
                  className="w-full bg-black/60 border border-emerald-500/10 text-stone-200 text-xs rounded-xl py-2 px-3 focus:outline-none focus:border-lime-400 cursor-pointer"
                >
                  <option value="petrol_car" className="bg-[#0b100c] text-white">Petrol Car (Standard Sedan)</option>
                  <option value="diesel_car" className="bg-[#0b100c] text-white">Diesel SUV / Pickup Truck</option>
                  <option value="electric_car" className="bg-[#0b100c] text-white">Electric Vehicle (Grid charging)</option>
                  <option value="motorcycle" className="bg-[#0b100c] text-white">Motorcycle / Gasoline Moped</option>
                  <option value="bus" className="bg-[#0b100c] text-white">Municipal Public Bus</option>
                  <option value="train" className="bg-[#0b100c] text-white">Rapid Transit Trains/Subway</option>
                  <option value="bicycle_walking" className="bg-[#0b100c] text-white">Bicycle / Electric Scooter / Walking</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="mt-5 pt-3 border-t border-white/5 text-[11px] text-zinc-500 flex items-center gap-1.5">
            <Fuel className="w-3.5 h-3.5 text-orange-400" />
            <span>Factor: {COMMUTE_EMISSION_FACTORS[transportType] || 0} kg CO₂ / mile</span>
          </div>
        </div>

        {/* Electricity Calculator */}
        <div className="bg-[#0b100c]/60 backdrop-blur-md rounded-2xl p-5 border border-emerald-500/10 shadow-lg flex flex-col justify-between" id="calculator-electricity">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/10 text-lime-400">
                <Zap className="w-5 h-5" />
              </span>
              <span className="text-xs font-mono font-bold text-lime-400 bg-emerald-950/40 border border-emerald-500/20 py-1 px-2.5 rounded-full">
                {electricityEmissions.toFixed(2)} kg CO₂e / day
              </span>
            </div>
            <h3 className="font-bold text-white text-sm tracking-tight">
              2. Home Electricity Usage
            </h3>
            <p className="text-zinc-400 text-xs leading-relaxed mt-1">
              Calculated dynamically using the carbon footprint of the local power grid.
            </p>

            <div className="space-y-4 mt-5">
              <div>
                <label className="text-xs font-semibold text-zinc-300 flex justify-between">
                  <span>Monthly Electric Usage:</span>
                  <span className="font-mono text-lime-400">{monthlyKwh} kWh</span>
                </label>
                <input 
                  type="range"
                  min="50"
                  max="2000"
                  step="10"
                  value={monthlyKwh}
                  onChange={(e) => setMonthlyKwh(Number(e.target.value))}
                  className="w-full accent-lime-400 h-1.5 bg-neutral-950 rounded-lg appearance-none cursor-pointer mt-2"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                  <span>Tiny Flat (~150)</span>
                  <span>Avg Home (~800)</span>
                  <span>Large Estate (~1800)</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-950/20 border border-emerald-500/10 rounded-xl">
                <div className="text-[11px] leading-relaxed text-zinc-300">
                  <span className="font-bold text-lime-400">Local Grid Link: </span>
                  You logged your region as <span className="font-semibold text-white">{selectedLocation.name}</span>. Every kWh has an emissions rate of <span className="font-semibold font-mono text-lime-300">{selectedLocation.gridIntensityGCO2}g CO₂e</span>.
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-white/5 text-[11px] text-zinc-500 flex items-center justify-between">
            <span>Grid Context: {selectedLocation.name}</span>
            <span className="font-medium text-lime-400 font-mono">{(monthlyKwh / 30).toFixed(1)} kWh/day</span>
          </div>
        </div>

        {/* Diet Calculator */}
        <div className="bg-[#0b100c]/60 backdrop-blur-md rounded-2xl p-5 border border-emerald-500/10 shadow-lg flex flex-col justify-between" id="calculator-diet">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="p-2.5 rounded-xl bg-teal-950/40 border border-teal-500/20 text-teal-400">
                <Utensils className="w-5 h-5" />
              </span>
              <span className="text-xs font-mono font-bold text-teal-400 bg-teal-950/40 border border-teal-500/10 py-1 px-2.5 rounded-full">
                {dietEmissions.toFixed(2)} kg CO₂e / day
              </span>
            </div>
            <h3 className="font-bold text-white text-sm tracking-tight">
              3. Diet & Food Systems
            </h3>
            <p className="text-zinc-400 text-xs leading-relaxed mt-1">
              Livestock agriculture produces massive methane. Processing & transport also count.
            </p>

            <div className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 mb-1 block">
                  Dietary Style:
                </label>
                <select
                  value={dietType}
                  onChange={(e) => setDietType(e.target.value)}
                  className="w-full bg-[#050805]/80 border border-emerald-500/10 text-[#d9f99d] text-xs rounded-xl py-2 px-3 focus:outline-none focus:border-lime-400 cursor-pointer font-semibold"
                >
                  <option value="high_meat" className="bg-[#0b100c] text-white">High Meat Consumer (Beef/Pork daily)</option>
                  <option value="average_meat" className="bg-[#0b100c] text-white">Average Meat/Poultry Diet</option>
                  <option value="low_meat" className="bg-[#0b100c] text-white">Low Meat / Flexitarian / Low-Dairy</option>
                  <option value="vegetarian" className="bg-[#0b100c] text-white">Vegetarian (No meat, relies on dairy/eggs)</option>
                  <option value="vegan" className="bg-[#0b100c] text-white">100% Plant-Based Vegan</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-300 flex justify-between">
                    <span>Local Produce:</span>
                    <span className="font-mono text-lime-400">{localFoodPercent}%</span>
                  </label>
                  <input 
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={localFoodPercent}
                    onChange={(e) => setLocalFoodPercent(Number(e.target.value))}
                    className="w-full accent-teal-400 h-1.5 bg-neutral-950 rounded-lg appearance-none cursor-pointer mt-1"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-300 mb-1 block">
                    Food Waste Level:
                  </label>
                  <select
                    value={foodWasteLevel}
                    onChange={(e) => setFoodWasteLevel(e.target.value)}
                    className="w-full bg-[#050805]/80 border border-emerald-500/10 text-stone-200 text-[11px] rounded-xl py-1 px-2.5 focus:outline-none focus:border-lime-400 cursor-pointer font-medium"
                  >
                    <option value="none" className="bg-[#0b100c] text-white">None / Compost</option>
                    <option value="low" className="bg-[#0b100c] text-white">Low Waste</option>
                    <option value="medium" className="bg-[#0b100c] text-white">Medium Waste</option>
                    <option value="high" className="bg-[#0b100c] text-white">High Waste</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-white/5 text-[11px] text-zinc-500 flex items-center justify-between">
            <span>Methane CH₄ accounted</span>
            <span>Local discount up to -15%</span>
          </div>
        </div>

        {/* Travel Expenses & Long Distance Flights */}
        <div className="bg-[#0b100c]/60 backdrop-blur-md rounded-2xl p-5 border border-emerald-500/10 shadow-lg flex flex-col justify-between" id="calculator-travel">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/15 text-indigo-400">
                <Plane className="w-5 h-5" />
              </span>
              <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950/40 border border-indigo-500/15 py-1 px-2.5 rounded-full">
                {travelEmissions.toFixed(2)} kg CO₂e / day
              </span>
            </div>
            <h3 className="font-bold text-white text-sm tracking-tight">
              4. Travel, Hotels & Expenditure proxy
            </h3>
            <p className="text-zinc-400 text-xs leading-relaxed mt-1">
              Amortized annual long-distance flights, train logs, and general consumer travel spending.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div>
                <label className="text-[11px] font-semibold text-zinc-300">
                  Flight Hours (Annual):
                </label>
                <input 
                  type="number"
                  min="0"
                  max="400"
                  value={flightHours}
                  onChange={(e) => setFlightHours(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-[#050805]/80 border border-emerald-500/10 text-stone-100 font-mono text-xs rounded-xl py-1.5 px-3 mt-1.5 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-300">
                  Train Hours (Annual):
                </label>
                <input 
                  type="number"
                  min="0"
                  max="400"
                  value={trainHours}
                  onChange={(e) => setTrainHours(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-[#050805]/80 border border-emerald-500/10 text-stone-100 font-mono text-xs rounded-xl py-1.5 px-3 mt-1.5 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-300">
                  Hotel Nights (Annual):
                </label>
                <input 
                  type="number"
                  min="0"
                  max="365"
                  value={hotelNights}
                  onChange={(e) => setHotelNights(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-[#050805]/80 border border-emerald-500/10 text-stone-100 font-mono text-xs rounded-xl py-1.5 px-3 mt-1.5 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1">
                  <ShoppingBag className="w-3 h-3 text-indigo-400" />
                  Travel Expenses ($):
                </label>
                <input 
                  type="number"
                  min="0"
                  value={monthlyExpenses}
                  onChange={(e) => setMonthlyExpenses(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-[#050805]/80 border border-emerald-500/10 text-stone-100 font-mono text-xs rounded-xl py-1.5 px-3 mt-1.5 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-zinc-500 flex items-center justify-between">
            <span>High altitude radiative forcing</span>
            <span>Est: ~90kg CO₂/flight-hr</span>
          </div>
        </div>

      </div>

      {/* Aggregate logging and dashboard preview row */}
      <div className="bg-[#0b100c]/70 backdrop-blur-md border border-[#a3e635]/15 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden shadow-2xl" id="log-trigger-banner">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-[#bef264] to-[#a3e635] text-slate-950 rounded-xl font-bold font-mono text-lg shrink-0 shadow-[0_0_15px_rgba(163,230,53,0.3)]">
            {totalDailyFootprint.toFixed(1)}
            <span className="text-[10px] block text-center uppercase tracking-wide font-normal -mt-1 font-sans">kg/day</span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white tracking-tight">
              Compound Daily Footprint Estimation
            </h4>
            <p className="text-zinc-400 text-xs">
              Based on your custom commuting logs, dietary mixes, and {selectedLocation.name} grid load factors.
            </p>
          </div>
        </div>

        <button
          onClick={handleLogClick}
          id="log-footprint-btn"
          className="w-full sm:w-auto bg-gradient-to-r from-lime-400 to-[#e2ff9d] hover:opacity-90 text-slate-950 font-bold text-xs py-3.5 px-6 rounded-xl shadow-lg shadow-lime-400/20 flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap active:scale-[0.98]"
        >
          Post This to Log History
          <ChevronRight className="w-4 h-4 shrink-0" />
        </button>
      </div>
    </div>
  );
}
