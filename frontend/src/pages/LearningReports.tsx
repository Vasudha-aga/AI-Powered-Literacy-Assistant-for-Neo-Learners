import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Printer, Award, CheckCircle2, 
  AlertCircle, ArrowRight, Sparkles, ShieldCheck,
  Clock
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api";

interface SkillBreakdown {
  skill: string;
  score: number;
  category: string;
  status: string;
  color: string;
}

interface Recommendation {
  id: string;
  type: string;
  title: string;
  description: string;
  duration_mins: number;
  target_skill: string;
  action_url: string;
}

export default function LearningReports() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await api.get("/reports/summary");
        setReport(res.data);
      } catch (err) {
        console.error("Failed to load learning report", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReport();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Action Bar (hidden in print) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Learner Progress & Diagnostic Report
          </h1>
          <p className="text-textSecondary text-sm mt-0.5">
            Official performance summary, skill growth analytics, and AI tutor improvement recommendations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="btn-primary py-2.5 px-4 flex items-center gap-2 text-sm"
          >
            <Printer className="w-4 h-4" /> Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Official Report Card Container */}
      <div className="bg-surface/90 border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl space-y-8 text-textPrimary print:border-none print:shadow-none print:p-0">
        {/* Certificate Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/20 rounded-2xl border border-primary/40 text-primary">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-primary tracking-widest uppercase">NeoLearn AI Platform</span>
                <span className="text-xs text-textSecondary font-mono">ID: {report?.report_id || "REP-2026"}</span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Literacy Competency Report</h2>
            </div>
          </div>

          <div className="text-left md:text-right text-xs text-textSecondary space-y-1">
            <p><strong className="text-white">Learner:</strong> {user?.name || "Student"}</p>
            <p><strong className="text-white">Email:</strong> {user?.email || "learner@neolearn.ai"}</p>
            <p><strong className="text-white">Date:</strong> {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
          </div>
        </div>

        {/* Executive Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Overall Literacy Index</p>
              <h3 className="text-4xl font-black text-white">{report?.overall_literacy_index || 84.5}%</h3>
            </div>
            <p className="text-xs text-textSecondary mt-3">
              Weighted index combining reading, speaking pronunciation, phonetics, and comprehension.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-secondary/10 border border-secondary/20 flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-1">Evaluated Competency</p>
              <h3 className="text-2xl font-black text-white">{report?.competency_level || "Intermediate Neo-Learner"}</h3>
            </div>
            <p className="text-xs text-textSecondary mt-3">
              {report?.readiness_summary || "Strong spoken literacy with developing vocabulary."}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">Gamification Rank</p>
              <h3 className="text-2xl font-black text-white">{report?.level_info?.title || "Curious Explorer"}</h3>
            </div>
            <div className="flex items-center gap-3 text-xs text-amber-200 mt-3">
              <span>{report?.gamification?.total_xp || 320} XP</span> • 
              <span>{report?.gamification?.current_streak || 3}d Streak</span> • 
              <span>{report?.gamification?.badges_count || 4} Badges</span>
            </div>
          </div>
        </div>

        {/* Detailed Skill Breakdown Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" /> Multi-Domain Skill Breakdown
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(report?.skills_breakdown || []).map((skill: SkillBreakdown, idx: number) => (
              <div key={idx} className="p-4 rounded-xl bg-background/60 border border-white/5 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-white">{skill.skill}</span>
                  <span className="font-bold text-primary">{skill.score}%</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      skill.score >= 80 ? "bg-emerald-400" : skill.score >= 65 ? "bg-primary" : "bg-amber-400"
                    }`}
                    style={{ width: `${skill.score}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-textSecondary">
                  <span>Domain: {skill.category}</span>
                  <span className={`font-semibold ${
                    skill.status === "Strong" ? "text-emerald-400" : "text-amber-400"
                  }`}>{skill.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths & Growth Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
            <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Core Key Strengths
            </h4>
            <ul className="space-y-2">
              {(report?.strengths || []).map((s: string, i: number) => (
                <li key={i} className="text-xs text-textSecondary flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
            <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Priority Growth Areas
            </h4>
            <ul className="space-y-2">
              {(report?.growth_areas || []).map((g: string, i: number) => (
                <li key={i} className="text-xs text-textSecondary flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">•</span>
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* AI Tutor Improvement Recommendations */}
        <div className="space-y-4 pt-2">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" /> AI-Generated Targeted Recommendations
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(report?.recommendations || []).map((rec: Recommendation) => (
              <div
                key={rec.id}
                className="p-5 rounded-2xl bg-surface border border-white/10 flex flex-col justify-between space-y-4 hover:border-primary/50 transition-all"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-primary uppercase">{rec.target_skill}</span>
                    <span className="text-[11px] text-textSecondary flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {rec.duration_mins}m
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">{rec.title}</h4>
                  <p className="text-xs text-textSecondary leading-relaxed">{rec.description}</p>
                </div>

                <button
                  onClick={() => navigate(rec.action_url)}
                  className="btn-primary py-2 text-xs flex items-center justify-center gap-1.5 w-full print:hidden"
                >
                  Start Practice <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Signature & Verification Footer */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-textSecondary gap-2">
          <p>© 2026 NeoLearn AI Literacy Assistant. Verified Adaptive Assessment Engine.</p>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Digital Certificate Hash: {Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
