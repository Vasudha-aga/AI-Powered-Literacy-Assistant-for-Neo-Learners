import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { ArrowLeft, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import api from "../lib/api";

interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: string;
}

interface DynamicLessonData {
  id: number;
  title: string;
  content: string;
  suggested_duration: number;
  quiz: QuizQuestion[];
}

export default function LessonView() {
  const { id } = useParams<{ id: string }>();
  const [lesson, setLesson] = useState<DynamicLessonData | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const response = await api.get(`/learning_path/curriculum/${id}`);
        setLesson(response.data);
      } catch (error) {
        console.error("Failed to load lesson", error);
        navigate("/learning-path");
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchLesson();
    }
  }, [id, navigate]);

  const handleOptionSelect = (questionIndex: number, option: string) => {
    if (submitted) return;
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: option
    }));
  };

  const handleReattempt = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
  };

  const handleSubmit = async () => {
    if (!lesson) return;
    setSaving(true);
    
    // Calculate score
    let correctCount = 0;
    lesson.quiz.forEach((q, idx) => {
      if (answers[idx] === q.correct_answer) {
        correctCount++;
      }
    });
    
    const calculatedScore = (correctCount / lesson.quiz.length) * 10;
    setScore(calculatedScore);
    setSubmitted(true);
    
    // Save progress to backend
    try {
      await api.post('/learning_path/progress', {
        curriculum_id: lesson.id,
        status: "completed",
        score: calculatedScore
      });
    } catch (error) {
      console.error("Failed to save progress", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-textSecondary">Loading lesson...</div>;
  }

  if (!lesson) {
    return null; 
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate("/learning-path")} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Learning Path
      </Button>

      <Card className="border-primary/20">
        <CardHeader className="bg-primary/5 pb-8 border-b border-border">
          <CardTitle className="text-2xl">{lesson.title}</CardTitle>
          <p className="text-textSecondary text-sm mt-2">Suggested Duration: {lesson.suggested_duration} mins</p>
        </CardHeader>
        <CardContent className="pt-8">
          <div className="prose prose-invert max-w-none text-textPrimary leading-relaxed whitespace-pre-wrap">
            {lesson.content}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold mt-8">Knowledge Check</h2>
        {lesson.quiz.map((q, qIndex) => (
          <Card key={qIndex} className={submitted ? (answers[qIndex] === q.correct_answer ? "border-green-500/50" : "border-red-500/50") : ""}>
            <CardHeader>
              <CardTitle className="text-lg font-medium">{qIndex + 1}. {q.question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {q.options.map((option, oIndex) => {
                const isSelected = answers[qIndex] === option;
                const isCorrect = option === q.correct_answer;
                
                let buttonVariant: "outline" | "default" | "secondary" = isSelected ? "default" : "outline";
                let icon = null;
                
                if (submitted) {
                  if (isCorrect) {
                    buttonVariant = "default"; // Highlight correct answer
                    icon = <CheckCircle2 className="w-4 h-4 text-green-400" />;
                  } else if (isSelected && !isCorrect) {
                    buttonVariant = "secondary"; // Highlight wrong selection
                    icon = <XCircle className="w-4 h-4 text-red-400" />;
                  } else {
                    buttonVariant = "outline";
                  }
                }

                return (
                  <Button
                    key={oIndex}
                    variant={buttonVariant}
                    className={`w-full justify-start h-auto py-3 px-4 text-left font-normal ${buttonVariant === 'default' ? 'text-black' : ''}`}
                    onClick={() => handleOptionSelect(qIndex, option)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{option}</span>
                      {icon}
                    </div>
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        {!submitted ? (
          <Button 
            onClick={handleSubmit} 
            disabled={Object.keys(answers).length < lesson.quiz.length || saving}
            className="w-full md:w-auto text-black"
          >
            {saving ? "Submitting..." : "Submit Quiz"}
          </Button>
        ) : (
          <div className="w-full space-y-4">
            <div className="p-4 bg-background border border-border rounded-lg text-center">
              <p className="text-lg text-textSecondary">Your Score</p>
              <p className="text-3xl font-bold text-primary">{score.toFixed(1)} / 10</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={handleReattempt} variant="outline" className="w-full">
                <RotateCcw className="w-4 h-4 mr-2" /> Reattempt Quiz
              </Button>
              <Button onClick={() => navigate("/learning-path")} className="w-full text-black">
                Return to Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
