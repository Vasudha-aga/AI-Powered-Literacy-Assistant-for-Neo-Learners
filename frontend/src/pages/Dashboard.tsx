import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { 
  BookOpen, Target, Award, Loader2, PlayCircle, Mic, 
  Flame, Sparkles, ArrowRight, Trophy, BarChart3
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import api from "../lib/api";

interface Curriculum {
  id: number;
  title: string;
  category: string;
  level: string;
  duration: number;
}

interface LearningPath {
  recommended_level: string;
  roadmap: Array<{ step: number; title: string; description: string }>;
}

interface AssessmentHistory {
  id: number;
  overall_score: number;
  literacy_level: string;
  created_at: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [modules, setModules] = useState<Curriculum[]>([]);
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [history, setHistory] = useState<AssessmentHistory[]>([]);
  const [gamification, setGamification] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [curriculumRes, pathRes, historyRes, gamRes, recRes] = await Promise.all([
          api.get("/curriculum/").catch(() => ({ data: [] })),
          api.get("/assessment/learning_path").catch(() => ({ data: null })),
          api.get("/assessment/history").catch(() => ({ data: [] })),
          api.get("/gamification/status").catch(() => ({ data: null })),
          api.get("/reports/recommendations").catch(() => ({ data: { recommendations: [] } }))
        ]);
        
        setModules(curriculumRes.data || []);
        if (pathRes.data) setLearningPath(pathRes.data);
        if (historyRes.data) setHistory(historyRes.data);
        if (gamRes.data) setGamification(gamRes.data);
        if (recRes.data?.recommendations) setRecommendations(recRes.data.recommendations);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const latestAssessment = history.length > 0 ? history[0] : null;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header & Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/20 via-secondary/15 to-amber-500/10 border border-white/10 p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Welcome to NeoLearn AI
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              {t("dashboard.welcome")}, {user?.name || "Learner"}!
            </h1>
            <p className="text-textSecondary text-sm max-w-xl mt-1">
              Continue your voice pronunciation practice, complete daily learning quests, and track literacy progress.
            </p>
          </div>

          {/* Gamification Level Status */}
          {gamification?.level_info && (
            <div className="bg-background/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 min-w-[220px]">
              <div className="flex justify-between items-center mb-1 text-xs">
                <span className="text-textSecondary font-medium">Rank Tier</span>
                <span className="text-amber-400 font-bold">Lvl {gamification.level_info.level}</span>
              </div>
              <p className="text-sm font-bold text-white mb-2">{gamification.level_info.title}</p>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mb-1">
                <div 
                  className="bg-gradient-to-r from-amber-400 to-primary h-full transition-all duration-500"
                  style={{ width: `${gamification.level_info.progress_percentage}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-textSecondary">
                <span>{gamification.xp} XP</span>
                <span>{gamification.level_info.xp_needed} XP to Lvl {gamification.level_info.level + 1}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="liquid-glass border-white/10">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <Award size={24} />
            </div>
            <div>
              <p className="text-xs font-medium text-textSecondary">{t("dashboard.literacyLevel")}</p>
              <h3 className="text-xl font-bold text-white">
                {latestAssessment ? (
                  latestAssessment.literacy_level
                ) : (
                  <span className="text-textSecondary/60 text-base font-normal">{t("dashboard.notAssessed")}</span>
                )}
              </h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="liquid-glass border-white/10">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-secondary/10 text-secondary rounded-xl">
              <Mic size={24} />
            </div>
            <div>
              <p className="text-xs font-medium text-textSecondary">Voice Pronunciation</p>
              <h3 className="text-xl font-bold text-white">
                88.5% <span className="text-xs font-normal text-emerald-400 font-medium">+4%</span>
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="liquid-glass border-white/10">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
              <Flame size={24} />
            </div>
            <div>
              <p className="text-xs font-medium text-textSecondary">{t("dashboard.learningStreak")}</p>
              <h3 className="text-xl font-bold text-white">{gamification?.current_streak || 3} Days 🔥</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="liquid-glass border-white/10">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Trophy size={24} />
            </div>
            <div>
              <p className="text-xs font-medium text-textSecondary">Unlocked Badges</p>
              <h3 className="text-xl font-bold text-white">
                {gamification?.unlocked_count || 4} / {gamification?.total_badges_count || 12}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Quick Voice Practice Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-primary/20 via-surface to-secondary/20 border border-primary/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-primary rounded-2xl text-white shadow-lg shadow-primary/30">
            <Mic className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Voice & Pronunciation Studio</h3>
            <p className="text-xs text-textSecondary mt-0.5">
              Practice reading aloud, phoneme drills, and get real-time acoustic score heatmaps.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/voice")}
          className="btn-primary py-2.5 px-5 flex items-center gap-2 text-sm whitespace-nowrap"
        >
          Open Voice Studio <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Grid: Recommended Learning Path + AI Improvement Drills & Diagnostic */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 8 Cols: Recommended Path & Modules */}
        <div className="lg:col-span-8 space-y-6">
          {/* AI Improvement Recommendations */}
          {recommendations.length > 0 && (
            <Card className="liquid-glass border-white/10">
              <CardHeader className="pb-3 border-b border-white/10">
                <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" /> AI Improvement Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {recommendations.map((rec: any) => (
                  <div
                    key={rec.id}
                    onClick={() => navigate(rec.action_url)}
                    className="p-3.5 rounded-xl bg-surface/50 border border-white/5 hover:border-primary/40 cursor-pointer transition-all flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-primary uppercase">{rec.target_skill}</span>
                      <h4 className="text-xs font-bold text-white mt-1 mb-1">{rec.title}</h4>
                      <p className="text-[11px] text-textSecondary line-clamp-2">{rec.description}</p>
                    </div>
                    <span className="text-[11px] text-primary font-medium flex items-center gap-1 mt-3">
                      Start Drill <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Recommended Roadmap */}
          <Card className="liquid-glass border-white/10">
            <CardHeader className="pb-3 border-b border-white/10">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" /> {t("dashboard.recommendedPath")}
                </CardTitle>
                <button
                  onClick={() => navigate("/curriculum")}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  View All Modules →
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : learningPath ? (
                <div className="space-y-3">
                  {learningPath.roadmap.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="bg-surface/50 rounded-xl p-4 border border-white/5 flex justify-between items-center hover:border-white/15 transition-all"
                    >
                      <div>
                        <h4 className="font-semibold text-sm text-primary">
                          {t("dashboard.step")} {item.step}: {item.title}
                        </h4>
                        <p className="text-textSecondary text-xs mt-1">{item.description}</p>
                      </div>
                      <button 
                        onClick={() => navigate("/curriculum")}
                        className="btn-primary py-1.5 px-3 text-xs"
                      >
                        {t("dashboard.start")}
                      </button>
                    </div>
                  ))}
                </div>
              ) : modules.length > 0 ? (
                <div className="space-y-3">
                  {modules.slice(0, 3).map((module) => (
                    <div 
                      key={module.id} 
                      className="bg-surface/50 rounded-xl p-4 border border-white/5 flex justify-between items-center hover:border-white/15 transition-all"
                    >
                      <div>
                        <h4 className="font-semibold text-sm text-white">{module.title}</h4>
                        <p className="text-textSecondary text-xs mt-0.5">
                          {t("dashboard.level")}: {module.level} • {module.category}
                        </p>
                      </div>
                      <button 
                        onClick={() => navigate(`/lesson/${module.id}`)}
                        className="btn-primary py-1.5 px-3 text-xs"
                      >
                        {t("dashboard.startLesson")}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-textSecondary border border-dashed border-white/10 rounded-2xl">
                  {t("dashboard.completeAssessmentPrompt")}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right 4 Cols: Diagnostic Assessment & Progress Reports Card */}
        <div className="lg:col-span-4 space-y-6">
          {/* Diagnostic Assessment Card */}
          <Card className="liquid-glass border-primary/40 shadow-lg shadow-primary/5">
            <CardHeader className="bg-primary/10 pb-4 border-b border-primary/20">
              <CardTitle className="text-primary text-base flex items-center gap-2">
                <Target className="w-5 h-5" />
                {t("dashboard.diagnosticAssessment")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-center">
              <p className="text-xs text-textSecondary leading-relaxed">
                {t("dashboard.diagnosticPrompt")}
              </p>
              <button 
                onClick={() => navigate("/assessment")}
                className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold"
              >
                <PlayCircle className="w-4 h-4" />
                {latestAssessment ? t("dashboard.retakeAssessment") : t("dashboard.startAssessment")}
              </button>
            </CardContent>
          </Card>

          {/* Quick Progress Report Card */}
          <Card className="liquid-glass border-white/10">
            <CardHeader className="pb-3 border-b border-white/10">
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" /> Progress & Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              <p className="text-xs text-textSecondary leading-relaxed">
                Generate an official printable literacy report card with detailed skill growth analytics and certificates.
              </p>
              <button
                onClick={() => navigate("/reports")}
                className="w-full bg-surface hover:bg-white/10 text-white border border-white/10 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
              >
                View Learning Report <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
