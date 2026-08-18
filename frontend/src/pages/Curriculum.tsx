import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { BookOpen, Loader2, Library } from "lucide-react";
import api from "../lib/api";

interface CurriculumItem {
  id: number;
  title: string;
  level: string;
  category: string;
  duration: number;
  is_custom: boolean;
}

export default function Curriculum() {
  const [lessons, setLessons] = useState<CurriculumItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCurriculum() {
      try {
        const res = await api.get('/curriculum');
        // Filter out custom lessons, only show the official static curriculum
        const staticLessons = res.data.filter((l: CurriculumItem) => !l.is_custom);
        setLessons(staticLessons);
      } catch (error) {
        console.error("Failed to fetch curriculum:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCurriculum();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-textSecondary">Loading course library...</p>
      </div>
    );
  }

  // Group lessons by level
  const lessonsByLevel = lessons.reduce((acc, lesson) => {
    if (!acc[lesson.level]) acc[lesson.level] = [];
    acc[lesson.level].push(lesson);
    return acc;
  }, {} as Record<string, CurriculumItem[]>);

  const levels = ["Beginner", "Intermediate", "Advanced"];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Library className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-3xl font-semibold text-textPrimary tracking-tight">Course Library</h1>
      </div>

      <p className="text-textSecondary max-w-2xl">
        Explore our complete library of standardized literacy and numeracy lessons. Choose a level to get started with foundational skills.
      </p>

      {levels.map(level => {
        const levelLessons = lessonsByLevel[level] || [];
        if (levelLessons.length === 0) return null;

        return (
          <div key={level} className="space-y-4">
            <h2 className="text-2xl font-semibold text-textPrimary tracking-tight border-b border-border pb-2">
              {level} Courses
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {levelLessons.map((lesson) => (
                <Card key={lesson.id} className="hover:border-primary/50 transition-colors flex flex-col h-full">
                  <CardHeader>
                    <CardTitle className="text-lg flex justify-between items-start">
                      <span>{lesson.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 flex flex-col flex-1">
                    <p className="text-sm text-textSecondary flex-1">
                      {lesson.duration} mins • {lesson.category}
                    </p>
                    <Button 
                      className="w-full flex items-center gap-2 justify-center text-black" 
                      onClick={() => navigate(`/lesson/${lesson.id}`)}
                    >
                      <BookOpen className="w-4 h-4" /> Start Lesson
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}

      {lessons.length === 0 && (
        <div className="p-8 text-center text-textSecondary border border-dashed border-border rounded-lg">
          No courses available at the moment.
        </div>
      )}
    </div>
  );
}
