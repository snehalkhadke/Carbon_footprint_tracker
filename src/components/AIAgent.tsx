import React, { useState } from 'react';
import { Sparkles, MessageSquare, Send, Bot, AlertCircle, RefreshCw, BadgeInfo, Check } from 'lucide-react';
import { LocationEnvironmentalData, SustainableHabit, ChatMessage } from '../types';

interface AIAgentProps {
  currentEmissions: {
    commuteCO2: number;
    electricityCO2: number;
    dietCO2: number;
    travelCO2: number;
    totalCO2: number;
  };
  selectedLocation: LocationEnvironmentalData;
  habits: SustainableHabit[];
  dailyGoal: number;
}

interface AnalysisResult {
  score: string;
  biggestDriver: string;
  tips: string[];
  regionalInsight: string;
}

export function AIAgent({ currentEmissions, selectedLocation, habits, dailyGoal }: AIAgentProps) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [errorAnalysis, setErrorAnalysis] = useState<string | null>(null);

  // Chat States
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      parts: [{ text: "Hello! I am your AI Climate Advisor. Ask me anything about mitigating carbon emissions, choosing green diets, offsetting transport footprints, or optimizing local power grids." }]
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [sendingChat, setSendingChat] = useState(false);

  // Trigger main Gemini analysis
  const handleAnalyze = async () => {
    setLoadingAnalysis(true);
    setErrorAnalysis(null);
    try {
      const response = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentEmissions,
          location: selectedLocation,
          habits,
          dailyGoal
        })
      });

      if (!response.ok) {
        throw new Error('Could not compile report from AI service.');
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err: any) {
      console.error(err);
      setErrorAnalysis(err.message || 'Connecting to Gemini failed. Check your network or make sure the server is booted.');
    } finally {
      setLoadingAnalysis(false);
    }
  };

  // Chat message sending to general server chatbot proxy
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || sendingChat) return;

    const userText = chatInput.trim();
    const newMessages = [...chatMessages, { role: 'user' as const, parts: [{ text: userText }] }];
    setChatMessages(newMessages);
    setChatInput('');
    setSendingChat(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: chatMessages,
          context: {
            currentEmissions,
            location: selectedLocation,
            dailyGoal
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get answer from AI sustainability server.');
      }

      const data = await response.json();
      setChatMessages([...newMessages, { role: 'model', parts: [{ text: data.reply }] }]);
    } catch (err: any) {
      console.error(err);
      setChatMessages([...newMessages, { 
        role: 'model', 
        parts: [{ text: "I'm sorry, I encountered a communication error with our server-side LLM engine. Please verify that your GEMINI_API_KEY is configured in the secrets menu." }] 
      }]);
    } finally {
      setSendingChat(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-sans" id="ai-agent-container">
      
      {/* Column 1: Analytical Report Compilers */}
      <div className="bg-[#0b100c]/70 backdrop-blur-md rounded-2xl p-6 border border-emerald-500/10 shadow-xl flex flex-col justify-between" id="ai-agent-report">
        <div>
          <div className="flex items-center gap-2 text-lime-400 font-bold text-xs uppercase tracking-widest font-display">
            <Sparkles className="w-4 h-4 text-lime-400 animate-pulse" />
            AI Analytical Advisor
          </div>
          <h3 className="text-lg font-extrabold text-white tracking-tight mt-1 font-display">
            Personal Impact Report
          </h3>
          <p className="text-zinc-400 text-xs mt-1.5 leading-relaxed">
            Send your active numbers (Commutes, electricity bills, and habits) to Gemini for a calibrated thermodynamic breakdown, an immediate carbon letter grade, and location-tailored life hacks.
          </p>

          {errorAnalysis && (
            <div className="mt-4 p-3.5 bg-rose-950/40 border border-rose-500/25 rounded-xl flex items-start gap-2 text-rose-400 text-xs">
              <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Execution Warning:</span> {errorAnalysis}
              </div>
            </div>
          )}

          {/* Analysis Viewboard */}
          {analysis && !loadingAnalysis && (
            <div className="mt-5 space-y-4" id="ai-report-view">
              
              {/* Score / Grade Header */}
              <div className="flex items-center gap-3 bg-[#050805]/80 backdrop-blur-md border border-white/5 p-4 rounded-xl shadow-inner text-white">
                <div className="p-3.5 rounded-xl bg-[#162218] text-lime-400 font-extrabold font-mono text-xl tracking-tighter shrink-0 w-14 h-14 flex items-center justify-center border border-lime-400/20">
                  {analysis.score.replace('Grade: ', '')}
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase text-lime-300 tracking-wider">Your Environmental Index</h4>
                  <p className="text-xs text-zinc-350 font-mono mt-0.5 leading-relaxed">
                    {analysis.biggestDriver}
                  </p>
                </div>
              </div>

              {/* Actionable Tips */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Gemini Curated Mitigation Tips:</span>
                {analysis.tips.map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-[#050805]/40 border border-white/5 p-3 rounded-xl text-xs text-zinc-300 leading-relaxed">
                    <span className="text-lime-400 font-bold bg-emerald-950 rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5 font-mono text-[10px]">
                      {idx + 1}
                    </span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>

              {/* Regional Grid Insight */}
              <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/10 rounded-xl text-xs text-zinc-300">
                <div className="font-bold text-white flex items-center gap-1.5 uppercase text-[10px] tracking-wider mb-1.5 font-display">
                  <BadgeInfo className="w-4 h-4 text-lime-400" />
                  Regional Grid Analytics ({selectedLocation.name})
                </div>
                <p className="leading-relaxed">{analysis.regionalInsight}</p>
              </div>

            </div>
          )}

          {/* Loading Animation Board */}
          {loadingAnalysis && (
            <div className="my-10 text-center space-y-4" id="ai-report-loading">
              <RefreshCw className="w-10 h-10 mx-auto text-lime-400 animate-spin" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-zinc-300">Analysing carbon structures...</p>
                <p className="text-[11px] text-zinc-500 animate-pulse">Consulting regional coal charging intensities and agricultural offsets...</p>
              </div>
            </div>
          )}

          {!analysis && !loadingAnalysis && (
            <div className="p-8 text-center border-2 border-dashed border-emerald-500/10 rounded-2xl my-6 bg-black/20">
              <Bot className="w-10 h-10 mx-auto text-zinc-650 stroke-[1.2] mb-2" />
              <p className="text-zinc-500 text-xs">No analysis compiled yet.</p>
              <p className="text-[11px] text-zinc-650 mt-0.5">Click the compile button below to request feedback from Gemini.</p>
            </div>
          )}
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loadingAnalysis}
          className="w-full bg-[#bef264] hover:bg-[#a3e635] text-slate-950 font-bold text-xs py-3.5 px-6 rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 mt-4 active:scale-[0.98]"
        >
          <Sparkles className="w-4 h-4 animate-bounce" />
          {analysis ? 'Re-Compile Carbon Metrics' : 'Compile AI Footprint Report'}
        </button>
      </div>

      {/* Column 2: Live Chat console */}
      <div className="bg-[#0b100c]/70 backdrop-blur-md rounded-2xl p-6 border border-emerald-500/10 shadow-xl flex flex-col justify-between h-[450px]" id="ai-agent-chat">
        <div className="flex flex-col h-full justify-between">
          <div>
            <div className="flex items-center gap-2 text-lime-400 font-bold text-xs uppercase tracking-widest mb-1 font-display">
              <MessageSquare className="w-4 h-4 text-lime-400" />
              Climate Conversation Desk
            </div>
            <h3 className="text-base font-extrabold text-white tracking-tight font-display">
              Sustainability Chatbot
            </h3>
            <p className="text-zinc-400 text-[11px] leading-relaxed mb-3">
              Ask active questions on transport types, electric setups, food waste, or how high-altitude contrails warm the climate.
            </p>
          </div>

          {/* Chat scroll box */}
          <div className="flex-1 bg-black/40 rounded-xl p-3.5 overflow-y-auto space-y-3.5 max-h-[250px] border border-white/5" id="ai-chat-thread">
            {chatMessages.map((msg, idx) => (
              <div 
                key={idx}
                className={`flex gap-2 text-xs leading-relaxed max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className={`p-2.5 rounded-xl text-xs leading-relaxed ${msg.role === 'user' ? 'bg-[#0f2d11]/75 text-lime-300 border border-lime-400/20 rounded-br-none font-medium' : 'bg-[#050805]/80 text-zinc-350 border border-white/5 shadow-sm rounded-bl-none'}`}>
                  {msg.parts[0].text}
                </div>
              </div>
            ))}
            {sendingChat && (
              <div className="flex gap-2 max-w-[85%]">
                <div className="p-3 bg-black/40 text-zinc-500 border border-white/5 rounded-xl rounded-bl-none text-xs flex items-center gap-1.5 animate-pulse">
                  <Bot className="w-3.5 h-3.5 text-lime-400 animate-spin" />
                  Eco Coach is formulating a response...
                </div>
              </div>
            )}
          </div>

          {/* Chat input box */}
          <form onSubmit={handleSendChat} className="flex gap-2 mt-4" id="ai-chat-form">
            <input 
              type="text"
              placeholder="Ask: 'How can I lower my diet footprint in Berlin?'"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 bg-[#050805]/95 border border-emerald-500/10 text-stone-200 text-xs rounded-xl px-3.5 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400"
            />
            <button
              type="submit"
              disabled={sendingChat || !chatInput.trim()}
              className="p-3 bg-[#bef264] hover:bg-[#a3e635] text-slate-950 rounded-xl transition-colors shrink-0 cursor-pointer disabled:opacity-40"
            >
              <Send className="w-4 h-4 text-slate-950" />
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}
