import { useState, useEffect } from "react";
import { 
  Award, Flame, Zap, Trophy, Crown, CheckCircle2, Sparkles, 
  Target, Globe, Mic, BookOpen, Medal, Lock, TrendingUp 
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import api from "../lib/api";

interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  xp_reward: number;
  unlocked: boolean;
  unlocked_at: string;
}

interface DailyQuest {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  xp_reward: number;
  completed: boolean;
  claimed: boolean;
}

interface LeaderboardUser {
  id: number;
  rank: number;
  name: string;
  avatar: string;
  xp: number;
  level: number;
  streak: number;
  badges: number;
}

export default function Achievements() {
  const [gamification, setGamification] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [claimingQuestId, setClaimingQuestId] = useState<string | null>(null);
  const [claimedNotice, setClaimedNotice] = useState<string | null>(null);

  const fetchGamification = async () => {
    try {
      const [gamRes, leadRes] = await Promise.all([
        api.get("/gamification/status"),
        api.get("/gamification/leaderboard")
      ]);
      setGamification(gamRes.data);
      setLeaderboard(leadRes.data.leaderboard);
    } catch (err) {
      console.error("Failed to load achievements", err);
    }
  };

  useEffect(() => {
    fetchGamification();
  }, []);

  const handleClaimQuest = async (questId: string) => {
    setClaimingQuestId(questId);
    try {
      const res = await api.post(`/gamification/claim_quest?quest_id=${questId}`);
      if (res.data.success) {
        setClaimedNotice(`+${res.data.reward_xp} XP Claimed!`);
        setTimeout(() => setClaimedNotice(null), 3000);
        await fetchGamification();
      }
    } catch (err) {
      console.error("Failed to claim quest", err);
    } finally {
      setClaimingQuestId(null);
    }
  };

  const getBadgeIcon = (iconName: string, unlocked: boolean) => {
    const props = { className: `w-6 h-6 ${unlocked ? "text-amber-400" : "text-slate-500"}` };
    switch (iconName) {
      case "Mic": return <Mic {...props} />;
      case "Sparkles": return <Sparkles {...props} />;
      case "Flame": return <Flame {...props} />;
      case "Zap": return <Zap {...props} />;
      case "Crown": return <Crown {...props} />;
      case "BookOpen": return <BookOpen {...props} />;
      case "CheckCircle2": return <CheckCircle2 {...props} />;
      case "Globe": return <Globe {...props} />;
      case "Target": return <Target {...props} />;
      case "Medal": return <Medal {...props} />;
      case "TrendingUp": return <TrendingUp {...props} />;
      default: return <Award {...props} />;
    }
  };

  const filteredBadges = (gamification?.badges || []).filter((b: Badge) => {
    if (selectedCategory === "all") return true;
    if (selectedCategory === "unlocked") return b.unlocked;
    if (selectedCategory === "locked") return !b.unlocked;
    return b.category === selectedCategory;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/20 via-primary/20 to-secondary/20 border border-white/10 p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold tracking-wide uppercase">
              <Trophy className="w-4 h-4" /> Gamification & Achievements
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Trophies, Streaks & Leaderboards
            </h1>
            <p className="text-textSecondary text-sm max-w-xl">
              Earn XP with daily literacy activities, unlock milestone badges, and climb the peer leaderboard.
            </p>
          </div>

          {/* Level Badge Card */}
          {gamification?.level_info && (
            <div className="bg-background/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 min-w-[240px] flex flex-col justify-center">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-textSecondary uppercase font-medium">Rank Tier</span>
                <span className="text-xs font-bold text-amber-400">Level {gamification.level_info.level}</span>
              </div>
              <p className="text-base font-bold text-white mb-2">{gamification.level_info.title}</p>
              
              {/* XP Progress Bar */}
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mb-1">
                <div 
                  className="bg-gradient-to-r from-amber-400 to-primary h-full transition-all duration-500"
                  style={{ width: `${gamification.level_info.progress_percentage}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-textSecondary">
                <span>{gamification.xp} XP</span>
                <span>{gamification.level_info.xp_needed} XP to next level</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Daily Quests Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" /> Daily Learning Quests
          </h2>
          {claimedNotice && (
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 animate-fadeIn">
              {claimedNotice}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(gamification?.daily_quests || []).map((quest: DailyQuest) => (
            <Card key={quest.id} className="liquid-glass border-white/10">
              <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-bold text-white">{quest.title}</h3>
                    <span className="text-xs text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full">
                      +{quest.xp_reward} XP
                    </span>
                  </div>
                  <p className="text-xs text-textSecondary">{quest.description}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] text-textSecondary">
                    <span>Progress</span>
                    <span>{quest.progress} / {quest.target}</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${quest.completed ? "bg-emerald-400" : "bg-primary"}`}
                      style={{ width: `${Math.min(100, (quest.progress / quest.target) * 100)}%` }}
                    />
                  </div>

                  {quest.completed && !quest.claimed ? (
                    <button
                      onClick={() => handleClaimQuest(quest.id)}
                      disabled={claimingQuestId === quest.id}
                      className="w-full mt-2 btn-primary py-2 text-xs flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Claim Reward
                    </button>
                  ) : quest.claimed ? (
                    <div className="w-full py-2 text-center text-xs text-emerald-400 font-medium bg-emerald-500/10 rounded-xl">
                      ✓ Claimed
                    </div>
                  ) : (
                    <div className="w-full py-2 text-center text-xs text-textSecondary bg-white/5 rounded-xl">
                      In Progress
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Badges & Streak Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Badges & Trophy Cabinet */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="liquid-glass border-white/10">
            <CardHeader className="pb-3 border-b border-white/10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" /> Trophy Showcase ({gamification?.unlocked_count || 0}/{gamification?.total_badges_count || 12} Unlocked)
                </CardTitle>

                {/* Filter tabs */}
                <div className="flex gap-1 flex-wrap">
                  {["all", "unlocked", "voice", "streak", "learning"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-xs px-2.5 py-1 rounded-lg capitalize transition-all ${
                        selectedCategory === cat
                          ? "bg-primary text-white font-medium"
                          : "bg-white/5 text-textSecondary hover:text-white"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredBadges.map((badge: Badge) => (
                  <div
                    key={badge.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      badge.unlocked
                        ? "bg-gradient-to-b from-surface to-amber-500/5 border-amber-500/30 shadow-md shadow-amber-500/5"
                        : "bg-surface/30 border-white/5 opacity-60"
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div className={`p-2.5 rounded-xl ${badge.unlocked ? "bg-amber-500/10 border border-amber-500/20" : "bg-white/5"}`}>
                          {getBadgeIcon(badge.icon, badge.unlocked)}
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          badge.unlocked ? "bg-emerald-500/20 text-emerald-300" : "bg-white/5 text-textSecondary"
                        }`}>
                          {badge.unlocked ? "UNLOCKED" : <Lock className="w-2.5 h-2.5 inline" />}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mb-1">{badge.title}</h4>
                      <p className="text-xs text-textSecondary leading-relaxed">{badge.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-[11px]">
                      <span className="text-amber-400 font-medium">+{badge.xp_reward} XP</span>
                      <span className="text-textSecondary/70 capitalize">{badge.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Streak Heatmap & Leaderboard */}
        <div className="lg:col-span-4 space-y-6">
          {/* Streak Flame Card */}
          <Card className="liquid-glass border-white/10">
            <CardHeader className="pb-3 border-b border-white/10">
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" /> Active Learning Streak
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center gap-3">
                  <Flame className="w-8 h-8 text-amber-400 animate-pulse" />
                  <div>
                    <h3 className="text-2xl font-black text-white">{gamification?.current_streak || 1} Days</h3>
                    <p className="text-xs text-amber-200">Personal Best: {gamification?.longest_streak || 5} Days</p>
                  </div>
                </div>
              </div>

              {/* 30-Day Activity Heatmap Grid */}
              <div>
                <p className="text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">
                  Recent 30-Day Activity
                </p>
                <div className="grid grid-cols-7 gap-1.5">
                  {Array.from({ length: 28 }).map((_, i) => {
                    const isActive = i >= 25; // Recent active days
                    return (
                      <div
                        key={i}
                        className={`h-6 rounded-md flex items-center justify-center text-[10px] font-medium transition-all ${
                          isActive
                            ? "bg-amber-400 text-background font-bold shadow-sm shadow-amber-400/40"
                            : "bg-surface border border-white/5 text-textSecondary/40"
                        }`}
                      >
                        {i + 1}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Leaderboard Card */}
          <Card className="liquid-glass border-white/10">
            <CardHeader className="pb-3 border-b border-white/10">
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" /> Peer Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5">
              {leaderboard.map((user) => (
                <div
                  key={user.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                    user.name.includes("You")
                      ? "bg-primary/20 border-primary/50 text-white font-bold"
                      : "bg-surface/50 border-white/5 text-textSecondary"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 text-center text-xs font-bold ${
                      user.rank === 1 ? "text-amber-400 text-sm" : user.rank === 2 ? "text-slate-300" : user.rank === 3 ? "text-amber-600" : "text-textSecondary"
                    }`}>
                      #{user.rank}
                    </span>
                    <span className="text-base">{user.avatar}</span>
                    <div>
                      <p className="text-xs font-bold text-white leading-tight">{user.name}</p>
                      <p className="text-[10px] text-textSecondary">Lvl {user.level} • {user.streak}d streak</p>
                    </div>
                  </div>

                  <span className="text-xs font-black text-amber-400">{user.xp} XP</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
