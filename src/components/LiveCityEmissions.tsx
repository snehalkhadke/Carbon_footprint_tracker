import React, { useState, useRef } from 'react';
import { Search, Wind, AlertTriangle, CheckCircle, Flame, MapPin, Download } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import domtoimage from 'dom-to-image-more';
import { motion, AnimatePresence } from 'motion/react';

interface AirQualityData {
  time: string;
  carbon_monoxide: number;
  nitrogen_dioxide: number;
  ozone: number;
  pm10: number;
  pm2_5: number;
  european_aqi: number;
}

interface HourlyData {
  time: string;
  co: number;
}

export function LiveCityEmissions() {
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    location: string;
    country: string;
    airQuality: AirQualityData;
    hourlyData: HourlyData[];
  } | null>(null);

  const chartRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const exportChart = async () => {
    if (!chartRef.current) return;
    try {
      setIsExporting(true);
      const url = await domtoimage.toPng(chartRef.current, {
        bgcolor: '#050805',
        quality: 1,
      });
      const link = document.createElement('a');
      link.download = `${data?.location || 'City'}_CO_Trend.png`;
      link.href = url;
      link.click();
    } catch (err) {
      console.error('Failed to export chart snapshot:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const fetchCityData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim()) return;

    setLoading(true);
    setError(null);
    setData(null);

    try {
      // 1. Geocoding API to get coordinates
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error('City not found. Please check spelling and try again.');
      }

      const location = geoData.results[0];

      // 2. Air Quality API to get Live Data and Historical Data
      const aqRes = await fetch(
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${location.latitude}&longitude=${location.longitude}&current=carbon_monoxide,nitrogen_dioxide,ozone,pm10,pm2_5,european_aqi&hourly=carbon_monoxide&past_days=3`
      );
      const aqData = await aqRes.json();

      if (!aqData.current) {
        throw new Error('Live emissions data currently unavailable for this location.');
      }

      // 3. Format Hourly Data for Chart
      const hourlyFormatted: HourlyData[] = [];
      if (aqData.hourly && aqData.hourly.time && aqData.hourly.carbon_monoxide) {
        // We might get multiple days of hourly data. Let's filter to past 72 hours up to current time roughly.
        // Filtering out null values just in case
        for (let i = 0; i < aqData.hourly.time.length; i++) {
          if (aqData.hourly.carbon_monoxide[i] !== null) {
            hourlyFormatted.push({
              time: new Date(aqData.hourly.time[i]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
              co: aqData.hourly.carbon_monoxide[i],
            });
          }
        }
      }

      setData({
        location: location.name,
        country: location.country,
        airQuality: aqData.current,
        hourlyData: hourlyFormatted,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch live API data.');
    } finally {
      setLoading(false);
    }
  };

  const getAQIStatus = (aqi: number) => {
    if (aqi <= 20) return { label: 'Good', color: 'text-lime-400', border: 'border-lime-400/20', icon: CheckCircle };
    if (aqi <= 40) return { label: 'Fair', color: 'text-lime-400', border: 'border-lime-400/20', icon: CheckCircle };
    if (aqi <= 60) return { label: 'Moderate', color: 'text-yellow-400', border: 'border-yellow-400/20', icon: AlertTriangle };
    if (aqi <= 80) return { label: 'Poor', color: 'text-orange-400', border: 'border-orange-400/20', icon: AlertTriangle };
    return { label: 'Very Poor', color: 'text-red-400', border: 'border-red-400/20', icon: Flame };
  };

  return (
    <div className="bg-[#0b100c]/70 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-emerald-500/10">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <h2 className="text-xl font-bold font-display text-white tracking-tight flex items-center gap-2">
            <Wind className="w-5 h-5 text-lime-400" />
            Live City Emissions API
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Fetch real-time atmospheric metrics including Carbon Monoxide (CO) concentration globally.
          </p>
        </div>

        <form onSubmit={fetchCityData} className="w-full md:w-auto relative">
          <input
            type="text"
            placeholder="Enter city name (e.g. Tokyo, Paris)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full md:w-72 bg-black/50 text-white placeholder-zinc-500 rounded-xl py-2.5 pl-4 pr-12 border border-emerald-500/20 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 text-sm transition-all"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-gradient-to-br from-lime-400 to-lime-600 text-slate-950 rounded-lg hover:shadow-[0_0_15px_rgba(163,230,53,0.3)] transition-all flex items-center justify-center disabled:opacity-50"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <Search className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm flex gap-2"
          >
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </motion.div>
        )}

        {data && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="mt-6 space-y-6"
          >
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-lime-400/10 text-lime-400">
                <MapPin className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight leading-none">
                  {data.location}, {data.country}
                </h3>
                <p className="text-xs text-zinc-500 font-mono mt-1">
                  Data recorded: {new Date(data.airQuality.time).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Main Carbon Card */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="col-span-2 bg-[#050805]/80 rounded-2xl p-5 border border-lime-400/20 hover:border-lime-400/40 transition-colors"
              >
                <div className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  Atmospheric Carbon Monoxide
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black font-mono text-lime-400 drop-shadow-[0_0_10px_rgba(163,230,53,0.3)]">
                    {data.airQuality.carbon_monoxide}
                  </span>
                  <span className="text-zinc-500 font-mono text-sm">μg/m³</span>
                </div>
                <p className="text-[10px] text-zinc-500 mt-2 leading-relaxed">
                  CO concentration serves as an index for local fossil fuel and traffic emissions.
                </p>
              </motion.div>

              {/* AQI Overview */}
              {(() => {
                const status = getAQIStatus(data.airQuality.european_aqi);
                const StatusIcon = status.icon;
                return (
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className={`col-span-2 md:col-span-1 border ${status.border} hover:bg-white/5 bg-[#050805]/80 rounded-2xl p-5 flex flex-col justify-between transition-colors`}
                  >
                    <div className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                      European AQI
                    </div>
                    <div className="flex items-end justify-between mt-4">
                      <span className="text-3xl font-black font-mono text-white">
                        {data.airQuality.european_aqi}
                      </span>
                      <div className={`flex flex-col items-end gap-1 ${status.color}`}>
                        <StatusIcon className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase">{status.label}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })()}

              {/* PM2.5 */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="col-span-2 md:col-span-1 bg-[#050805]/80 rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  PM 2.5 Particles
                </div>
                <div className="flex items-baseline gap-1.5 mt-2">
                  <span className="text-2xl font-bold font-mono text-stone-200">
                    {data.airQuality.pm2_5}
                  </span>
                  <span className="text-zinc-500 font-mono text-xs">μg/m³</span>
                </div>
              </motion.div>

              {/* Nitrogen Dioxide */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="col-span-2 md:col-span-1 bg-[#050805]/80 rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  Nitrogen Dioxide
                </div>
                <div className="flex items-baseline gap-1.5 mt-2">
                  <span className="text-2xl font-bold font-mono text-stone-200">
                    {data.airQuality.nitrogen_dioxide}
                  </span>
                  <span className="text-zinc-500 font-mono text-xs">μg/m³</span>
                </div>
              </motion.div>

              {/* Ozone */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="col-span-2 md:col-span-1 bg-[#050805]/80 rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  Ozone (O₃)
                </div>
                <div className="flex items-baseline gap-1.5 mt-2">
                  <span className="text-2xl font-bold font-mono text-stone-200">
                    {data.airQuality.ozone}
                  </span>
                  <span className="text-zinc-500 font-mono text-xs">μg/m³</span>
                </div>
              </motion.div>
              
               {/* PM10 Particles */}
               <motion.div 
                 whileHover={{ scale: 1.01 }}
                 transition={{ type: "spring", stiffness: 400, damping: 25 }}
                 className="col-span-2 md:col-span-2 bg-[#050805]/80 rounded-2xl p-4 border border-white/5 hover:border-white/10 flex items-center justify-between transition-colors"
               >
                <div className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                  PM 10 Particles
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-bold font-mono text-stone-200">
                    {data.airQuality.pm10}
                  </span>
                  <span className="text-zinc-500 font-mono text-xs">μg/m³</span>
                </div>
               </motion.div>
            </div>

            {/* Historical Trend Chart */}
            {data.hourlyData && data.hourlyData.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                ref={chartRef} className="mt-8 bg-[#050805]/80 rounded-2xl p-5 border border-white/5"
              >
                <div className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-lime-400" />
                    Carbon Monoxide (72-Hour Trend)
                  </div>
                  <button 
                    onClick={exportChart}
                    disabled={isExporting}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-lime-400/10 hover:text-lime-400 text-zinc-300 rounded-lg transition-colors border border-white/5 cursor-pointer disabled:opacity-50"
                    title="Download Chart Snapshot"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isExporting ? 'Saving...' : 'Download'}</span>
                  </button>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.hourlyData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCo" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a3e635" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#a3e635" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis 
                        dataKey="time" 
                        stroke="#52525b" 
                        fontSize={10} 
                        tickLine={false}
                        axisLine={false}
                        minTickGap={30}
                      />
                      <YAxis 
                        stroke="#52525b" 
                        fontSize={10} 
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}`}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                        itemStyle={{ color: '#a3e635' }}
                        labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="co" 
                        stroke="#a3e635" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorCo)" 
                        name="CO (μg/m³)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
