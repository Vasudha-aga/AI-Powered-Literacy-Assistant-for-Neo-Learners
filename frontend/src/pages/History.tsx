import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Clock, Loader2, ChevronDown, ChevronUp, Edit3, Mic } from "lucide-react";
import { useTranslation } from "react-i18next";
import api from "../lib/api";

interface AssessmentHistory {
  id: number;
  overall_score: number;
  reading_score?: number;
  writing_score?: number;
  speaking_score?: number;
  literacy_level: string;
  feedback?: string;
  created_at: string;
}

export function AssessmentHistoryPage() {
  const { t } = useTranslation();
  const [history, setHistory] = useState<AssessmentHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/assessment/history');
        if (res.data) setHistory(res.data);
      } catch (err) {
        console.error("Failed to fetch history", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const parseFeedback = (raw: string | undefined) => {
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-textPrimary tracking-tight">
        {t('sidebar.history')}
      </h1>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            {t('sidebar.history')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : history.length > 0 ? (
            <div className="space-y-4">
              {history.map((assessment) => {
                const isExpanded = expandedId === assessment.id;
                const feedbackData = parseFeedback(assessment.feedback);

                return (
                  <div 
                    key={assessment.id} 
                    className={`bg-background border transition-colors rounded-custom overflow-hidden ${isExpanded ? 'border-primary' : 'border-borderCustom hover:border-primary/50'}`}
                  >
                    <div 
                      onClick={() => toggleExpand(assessment.id)}
                      className="flex justify-between items-center p-5 cursor-pointer"
                    >
                      <div>
                        <p className="font-medium text-textPrimary text-lg">
                          {t('dashboard.literacyLevel')}: <span className="text-primary">{t(`assessment.levels.${assessment.literacy_level}`) || assessment.literacy_level}</span>
                        </p>
                        <p className="text-sm text-textSecondary mt-1">
                          {new Date(assessment.created_at).toLocaleDateString()} at {new Date(assessment.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-xl">{assessment.overall_score?.toFixed(1)} <span className="text-sm font-normal text-textSecondary">/ 10</span></p>
                        </div>
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-textSecondary" /> : <ChevronDown className="w-5 h-5 text-textSecondary" />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-5 pb-5 pt-2 border-t border-surface">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 mt-4">
                          <div className="bg-surface rounded-custom p-4 text-center border border-borderCustom">
                             <p className="text-sm text-textSecondary mb-1">Reading</p>
                             <p className="text-xl font-semibold text-textPrimary">{assessment.reading_score?.toFixed(1) ?? '-'} <span className="text-sm font-normal text-textSecondary">/ 10</span></p>
                          </div>
                          <div className="bg-surface rounded-custom p-4 text-center border border-borderCustom">
                             <p className="text-sm text-textSecondary mb-1">Writing</p>
                             <p className="text-xl font-semibold text-textPrimary">{assessment.writing_score?.toFixed(1) ?? '-'} <span className="text-sm font-normal text-textSecondary">/ 10</span></p>
                          </div>
                          <div className="bg-surface rounded-custom p-4 text-center border border-borderCustom">
                             <p className="text-sm text-textSecondary mb-1">Speaking</p>
                             <p className="text-xl font-semibold text-textPrimary">{assessment.speaking_score?.toFixed(1) ?? '-'} <span className="text-sm font-normal text-textSecondary">/ 10</span></p>
                          </div>
                        </div>

                        {feedbackData && (
                          <div className="space-y-4">
                            <div className="bg-background border border-borderCustom rounded-custom p-4">
                              <h4 className="font-semibold text-textPrimary mb-2 flex items-center gap-2"><Edit3 className="w-4 h-4 text-primary" /> Writing Feedback</h4>
                              <p className="text-sm text-textSecondary leading-relaxed">{feedbackData?.writing?.overall_feedback || 'No feedback available.'}</p>
                            </div>
                            <div className="bg-background border border-borderCustom rounded-custom p-4">
                              <h4 className="font-semibold text-textPrimary mb-2 flex items-center gap-2"><Mic className="w-4 h-4 text-primary" /> Speaking Feedback</h4>
                              <p className="text-sm text-textSecondary leading-relaxed">{feedbackData?.speaking?.overall_feedback || 'No feedback available.'}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-textSecondary py-8">
              {t('dashboard.notAssessed')}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
