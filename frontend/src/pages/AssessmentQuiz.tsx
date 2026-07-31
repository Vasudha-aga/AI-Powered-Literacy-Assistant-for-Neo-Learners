import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../lib/api';
import { BookOpen, CheckCircle, ArrowRight, Mic, Square, Edit3, X } from 'lucide-react';

const AssessmentQuiz = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // MCQ State
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  
  // Writing State
  const [writingText, setWritingText] = useState('');
  
  // Speaking State
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // Overall State
  const [currentStep, setCurrentStep] = useState<'mcq' | 'writing' | 'speaking' | 'results'>('mcq');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultLevel, setResultLevel] = useState('');

  const questions = t('assessment.questions', { returnObjects: true }) as any[];

  // --- MCQ Handlers ---
  const handleAnswer = (selectedOption: string) => {
    const currentQ = questions[currentQuestion];
    if (selectedOption === currentQ.answer) {
      setScore(prev => prev + 1);
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setCurrentStep('writing');
    }
  };

  // --- Writing Handlers ---
  const handleNextWriting = () => {
    setCurrentStep('speaking');
  };

  // --- Speaking Handlers ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop()); // Stop microphone
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // --- Submit Complete Assessment ---
  const submitAssessment = async () => {
    setIsSubmitting(true);
    
    // We need to send score, writingText, and audioBlob to the backend.
    // We can use FormData to send files along with other data.
    const formData = new FormData();
    formData.append('reading_score', score.toString());
    formData.append('writing_text', writingText);
    
    if (audioBlob) {
      formData.append('voice_audio', audioBlob, 'recording.webm');
    }

    try {
      const response = await api.post('/assessment/complete', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setResultLevel(response.data.overall_level);
      setCurrentStep('results');
    } catch (err) {
      console.error("Failed to save complete assessment", err);
      // For fallback during dev if endpoint isn't ready
      setResultLevel('Beginner');
      setCurrentStep('results');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Render Steps ---

  if (currentStep === 'results') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="card w-full max-w-md text-center p-8">
          <div className="flex justify-center mb-6">
            <CheckCircle className="w-16 h-16 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-textPrimary mb-2">{t('assessment.results')}</h2>
          
          <div className="bg-primary/10 rounded-custom p-4 mb-8 mt-4">
            <p className="text-xl font-semibold text-primary">
              {t('assessment.level', { level: t(`assessment.levels.${resultLevel}`) || resultLevel })}
            </p>
          </div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {t('assessment.continue')} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (currentStep === 'writing') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
        <button onClick={() => navigate('/dashboard')} className="absolute top-6 right-6 p-2 bg-surface rounded-full text-textSecondary hover:bg-surface/80">
          <X className="w-6 h-6" />
        </button>
        <div className="card w-full max-w-2xl">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-surface">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Edit3 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-textPrimary">{t('assessment.writing.title')}</h1>
              <p className="text-sm text-textSecondary">{t('assessment.writing.subtitle')}</p>
            </div>
          </div>

          <textarea
            className="w-full h-40 p-4 border border-surface rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none bg-background text-textPrimary"
            placeholder={t('assessment.writing.placeholder')}
            value={writingText}
            onChange={(e) => setWritingText(e.target.value)}
          ></textarea>

          <button 
            onClick={handleNextWriting}
            disabled={writingText.trim().length === 0}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('assessment.writing.next')} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (currentStep === 'speaking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
        <button onClick={() => navigate('/dashboard')} className="absolute top-6 right-6 p-2 bg-surface rounded-full text-textSecondary hover:bg-surface/80">
          <X className="w-6 h-6" />
        </button>
        <div className="card w-full max-w-2xl text-center">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-surface text-left">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Mic className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-textPrimary">{t('assessment.speaking.title')}</h1>
              <p className="text-sm text-textSecondary">{t('assessment.speaking.subtitle')}</p>
            </div>
          </div>

          <div className="py-12 flex flex-col items-center justify-center">
            {!isRecording ? (
              <button 
                onClick={startRecording}
                className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors"
              >
                <Mic className="w-10 h-10" />
              </button>
            ) : (
              <button 
                onClick={stopRecording}
                className="w-24 h-24 rounded-full bg-error/10 text-error flex items-center justify-center hover:bg-error/20 transition-colors animate-pulse"
              >
                <Square className="w-10 h-10 fill-current" />
              </button>
            )}
            
            <p className="mt-4 font-medium text-textPrimary">
              {isRecording ? t('assessment.speaking.stop') : (audioBlob ? 'Recorded' : t('assessment.speaking.record'))}
            </p>
          </div>

          <button 
            onClick={submitAssessment}
            disabled={!audioBlob || isSubmitting}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? t('assessment.speaking.processing') : t('assessment.speaking.submit')} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // --- Default: MCQ Step ---
  const currentQ = questions[currentQuestion];
  if (!currentQ) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
      <button onClick={() => navigate('/dashboard')} className="absolute top-6 right-6 p-2 bg-surface rounded-full text-textSecondary hover:bg-surface/80">
        <X className="w-6 h-6" />
      </button>
      <div className="card w-full max-w-2xl">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-surface">
          <div className="bg-primary/10 p-2 rounded-lg">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-textPrimary">{t('assessment.title')}</h1>
            <p className="text-sm text-textSecondary">{t('assessment.subtitle')}</p>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between text-sm text-textSecondary mb-2">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
          </div>
          <div className="w-full bg-surface h-2 rounded-full overflow-hidden">
            <div 
              className="bg-primary h-full transition-all duration-300" 
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <h2 className="text-xl font-medium text-textPrimary mb-6">
          {currentQ.q}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {currentQ.options.map((option: string, index: number) => (
            <button
              key={index}
              onClick={() => handleAnswer(option)}
              className="p-4 text-left border border-surface rounded-xl hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <span className="text-textPrimary font-medium">{option}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssessmentQuiz;
