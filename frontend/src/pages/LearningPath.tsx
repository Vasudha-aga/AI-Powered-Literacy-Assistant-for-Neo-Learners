import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { BrainCircuit, BookOpen, Loader2, Sparkles, TrendingUp, History } from "lucide-react";
import api from "../lib/api";

interface Recommendation {
  id: number;
  title: string;
  level: string;
  category: string;
  duration: number;
}

interface CustomLesson {
  id: number;
  title: string;
  level: string;
  duration: number;
  attempts: number;
  highest_score: number | null;
  history: any[];
}

interface Proficiency {
  predicted_level: string;
  confidence_score: number;
  factors: any;
}

export default function LearningPath() {
  const [proficiency, setProficiency] = useState<Proficiency | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [customLessons, setCustomLessons] = useState<CustomLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [customTopic, setCustomTopic] = useState("");
  const [generating, setGenerating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const profRes = await api.get('/learning_path/proficiency');
        setProficiency(profRes.data);
        
        const recRes = await api.get('/learning_path/recommendations');
        setRecommendations(recRes.data);

        const customRes = await api.get('/learning_path/custom_lessons');
        setCustomLessons(customRes.data);
      } catch (error) {
        console.error("Failed to fetch learning path data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleGenerateLesson = async () => {
    if (!customTopic.trim()) return;
    setGenerating(true);
    try {
      const response = await api.post('/learning_path/generate_lesson', {
        topic: customTopic,
        proficiency_level: proficiency?.predicted_level || "Beginner"
      });
      // Navigate to the newly generated lesson's ID
      navigate(`/lesson/${response.data.curriculum_id}`);
    } catch (error: any) {
      console.error("Failed to generate lesson:", error);
      const errorMsg = error.response?.data?.detail || "Failed to generate lesson. Please try again.";
      alert(errorMsg);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-textSecondary">Loading your personalized path...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <BrainCircuit className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-3xl font-semibold text-textPrimary tracking-tight">Your Learning Path</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Proficiency Card */}
        <Card className="md:col-span-1 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <TrendingUp className="w-5 h-5" /> 
              Current Level
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-4xl font-bold text-textPrimary" style={{ fontFamily: 'var(--font-display)' }}>
              {proficiency?.predicted_level || "Unknown"}
            </div>
            <p className="text-sm text-textSecondary">Based on your recent activity.</p>
          </CardContent>
        </Card>

        {/* Generate Custom Lesson */}
        <Card className="md:col-span-2 border-secondary/20 bg-secondary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-secondary">
              <Sparkles className="w-5 h-5" /> 
              Generate Custom Lesson
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-textSecondary text-sm">
              Need help with a specific real-world task? Enter a topic below (e.g., "Reading a bus schedule", "Writing a sick leave application") and AI will generate a mini-lesson tailored to your level.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter a topic..."
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                className="flex-1 px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-secondary/50 text-textPrimary"
                disabled={generating}
              />
              <Button onClick={handleGenerateLesson} disabled={!customTopic.trim() || generating} className="bg-secondary hover:bg-secondary/90 text-white">
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommended Static Lessons */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-textPrimary tracking-tight">Recommended For You</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.length > 0 ? (
            recommendations.map((rec) => (
              <Card key={rec.id} className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg flex justify-between items-start">
                    <span>{rec.title}</span>
                    <span className="text-xs px-2 py-1 bg-background rounded-full border border-border text-textSecondary font-normal">
                      {rec.category}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-textSecondary">{rec.duration} mins • {rec.level}</p>
                  <Button variant="outline" className="w-full flex items-center gap-2 justify-center text-textPrimary" onClick={() => navigate(`/lesson/${rec.id}`)}>
                    <BookOpen className="w-4 h-4" /> Start Lesson
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full p-8 text-center text-textSecondary border border-dashed border-border rounded-lg">
              You have completed all available lessons for your level! Use the custom generator to keep learning.
            </div>
          )}
        </div>
      </div>

      {/* User's Custom Lessons */}
      {customLessons.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-textPrimary tracking-tight">Your Custom Lessons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customLessons.map((lesson) => (
              <Card key={lesson.id} className="hover:border-secondary/50 transition-colors border-secondary/20">
                <CardHeader>
                  <CardTitle className="text-lg flex justify-between items-start">
                    <span>{lesson.title}</span>
                    <span className="text-xs px-2 py-1 bg-background rounded-full border border-secondary/50 text-secondary font-normal flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Custom
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center text-sm text-textSecondary">
                    <span className="flex items-center gap-1"><History className="w-4 h-4" /> Attempts: {lesson.attempts}</span>
                    <span>Best Score: {lesson.highest_score !== null ? `${lesson.highest_score.toFixed(1)}/10` : 'N/A'}</span>
                  </div>
                  <Button className="w-full flex items-center gap-2 justify-center text-black" onClick={() => navigate(`/lesson/${lesson.id}`)}>
                    <BookOpen className="w-4 h-4" /> {lesson.attempts > 0 ? "Revisit / Reattempt" : "Start Lesson"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
