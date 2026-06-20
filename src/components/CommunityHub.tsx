import React, { useState, useMemo } from 'react';
import { Heart, MessageSquare, Send, Trophy, Plus, HelpCircle, Search, Award, Sparkles, MapPin, Tag } from 'lucide-react';
import { CommentExperience, LeaderboardUser, FootprintEntry, Badge } from '../types';
import { INITIAL_COMMENTS, INITIAL_LEADERBOARD } from '../data';

interface CommunityHubProps {
  logs: FootprintEntry[];
  badges: Badge[];
  selectedLocation: string;
}

export function CommunityHub({ logs, badges, selectedLocation }: CommunityHubProps) {
  const [activeSubTab, setActiveSubTab] = useState<'experiences' | 'leaderboard'>('experiences');
  
  // Storage for comments
  const [comments, setComments] = useState<CommentExperience[]>(() => {
    try {
      const saved = localStorage.getItem('eco_carbon_comments_v1');
      return saved ? JSON.parse(saved) : INITIAL_COMMENTS;
    } catch {
      return INITIAL_COMMENTS;
    }
  });

  // Experiences Form State
  const [authorName, setAuthorName] = useState('');
  const [experienceText, setExperienceText] = useState('');
  const [selectedTag, setSelectedTag] = useState('habits');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Real-time Likes Tracker
  const [likedComments, setLikedComments] = useState<Record<string, boolean>>({});

  // Dynamic user statistics for Leaderboard integration
  const userStats = useMemo(() => {
    const totalEntries = logs.length;
    const avgEmissions = totalEntries > 0
      ? logs.reduce((sum, log) => sum + log.totalCO2, 0) / totalEntries
      : 18.0; // fallback to starting average
    
    const unlockedBadgesCount = badges.filter(b => b.unlocked).length;
    return {
      avg: avgEmissions,
      badges: unlockedBadgesCount,
      streak: totalEntries > 0 ? Math.min(30, Math.max(1, totalEntries * 2)) : 1
    };
  }, [logs, badges]);

  // Merge userStats live into Leaderboard representation
  const dynamicLeaderboard = useMemo((): LeaderboardUser[] => {
    // Clone initial leaderboard, then inject / update the user slot
    const base = INITIAL_LEADERBOARD.map(player => {
      if (player.isYou) {
        return {
          ...player,
          location: selectedLocation,
          dailyAvgKg: Number(userStats.avg.toFixed(1)),
          badgesCount: userStats.badges,
          streakDays: userStats.streak
        };
      }
      return player;
    });

    // Re-sort rank based on daily average emissions (lower is better!)
    const sorted = [...base].sort((a, b) => a.dailyAvgKg - b.dailyAvgKg);
    
    // Assign numerical rank correctly
    return sorted.map((player, idx) => ({
      ...player,
      rank: idx + 1
    }));
  }, [userStats, selectedLocation]);

  // Save comments to localStorage helper
  const saveComments = (newComments: CommentExperience[]) => {
    setComments(newComments);
    localStorage.setItem('eco_carbon_comments_v1', JSON.stringify(newComments));
  };

  const handleLike = (id: string) => {
    const alreadyLiked = likedComments[id];
    const updated = comments.map(c => {
      if (c.id === id) {
        return {
          ...c,
          likes: alreadyLiked ? c.likes - 1 : c.likes + 1
        };
      }
      return c;
    });
    
    setLikedComments(prev => ({
      ...prev,
      [id]: !alreadyLiked
    }));
    saveComments(updated);
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !experienceText.trim()) return;

    const newComment: CommentExperience = {
      id: `comment_${Date.now()}`,
      author: authorName.trim(),
      location: selectedLocation,
      text: experienceText.trim(),
      likes: 0,
      tags: [selectedTag],
      date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    };

    const updatedList = [newComment, ...comments];
    saveComments(updatedList);
    
    // clear fields
    setAuthorName('');
    setExperienceText('');
  };

  // Filtered comments search
  const filteredComments = useMemo(() => {
    if (!searchQuery.substring(0, 50).trim()) return comments;
    const query = searchQuery.toLowerCase();
    return comments.filter(c => 
      c.author.toLowerCase().includes(query) ||
      c.location.toLowerCase().includes(query) ||
      c.text.toLowerCase().includes(query) ||
      c.tags.some(t => t.toLowerCase().includes(query))
    );
  }, [comments, searchQuery]);

  return (
    <div className="bg-[#0b100c]/70 backdrop-blur-md rounded-2xl p-6 border border-emerald-500/10 shadow-xl" id="community-hub-container">
      
      {/* Sub menu selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5 mb-6">
        <div>
          <h2 className="text-lg font-extrabold text-white font-display tracking-tight flex items-center gap-2">
            <Trophy className="w-5 h-5 text-lime-400 animate-bounce" />
            Sustained Community Circle
          </h2>
          <p className="text-zinc-400 text-xs mt-0.5">
            Discuss strategies with fellow low-carbon global citizens and monitor competitive standings.
          </p>
        </div>

        <div className="bg-black/40 p-1.5 rounded-xl flex self-start sm:self-auto border border-emerald-500/10" id="community-sub-tabs">
          <button
            onClick={() => setActiveSubTab('experiences')}
            className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeSubTab === 'experiences' ? 'bg-[#bef264] shadow-sm text-slate-950 font-display' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            Experiences Feed
          </button>
          <button
            onClick={() => setActiveSubTab('leaderboard')}
            className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeSubTab === 'leaderboard' ? 'bg-[#bef264] shadow-sm text-slate-950 font-display' : 'text-zinc-400 hover:text-zinc-205 hover:text-zinc-200'}`}
          >
            Green Leaderboard
          </button>
        </div>
      </div>

      {activeSubTab === 'experiences' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="experiences-view-layout">
          
          {/* Post custom experience Form Column */}
          <div className="bg-[#050805]/50 p-5 rounded-xl border border-white/5 h-fit" id="experience-publish-form-wrapper">
            <h3 className="font-extrabold text-white text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-lime-400" />
              Write Your Experience
            </h3>
            <p className="text-zinc-400 text-[11px] leading-relaxed mb-4">
              Share how you minimized commute runs, upgraded to heat shields, or adapted to seasonal solar output today!
            </p>

            <form onSubmit={handlePostComment} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-zinc-450 block mb-1 uppercase tracking-wide text-zinc-400">
                  Your Full Name / Alias:
                </label>
                <input 
                  type="text"
                  placeholder="e.g. Leo Henderson"
                  required
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full bg-black/60 border border-emerald-500/15 text-stone-200 text-xs rounded-xl py-2 px-3 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-450 block mb-1 uppercase tracking-wide text-zinc-400">
                  Main Carbon Category Category:
                </label>
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="w-full bg-black/60 border border-emerald-500/15 text-[#d9f99d] text-xs font-bold rounded-xl py-2 px-3 focus:outline-none focus:border-lime-400 cursor-pointer"
                >
                  <option value="diet" className="bg-[#0b100c] text-white">Diet & Plant Food</option>
                  <option value="commuting" className="bg-[#0b100c] text-white">Low Carbon Commute</option>
                  <option value="electricity" className="bg-[#0b100c] text-white">Standby Power & Heating</option>
                  <option value="travel" className="bg-[#0b100c] text-white">Radiative Flights & Lodging</option>
                  <option value="habits" className="bg-[#0b100c] text-white">Active Daily Action Habits</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-450 block mb-1 uppercase tracking-wide text-zinc-400">
                  Your Story Note:
                </label>
                <textarea
                  placeholder="e.g. Unplugged all inactive kitchen chargers and setup bike routes to bypass local peak-hour taxi costs today..."
                  required
                  rows={4}
                  value={experienceText}
                  onChange={(e) => setExperienceText(e.target.value)}
                  className="w-full bg-black/60 border border-emerald-500/15 text-stone-200 text-xs rounded-xl py-2 px-3 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 resize-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-lime-450 from-lime-400 to-[#e2ff9d] text-slate-950 hover:opacity-90 font-bold text-xs py-2.5 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Publish Experience Note
              </button>
            </form>
          </div>

          {/* Social feed timeline column */}
          <div className="lg:col-span-2 space-y-4" id="experiences-logs">
            
            {/* Search filtering box */}
            <div className="relative" id="comments-search-box">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input 
                type="text"
                placeholder="Search citizen experiences, tags (e.g. diet, electricity), or authors in real-time..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-250/20 text-slate-800 text-xs rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
              />
            </div>

            {filteredComments.length === 0 ? (
              <div className="p-10 text-center border border-dashed border-slate-200 rounded-xl text-slate-400">
                <MessageSquare className="w-10 h-10 mx-auto text-slate-300 stroke-[1.2] mb-2" />
                <p className="text-xs">No matching citizen stories found.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Adjust your searchQuery criteria or be the first to publish above!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 max-h-[480px] overflow-y-auto pr-1">
                {filteredComments.map((comment) => {
                  const isChamberLiked = likedComments[comment.id];
                  return (
                    <div 
                      key={comment.id}
                      className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 flex flex-col justify-between hover:border-slate-200/60 transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="font-extrabold text-slate-800 text-xs block">{comment.author}</span>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              {comment.location} • {comment.date}
                            </span>
                          </div>

                          <div className="flex gap-1.5">
                            {comment.tags.map((tg, i) => (
                              <span 
                                key={i}
                                className="text-[9px] font-bold uppercase tracking-wide bg-slate-250/60 text-slate-700 py-0.5 px-2 rounded-full flex items-center gap-1 border border-slate-200/20"
                              >
                                <Tag className="w-2.5 h-2.5" />
                                {tg}
                              </span>
                            ))}
                          </div>
                        </div>

                        <p className="text-slate-650 text-xs leading-relaxed font-sans italic">
                          "{comment.text}"
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100/60 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-medium">
                          Inspired other global citizens?
                        </span>
                        
                        <button
                          onClick={() => handleLike(comment.id)}
                          className={`flex items-center gap-1.5 py-1 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${isChamberLiked ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 hover:bg-slate-155 text-slate-600'}`}
                          id={`like-btn-${comment.id}`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isChamberLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                          Likes ({comment.likes})
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>
      ) : (
        <div className="space-y-6" id="leaderboard-view-layout">
          
          {/* Dynamic leaderboard contextual prompt alert */}
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-widest">
                Sustainable Competition Drive
              </h4>
              <p className="text-slate-600 text-xs leading-relaxed mt-0.5">
                The global leaderboard ranks players according to their <strong>average daily carbon expenditure (kg CO₂e)</strong>. Maintain low private vehicle commutes, unplug home appliances, and eat vegan diets to climb ranks. Your live metrics update dynamically!
              </p>
            </div>
          </div>

          {/* Table of Leaders */}
          <div className="bg-slate-50 border border-slate-200/55 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">
                    <th className="py-3 px-4 text-center w-16">Rank</th>
                    <th className="py-3 px-4">Citizen Name</th>
                    <th className="py-3 px-4">Active Region</th>
                    <th className="py-3 px-4 text-center">Daily Average</th>
                    <th className="py-3 px-4 text-center">Badges Unlocks</th>
                    <th className="py-3 px-4 text-center">Active Streak</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 text-xs">
                  {dynamicLeaderboard.map((user) => {
                    const isOptimalWinner = user.dailyAvgKg < 10;
                    return (
                      <tr 
                        key={user.name} 
                        className={`transition-colors ${user.isYou ? 'bg-emerald-500/10 font-bold text-slate-900 border-y-2 border-emerald-500/20' : 'text-slate-700 bg-white hover:bg-slate-50/40'}`}
                      >
                        {/* Rank Medallion */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          {user.rank === 1 ? (
                            <span className="inline-flex items-center justify-center bg-amber-100 text-amber-700 font-bold rounded-full w-6 h-6 border border-amber-300">
                              🥇
                            </span>
                          ) : user.rank === 2 ? (
                            <span className="inline-flex items-center justify-center bg-slate-200 text-slate-800 font-bold rounded-full w-6 h-6 border border-slate-350">
                              🥈
                            </span>
                          ) : user.rank === 3 ? (
                            <span className="inline-flex items-center justify-center bg-amber-50 text-amber-900 font-bold rounded-full w-6 h-6 border border-amber-200">
                              🥉
                            </span>
                          ) : (
                            <span className="font-mono text-slate-500 font-bold">
                              #{user.rank}
                            </span>
                          )}
                        </td>

                        {/* Name panel with identity tags */}
                        <td className="py-3.5 px-4 font-medium whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span>{user.name}</span>
                            {user.isYou && (
                              <span className="text-[9px] bg-emerald-600 text-white py-0.5 px-1.5 rounded uppercase tracking-wider font-extrabold animate-pulse">
                                YOU
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-500 font-sans whitespace-nowrap">
                          {user.location}
                        </td>

                        {/* Daily Average index */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className={`py-1 px-2.5 rounded-lg font-mono font-bold ${isOptimalWinner ? 'text-emerald-700 bg-emerald-100/60' : 'text-orange-700 bg-orange-50'}`}>
                            {user.dailyAvgKg.toFixed(1)} <span className="text-[10px] font-sans font-normal text-slate-400">kg</span>
                          </span>
                        </td>

                        {/* Badges unlocks count indicator */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-800">
                            <Award className="w-4 h-4 text-emerald-600" />
                            {user.badgesCount}
                          </span>
                        </td>

                        {/* Streak daily days */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className="font-mono text-indigo-600 font-bold">
                            🔥 {user.streakDays} Days
                          </span>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* User performance note footer */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 leading-normal">
            <span className="font-bold text-slate-800 block mb-1">Your Diagnostic standing summary:</span>
            Currently you are averaging <strong className="text-emerald-800 font-mono">{userStats.avg.toFixed(1)} kg CO₂e / day</strong> based on your calculators logs dataset. Log lower carbon days to secure the #1 Sven Lindqvist Sweden baseline!
          </div>

        </div>
      )}

    </div>
  );
}
