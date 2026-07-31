import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { BookOpen, TrendingUp, Target, Award, Loader2, PlayCircle, Clock } from "lucide-react";
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
  roadmap: Array<{ step: number, title: string, description: string }>;
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [curriculumRes, pathRes, historyRes] = await Promise.all([
          api.get('/curriculum/'),
          api.get('/assessment/learning_path').catch(() => ({ data: null })),
          api.get('/assessment/history').catch(() => ({ data: [] }))
        ]);
        
        setModules(curriculumRes.data);
        if (pathRes.data) {
          setLearningPath(pathRes.data);
        }
        if (historyRes.data) {
          setHistory(historyRes.data);
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const latestAssessment = history.length > 0 ? history[0] : null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-textPrimary tracking-tight">
          {t('dashboard.welcome')}, {user?.name || 'Learner'}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-custom">
              <Award size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-textSecondary">Literacy Level</p>
              <h3 className="text-2xl font-bold">
                {latestAssessment ? (
                  latestAssessment.literacy_level
                ) : (
                  <span className="text-textSecondary/50 text-xl font-normal">Not Assessed</span>
                )}
              </h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-secondary/10 text-secondary rounded-custom">
              <BookOpen size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-textSecondary">Overall Score</p>
              <h3 className="text-2xl font-bold">
                {latestAssessment ? `${latestAssessment.overall_score.toFixed(1)}/10` : '-'}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-warning/10 text-warning rounded-custom">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-textSecondary">Learning Streak</p>
              <h3 className="text-2xl font-bold">1 Day</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-success/10 text-success rounded-custom">
              <Target size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-textSecondary">Today's Goal</p>
              <h3 className="text-2xl font-bold">0%</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Recommended Learning Path</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : learningPath ? (
                <div className="space-y-4">
                  {learningPath.roadmap.map((item, idx) => (
                    <div key={idx} className="bg-background rounded-custom p-6 border border-borderCustom flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-lg text-primary">Step {item.step}: {item.title}</h4>
                        <p className="text-textSecondary text-sm mt-1">{item.description}</p>
                      </div>
                      <button className="btn-primary">Start</button>
                    </div>
                  ))}
                </div>
              ) : modules.length > 0 ? (
                <div className="space-y-4">
                  {modules.map((module) => (
                    <div key={module.id} className="bg-background rounded-custom p-6 border border-borderCustom flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-lg">{module.title}</h4>
                        <p className="text-textSecondary text-sm mt-1">Level: {module.level} • {module.category}</p>
                      </div>
                      <button className="btn-primary">Start Lesson</button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-textSecondary border border-dashed border-borderCustom rounded-custom">
                  Complete your assessment to generate your personalized learning path.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assessment History Section */}
          {history.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Assessment History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {history.map((assessment) => (
                    <div key={assessment.id} className="flex justify-between items-center p-4 bg-background border border-borderCustom rounded-custom">
                      <div>
                        <p className="font-medium text-textPrimary">
                          Level: <span className="text-primary">{assessment.literacy_level}</span>
                        </p>
                        <p className="text-xs text-textSecondary mt-1">
                          {new Date(assessment.created_at).toLocaleDateString()} at {new Date(assessment.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{assessment.overall_score.toFixed(1)} <span className="text-sm font-normal text-textSecondary">/ 10</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        <div>
          <Card className="h-full border-primary shadow-sm shadow-primary/20">
            <CardHeader className="bg-primary/5 pb-4">
              <CardTitle className="text-primary flex items-center gap-2">
                <Target className="w-5 h-5" />
                Diagnostic Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4 text-center">
                <p className="text-sm text-textSecondary">
                  Take the comprehensive assessment (Reading, Writing, and Speaking) to unlock your personalized learning path.
                </p>
                <button 
                  onClick={() => navigate('/assessment')}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <PlayCircle className="w-5 h-5" />
                  {latestAssessment ? 'Retake Assessment' : 'Start Assessment'}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
