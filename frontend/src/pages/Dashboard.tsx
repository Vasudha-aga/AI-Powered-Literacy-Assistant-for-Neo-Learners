import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { BookOpen, TrendingUp, Target, Award, Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api";

interface Curriculum {
  id: number;
  title: string;
  category: string;
  level: string;
  duration: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [modules, setModules] = useState<Curriculum[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCurriculum = async () => {
      try {
        const response = await api.get('/curriculum/');
        setModules(response.data);
      } catch (error) {
        console.error("Failed to fetch curriculum", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCurriculum();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-textPrimary tracking-tight">
          Welcome back, {user?.name || 'Learner'}
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
              <h3 className="text-2xl font-bold">Beginner</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-secondary/10 text-secondary rounded-custom">
              <BookOpen size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-textSecondary">Lessons Completed</p>
              <h3 className="text-2xl font-bold">0</h3>
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
        <div className="col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Recommended Learning Modules</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
                  No modules available yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Upcoming Quiz</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border border-borderCustom rounded-custom bg-background">
                  <h4 className="font-medium">Diagnostic Assessment</h4>
                  <p className="text-sm text-textSecondary mt-1">Please complete to personalize your path.</p>
                  <button className="btn-outline w-full mt-4">Take Quiz</button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
