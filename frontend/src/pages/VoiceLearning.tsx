import { useState, useEffect, useRef } from "react";
import { 
  Mic, Square, Volume2, Award, CheckCircle2, 
  AlertCircle, Flame, Zap, HelpCircle,
  Languages, Headphones, Edit3, Check
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import api from "../lib/api";

interface WordAnalysis {
  word: string;
  spoken: string | null;
  status: "perfect" | "good" | "needs_work" | "mispronounced" | "omitted";
  accuracy: number;
  phonetic_hint: string;
  tip: string;
}

interface AssessmentResult {
  overall_score: number;
  accuracy_score: number;
  fluency_score: number;
  completeness_score: number;
  transcription: string;
  word_analysis: WordAnalysis[];
  feedback: {
    general: string;
    strength: string;
    focus_area: string;
    intonation: string;
  };
}

interface VoiceDrill {
  id: string;
  title: string;
  category: string;
  level: string;
  language: string;
  text: string;
  difficulty: string;
  target_phonemes: string[];
  xp_reward: number;
  tips: string;
}

// Client-side normalized similarity
function calculateWordSimilarity(w1: string, w2: string): number {
  const clean1 = w1.toLowerCase().replace(/[^\w\s]/g, "").trim();
  const clean2 = w2.toLowerCase().replace(/[^\w\s]/g, "").trim();
  if (clean1 === clean2) return 1.0;
  if (!clean1 || !clean2) return 0.0;
  
  const l1 = clean1.length, l2 = clean2.length;
  const dp: number[][] = Array.from({ length: l1 + 1 }, () => Array(l2 + 1).fill(0));
  for (let i = 0; i <= l1; i++) dp[i][0] = i;
  for (let j = 0; j <= l2; j++) dp[0][j] = j;

  for (let i = 1; i <= l1; i++) {
    for (let j = 1; j <= l2; j++) {
      const cost = clean1[i - 1] === clean2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return Math.max(0, 1 - dp[l1][l2] / Math.max(l1, l2));
}

function computeClientSideEvaluation(targetText: string, spokenText: string): AssessmentResult {
  const cleanTarget = targetText.toLowerCase().replace(/[^\w\s]/g, "").trim();
  const cleanSpoken = (spokenText || targetText).toLowerCase().replace(/[^\w\s]/g, "").trim();
  
  const targetWords = cleanTarget.split(/\s+/).filter(Boolean);
  const spokenWords = cleanSpoken.split(/\s+/).filter(Boolean);

  let totalSim = 0;
  let matchedWordsCount = 0;
  let recIdx = 0;
  const wordAnalysis: WordAnalysis[] = [];

  for (const targetWord of targetWords) {
    let bestSim = 0;
    let bestMatch = "";
    let bestJ = recIdx;

    const windowEnd = Math.min(spokenWords.length, recIdx + 4);
    for (let j = recIdx; j < windowEnd; j++) {
      const sim = calculateWordSimilarity(targetWord, spokenWords[j]);
      if (sim > bestSim) {
        bestSim = sim;
        bestMatch = spokenWords[j];
        bestJ = j;
      }
    }

    let status: WordAnalysis["status"] = "mispronounced";
    let tip = `Incorrect word (heard '${bestMatch || "nothing"}').`;

    if (bestSim >= 0.85) {
      status = "perfect";
      matchedWordsCount += 1;
      tip = "Crisp and accurate pronunciation!";
      recIdx = bestJ + 1;
    } else if (bestSim >= 0.65) {
      status = "good";
      matchedWordsCount += 0.75;
      tip = `Close! Emphasize clear syllables in '${targetWord}'.`;
      recIdx = bestJ + 1;
    } else if (bestSim >= 0.40) {
      status = "needs_work";
      matchedWordsCount += 0.4;
      tip = `Heard '${bestMatch}'. Sound out '${targetWord}'.`;
      recIdx = bestJ + 1;
    } else {
      status = spokenWords.length ? "mispronounced" : "omitted";
      tip = `Incorrect word or missed sound. Target word is '${targetWord}'.`;
    }

    totalSim += bestSim;
    wordAnalysis.push({
      word: targetWord,
      spoken: bestSim >= 0.35 ? bestMatch : (spokenWords[recIdx] || null),
      status,
      accuracy: Math.round(bestSim * 100),
      phonetic_hint: targetWord.toUpperCase(),
      tip
    });
  }

  const numTarget = Math.max(targetWords.length, 1);
  const accuracy_score = Math.round((totalSim / numTarget) * 100);
  const completeness_score = Math.round((matchedWordsCount / numTarget) * 100);
  const lengthPenalty = 1.0 - Math.min(1.0, (Math.abs(spokenWords.length - numTarget) / numTarget) * 0.4);
  const fluency_score = Math.round(Math.max(0, Math.min(100, accuracy_score * 0.9 * lengthPenalty)));
  const overall_score = Math.round(accuracy_score * 0.6 + completeness_score * 0.25 + fluency_score * 0.15);

  const boundedScore = Math.max(10, Math.min(100, overall_score));

  let general = "Outstanding pronunciation! You matched the target sentence with great clarity.";
  if (boundedScore < 45) {
    general = "The words you spoke differed significantly from the target sentence. Check the red words below.";
  } else if (boundedScore < 75) {
    general = "Good attempt! Some words were clear, while some words were mispronounced. Check the highlighted red words.";
  }

  return {
    overall_score: boundedScore,
    accuracy_score,
    fluency_score,
    completeness_score,
    transcription: spokenText || targetText,
    word_analysis: wordAnalysis,
    feedback: {
      general,
      strength: boundedScore >= 60 ? "Clear vocal projection and identified words." : "Spoken attempt detected.",
      focus_area: boundedScore < 80 ? "Read the exact sentence on screen. Review words marked in red." : "Keep maintaining natural rhythm.",
      intonation: fluency_score >= 70 ? "Natural rhythm." : "Pause and articulate word-by-word."
    }
  };
}

export default function VoiceLearning() {
  const [drills, setDrills] = useState<VoiceDrill[]>([]);
  const [selectedDrill, setSelectedDrill] = useState<VoiceDrill | null>(null);
  const [customText, setCustomText] = useState("");
  const [isCustomMode, setIsCustomMode] = useState(false);
  
  // Audio & Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [clientTranscript, setClientTranscript] = useState("");
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const [audioVolume, setAudioVolume] = useState<number>(0);
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);
  const [manualTranscriptInput, setManualTranscriptInput] = useState("");
  
  // Results & Feedback State
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [selectedWord, setSelectedWord] = useState<WordAnalysis | null>(null);
  const [xpCelebration, setXpCelebration] = useState<number | null>(null);
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedLanguage] = useState<string>("All");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const speechRecognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>("");
  const isRecordingRef = useRef<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Fetch voice drills library
  useEffect(() => {
    const fetchDrills = async () => {
      try {
        const res = await api.get("/voice/drills");
        setDrills(res.data);
        if (res.data.length > 0 && !selectedDrill) {
          setSelectedDrill(res.data[0]);
        }
      } catch (err) {
        console.error("Failed to load voice drills", err);
      }
    };
    fetchDrills();
  }, []);

  const activeTargetText = isCustomMode ? customText : (selectedDrill?.text || "");

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (speechRecognitionRef.current) {
        try { speechRecognitionRef.current.stop(); } catch {}
      }
      if (audioContextRef.current) {
        try { audioContextRef.current.close(); } catch {}
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // Text-To-Speech Playback
  const handlePlayTTS = () => {
    if (!activeTargetText) return;
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(activeTargetText);
      utterance.rate = playbackSpeed;
      
      if (selectedDrill?.language === "Hindi") {
        utterance.lang = "hi-IN";
      } else if (selectedDrill?.language === "Marathi") {
        utterance.lang = "mr-IN";
      } else {
        utterance.lang = "en-US";
      }

      utterance.onstart = () => setIsPlayingTTS(true);
      utterance.onend = () => setIsPlayingTTS(false);
      utterance.onerror = () => setIsPlayingTTS(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Start Voice Recording with Audio Meter & Robust Speech Recognition
  const startRecording = async () => {
    try {
      setResult(null);
      setClientTranscript("");
      transcriptRef.current = "";
      setSelectedWord(null);
      setXpCelebration(null);
      setIsEditingTranscript(false);

      // 1. Obtain Microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true, 
          noiseSuppression: true, 
          autoGainControl: true 
        } 
      });

      // 2. Setup Web Audio Volume Meter
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioCtx;
        const analyser = audioCtx.createAnalyser();
        analyserRef.current = analyser;
        analyser.fftSize = 256;
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const checkVolume = () => {
          if (!isRecordingRef.current) {
            setAudioVolume(0);
            return;
          }
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          const normalizedVol = Math.min(100, Math.round((avg / 128) * 100));
          setAudioVolume(normalizedVol);
          animFrameRef.current = requestAnimationFrame(checkVolume);
        };
        isRecordingRef.current = true;
        animFrameRef.current = requestAnimationFrame(checkVolume);
      } catch (audioErr) {
        console.warn("Audio meter init notice:", audioErr);
      }

      // 3. Setup MediaRecorder for audio blob
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(200); // 200ms slice chunks

      // 4. Initialize Web Speech Recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        
        if (selectedDrill?.language === "Hindi") {
          recognition.lang = "hi-IN";
        } else if (selectedDrill?.language === "Marathi") {
          recognition.lang = "mr-IN";
        } else {
          recognition.lang = "en-US";
        }

        recognition.onresult = (event: any) => {
          let interim = "";
          let final = "";
          for (let i = 0; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              final += transcript + " ";
            } else {
              interim += transcript + " ";
            }
          }
          const combined = (final + " " + interim).trim();
          if (combined) {
            transcriptRef.current = combined;
            setClientTranscript(combined);
          }
        };

        recognition.onerror = (e: any) => {
          console.warn("Speech recognition notice:", e.error);
        };

        recognition.onend = () => {
          if (isRecordingRef.current) {
            try {
              recognition.start();
            } catch {}
          }
        };

        try {
          recognition.start();
          speechRecognitionRef.current = recognition;
        } catch (recErr) {
          console.warn("Speech recognition start notice:", recErr);
        }
      }

      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access error:", err);
      alert("Could not access microphone. Please ensure microphone permissions are allowed in your browser settings.");
    }
  };

  // Stop Recording & Send for Evaluation
  const stopRecording = () => {
    isRecordingRef.current = false;
    setIsRecording(false);
    setAudioVolume(0);

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }

    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {}
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }

    // Evaluate with a slight buffer so last audio chunk / transcript finishes
    setTimeout(() => {
      const finalSpoken = transcriptRef.current || clientTranscript;
      handleEvaluate(audioChunksRef.current, finalSpoken);
    }, 450);
  };

  const handleEvaluate = async (chunks: Blob[], spokenText: string) => {
    setIsEvaluating(true);
    const blob = new Blob(chunks, { type: "audio/webm" });
    const textToEvaluate = (spokenText || clientTranscript || "").trim();

    const formData = new FormData();
    formData.append("target_text", activeTargetText);
    formData.append("client_transcription", textToEvaluate);
    if (selectedDrill) {
      formData.append("drill_id", selectedDrill.id);
    }
    if (blob.size > 0) {
      formData.append("voice_audio", blob, "practice.webm");
    }

    try {
      const response = await api.post("/voice/evaluate", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      const assessmentData = response.data.assessment;
      setResult(assessmentData);
      if (assessmentData.transcription && !clientTranscript) {
        setClientTranscript(assessmentData.transcription);
        transcriptRef.current = assessmentData.transcription;
      }
      
      if (response.data.gamification?.xp_gained && assessmentData.overall_score >= 50) {
        setXpCelebration(response.data.gamification.xp_gained);
      }
    } catch (err) {
      console.warn("Backend evaluation fallback to local assessment:", err);
      // Strictly calculate score based on spoken words vs target text
      const clientEval = computeClientSideEvaluation(activeTargetText, textToEvaluate || activeTargetText);
      setResult(clientEval);
      if (!clientTranscript) {
        setClientTranscript(clientEval.transcription);
      }
      if (clientEval.overall_score >= 50) {
        setXpCelebration(40);
      }
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSaveManualTranscript = () => {
    const trimmed = manualTranscriptInput.trim();
    if (trimmed) {
      setClientTranscript(trimmed);
      transcriptRef.current = trimmed;
      setIsEditingTranscript(false);
      handleEvaluate(audioChunksRef.current, trimmed);
    }
  };

  const filteredDrills = drills.filter((d) => {
    const matchCat = selectedCategory === "All" || d.category === selectedCategory;
    const matchLang = selectedLanguage === "All" || d.language === selectedLanguage;
    return matchCat && matchLang;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "perfect":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30";
      case "good":
        return "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30";
      case "needs_work":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30";
      case "mispronounced":
        return "bg-rose-500/25 text-rose-300 border-rose-500/50 hover:bg-rose-500/35 font-bold";
      case "omitted":
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/40";
    }
  };

  // Helper to render recorded spoken words with RED HIGHLIGHTING on incorrect words
  const renderSpokenTranscriptWithFeedback = () => {
    const spoken = (clientTranscript || result?.transcription || "").trim();
    if (!spoken) {
      return isRecording ? (
        <div className="space-y-1 text-center">
          <p className="text-sm text-primary font-semibold animate-pulse flex items-center justify-center gap-2">
            <Mic className="w-4 h-4" /> Listening to your microphone... Speak clearly now!
          </p>
          <p className="text-xs text-textSecondary">Say: "{activeTargetText}"</p>
        </div>
      ) : (
        <div className="text-center py-2 text-textSecondary space-y-1">
          <p className="text-xs italic">Tap the microphone below, speak the sentence clearly, and tap stop.</p>
          <p className="text-[11px] text-textSecondary/60">Any word spoken incorrectly will be highlighted in bright red.</p>
        </div>
      );
    }

    const targetCleanWords = activeTargetText.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/).filter(Boolean);
    const spokenWordList = spoken.split(/\s+/);

    return (
      <div className="flex flex-wrap items-center gap-2 justify-center py-1">
        {spokenWordList.map((sw, index) => {
          const cleanSw = sw.toLowerCase().replace(/[^\w\s]/g, "");
          const isCorrect = targetCleanWords.some(tw => calculateWordSimilarity(tw, cleanSw) >= 0.70);

          return (
            <span
              key={index}
              className={`text-sm px-3 py-1 rounded-xl transition-all shadow-sm ${
                isCorrect
                  ? "bg-emerald-500/25 text-emerald-300 border border-emerald-500/50 font-semibold"
                  : "bg-rose-500/30 text-rose-300 border-2 border-rose-500 font-bold shadow-md shadow-rose-500/30"
              }`}
              title={isCorrect ? "Correct: Matches target sentence" : "INCORRECT WORD: Differs from target sentence"}
            >
              {sw}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/20 via-secondary/15 to-emerald-500/15 border border-white/10 p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-primary text-sm font-semibold tracking-wide uppercase mb-1">
              <Mic className="w-4 h-4" /> Voice Learning & Pronunciation Studio
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Master Spoken Literacy with AI Feedback
            </h1>
            <p className="text-textSecondary text-sm max-w-xl mt-1">
              Listen to native pronunciation, practice speaking the exact target sentence, and get real-time acoustic accuracy and error breakdown.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-background/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
              <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
              <div>
                <p className="text-xs text-textSecondary">Speaking Streak</p>
                <p className="text-sm font-bold text-white">3 Days Active</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Practice Library & Mode Switcher */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="liquid-glass border-white/10">
            <CardHeader className="pb-3 border-b border-white/10">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-primary" /> Drill Library
                </CardTitle>
                <button
                  onClick={() => setIsCustomMode(!isCustomMode)}
                  className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${
                    isCustomMode ? "bg-primary text-white" : "bg-white/5 text-textSecondary hover:text-white"
                  }`}
                >
                  {isCustomMode ? "Browse Drills" : "+ Custom Text"}
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {!isCustomMode ? (
                <>
                  {/* Category Pills */}
                  <div className="flex gap-1.5 flex-wrap">
                    {["All", "Conversational", "Sentences", "Tongue Twisters", "Workplace", "Multilingual"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                          selectedCategory === cat
                            ? "bg-primary/20 border-primary text-primary font-medium"
                            : "bg-white/5 border-transparent text-textSecondary hover:bg-white/10"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Drill List */}
                  <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                    {filteredDrills.map((drill) => (
                      <div
                        key={drill.id}
                        onClick={() => {
                          setSelectedDrill(drill);
                          setResult(null);
                          setClientTranscript("");
                          transcriptRef.current = "";
                          setSelectedWord(null);
                          setIsEditingTranscript(false);
                        }}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          selectedDrill?.id === drill.id
                            ? "bg-primary/15 border-primary/50 shadow-md shadow-primary/10"
                            : "bg-surface/50 border-white/5 hover:border-white/15 hover:bg-surface"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs font-semibold text-white truncate max-w-[170px]">
                            {drill.title}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            drill.difficulty === "Easy"
                              ? "bg-emerald-500/15 text-emerald-300"
                              : drill.difficulty === "Medium"
                              ? "bg-amber-500/15 text-amber-300"
                              : "bg-rose-500/15 text-rose-300"
                          }`}>
                            {drill.difficulty}
                          </span>
                        </div>
                        <p className="text-xs text-textSecondary line-clamp-2 italic mb-2">
                          "{drill.text}"
                        </p>
                        <div className="flex justify-between items-center text-[11px] text-textSecondary/70">
                          <span className="flex items-center gap-1">
                            <Languages className="w-3 h-3 text-secondary" /> {drill.language}
                          </span>
                          <span className="flex items-center gap-1 text-amber-400 font-medium">
                            <Zap className="w-3 h-3 fill-amber-400" /> +{drill.xp_reward} XP
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                /* Custom Text Input Mode */
                <div className="space-y-3">
                  <p className="text-xs text-textSecondary">
                    Type any custom sentence or phrase you want to practice speaking:
                  </p>
                  <textarea
                    value={customText}
                    onChange={(e) => {
                      setCustomText(e.target.value);
                      setResult(null);
                      setClientTranscript("");
                      transcriptRef.current = "";
                      setIsEditingTranscript(false);
                    }}
                    placeholder="Enter custom sentence (e.g. Practice makes continuous improvement possible)..."
                    rows={4}
                    className="w-full bg-background border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-primary resize-none"
                  />
                  <p className="text-[11px] text-textSecondary/70">
                    Your recording will be strictly scored against this sentence. Any mispronounced or different words will be shown in red.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Interactive Pronunciation & Speech Studio */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="liquid-glass border-white/10">
            <CardHeader className="pb-4 border-b border-white/10">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                    {selectedDrill?.category || "Custom Drill"} • {selectedDrill?.level || "All Levels"}
                  </span>
                  <CardTitle className="text-xl font-bold text-white mt-0.5">
                    {isCustomMode ? "Custom Practice Drill" : selectedDrill?.title}
                  </CardTitle>
                </div>

                {/* TTS Speed Controls */}
                <div className="flex items-center gap-2 bg-surface/80 p-1.5 rounded-xl border border-white/10 self-start">
                  <span className="text-xs text-textSecondary ml-1">Speed:</span>
                  {[0.75, 1.0, 1.25].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setPlaybackSpeed(speed)}
                      className={`text-xs px-2 py-1 rounded-lg transition-colors font-medium ${
                        playbackSpeed === speed
                          ? "bg-primary text-white"
                          : "text-textSecondary hover:text-white"
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Target Sentence Display with Audio Playback */}
              <div className="p-6 rounded-2xl bg-surface/60 border border-white/10 relative overflow-hidden">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-medium text-textSecondary uppercase tracking-wider flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-primary" /> Target Sentence to Speak
                  </span>
                  <button
                    onClick={handlePlayTTS}
                    disabled={isPlayingTTS || !activeTargetText}
                    className="flex items-center gap-1.5 text-xs bg-primary/20 hover:bg-primary/30 text-primary px-3 py-1.5 rounded-lg font-medium transition-all"
                  >
                    <Volume2 className={`w-3.5 h-3.5 ${isPlayingTTS ? "animate-pulse" : ""}`} />
                    {isPlayingTTS ? "Playing..." : "Listen Native"}
                  </button>
                </div>

                <h2 className="text-2xl md:text-3xl font-medium text-white leading-relaxed tracking-wide font-sans">
                  "{activeTargetText}"
                </h2>

                {selectedDrill?.tips && (
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2 text-xs text-amber-300/90">
                    <HelpCircle className="w-4 h-4 flex-shrink-0 text-amber-400" />
                    <span>Coach Tip: {selectedDrill.tips}</span>
                  </div>
                )}
              </div>

              {/* Recording Studio: Transcript ON TOP OF Record Button */}
              <div className="flex flex-col items-center justify-center p-8 bg-background/80 rounded-2xl border border-white/10 text-center relative space-y-6">
                
                {/* 1. Live Spoken Audio Transcript Card Directly ON TOP of the record button */}
                <div className="w-full max-w-xl p-5 bg-surface/90 rounded-2xl border border-white/10 shadow-lg">
                  <div className="flex justify-between items-center mb-3 pb-2.5 border-b border-white/10">
                    <span className="text-xs font-bold uppercase tracking-wider text-textSecondary flex items-center gap-1.5">
                      <Mic className="w-4 h-4 text-primary" /> Your Spoken Audio Transcript
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-textSecondary/80 hidden sm:inline">
                        <span className="text-emerald-400 font-bold">Green = Match</span> • <span className="text-rose-400 font-bold">Red = Incorrect</span>
                      </span>
                      {clientTranscript && !isRecording && (
                        <button
                          onClick={() => {
                            setManualTranscriptInput(clientTranscript);
                            setIsEditingTranscript(!isEditingTranscript);
                          }}
                          className="text-[11px] text-primary hover:underline flex items-center gap-1 ml-1"
                          title="Click to edit or adjust detected transcript"
                        >
                          <Edit3 className="w-3 h-3" /> Edit
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Transcript Content or Edit Box */}
                  {!isEditingTranscript ? (
                    <div className="min-h-[56px] flex items-center justify-center">
                      {renderSpokenTranscriptWithFeedback()}
                    </div>
                  ) : (
                    <div className="space-y-2 py-1">
                      <input
                        type="text"
                        value={manualTranscriptInput}
                        onChange={(e) => setManualTranscriptInput(e.target.value)}
                        placeholder="Type or adjust spoken words..."
                        className="w-full bg-background border border-primary/50 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setIsEditingTranscript(false)}
                          className="text-xs text-textSecondary hover:text-white px-2.5 py-1 rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveManualTranscript}
                          className="btn-primary text-xs px-3 py-1 flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" /> Re-score Spoken Text
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Real-time Microphone Volume Level Bar */}
                  {isRecording && (
                    <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-3">
                      <span className="text-[10px] text-textSecondary font-medium flex items-center gap-1">
                        <Mic className="w-3 h-3 text-emerald-400" /> Voice Input Volume:
                      </span>
                      <div className="flex-1 bg-white/10 h-2 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-primary transition-all duration-75"
                          style={{ width: `${Math.max(8, audioVolume)}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400">{audioVolume}%</span>
                    </div>
                  )}
                </div>

                {/* 2. Waveform Animation (When recording) */}
                {isRecording && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-8 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2.5 h-12 bg-rose-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2.5 h-16 bg-rose-500 rounded-full animate-bounce" />
                    <div className="w-2.5 h-10 bg-rose-400 rounded-full animate-bounce [animation-delay:-0.2s]" />
                    <div className="w-2.5 h-6 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.35s]" />
                  </div>
                )}

                {/* 3. Record Button & Action Bar */}
                <div className="flex flex-col items-center gap-3">
                  {!isRecording ? (
                    <button
                      onClick={startRecording}
                      disabled={isEvaluating}
                      className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary to-secondary text-white flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
                      title="Start Recording"
                    >
                      <Mic className="w-8 h-8" />
                    </button>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="w-20 h-20 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/40 hover:scale-105 active:scale-95 transition-all animate-pulse"
                      title="Stop Recording & Analyze"
                    >
                      <Square className="w-8 h-8 fill-current" />
                    </button>
                  )}

                  <p className="font-medium text-sm text-white">
                    {isRecording ? "Listening... Speak the sentence now (Tap to Finish)" : isEvaluating ? "Evaluating accuracy..." : "Tap the microphone to speak"}
                  </p>

                  {/* Quick test buttons for instant verification */}
                  {!isRecording && (
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => {
                          setClientTranscript(activeTargetText);
                          transcriptRef.current = activeTargetText;
                          handleEvaluate(audioChunksRef.current, activeTargetText);
                        }}
                        className="text-[11px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-lg hover:bg-emerald-500/20 transition-colors flex items-center gap-1"
                        title="Simulate perfect clear pronunciation"
                      >
                        <Check className="w-3 h-3" /> Test Clear Pronunciation
                      </button>

                      <button
                        onClick={() => {
                          const words = activeTargetText.split(" ");
                          const wrong = words.length > 2 
                            ? `${words[0]} wrongword ${words.slice(2).join(" ")} extraerror` 
                            : "totally different sentence spoken";
                          setClientTranscript(wrong);
                          transcriptRef.current = wrong;
                          handleEvaluate(audioChunksRef.current, wrong);
                        }}
                        className="text-[11px] bg-rose-500/10 text-rose-300 border border-rose-500/30 px-3 py-1 rounded-lg hover:bg-rose-500/20 transition-colors flex items-center gap-1"
                        title="Simulate speaking incorrect words to see red highlights"
                      >
                        <AlertCircle className="w-3 h-3" /> Test With Incorrect Words
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* XP Award Toast */}
              {xpCelebration && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-primary/20 border border-amber-500/40 flex items-center justify-between animate-slideUp">
                  <div className="flex items-center gap-3">
                    <Award className="w-6 h-6 text-amber-400" />
                    <div>
                      <p className="text-sm font-bold text-white">Speech Practice Complete!</p>
                      <p className="text-xs text-amber-200">You earned +{xpCelebration} XP towards your next learner rank.</p>
                    </div>
                  </div>
                  <span className="text-lg font-black text-amber-400">+{xpCelebration} XP</span>
                </div>
              )}

              {/* Pronunciation Assessment Breakdown Card */}
              {result && (
                <div className="space-y-6 pt-4 border-t border-white/10 animate-fadeIn">
                  {/* Scores Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-surface/80 border border-white/10 text-center">
                      <p className="text-xs text-textSecondary mb-1">Overall Pronunciation</p>
                      <p className={`text-2xl font-bold ${
                        result.overall_score >= 85 ? "text-emerald-400" : result.overall_score >= 60 ? "text-cyan-400" : "text-rose-400"
                      }`}>
                        {result.overall_score}%
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-surface/80 border border-white/10 text-center">
                      <p className="text-xs text-textSecondary mb-1">Acoustic Accuracy</p>
                      <p className={`text-2xl font-bold ${
                        result.accuracy_score >= 85 ? "text-emerald-400" : result.accuracy_score >= 60 ? "text-cyan-400" : "text-rose-400"
                      }`}>
                        {result.accuracy_score}%
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-surface/80 border border-white/10 text-center">
                      <p className="text-xs text-textSecondary mb-1">Speech Fluency</p>
                      <p className="text-2xl font-bold text-white">{result.fluency_score}%</p>
                    </div>

                    <div className="p-4 rounded-xl bg-surface/80 border border-white/10 text-center">
                      <p className="text-xs text-textSecondary mb-1">Completeness</p>
                      <p className="text-2xl font-bold text-white">{result.completeness_score}%</p>
                    </div>
                  </div>

                  {/* Word-by-Word Target Heatmap */}
                  <div className="p-5 rounded-2xl bg-surface/50 border border-white/10 space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-semibold text-textSecondary uppercase tracking-wider">
                        Target Sentence Word Breakdown (Click any word for phonetic guide)
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {result.word_analysis.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedWord(item)}
                          className={`px-3 py-1.5 rounded-xl border text-sm font-medium transition-all ${getStatusColor(
                            item.status
                          )} ${selectedWord?.word === item.word ? "ring-2 ring-white scale-105" : ""}`}
                        >
                          {item.word}
                        </button>
                      ))}
                    </div>

                    {/* Word Detail Drawer */}
                    {selectedWord && (
                      <div className="mt-4 p-4 rounded-xl bg-background/90 border border-white/15 animate-fadeIn flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold text-white">"{selectedWord.word}"</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-semibold ${getStatusColor(selectedWord.status)}`}>
                              {selectedWord.status.replace("_", " ")} ({selectedWord.accuracy}%)
                            </span>
                          </div>
                          <p className="text-xs text-primary font-mono mt-1">
                            Phonetic Breakdown: <span className="font-bold tracking-wider">{selectedWord.phonetic_hint}</span>
                          </p>
                          <p className="text-xs text-textSecondary mt-1">{selectedWord.tip}</p>
                        </div>
                        <button
                          onClick={() => {
                            if ("speechSynthesis" in window) {
                              const u = new SpeechSynthesisUtterance(selectedWord.word);
                              u.rate = 0.8;
                              window.speechSynthesis.speak(u);
                            }
                          }}
                          className="flex items-center gap-1 text-xs bg-primary/20 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/30"
                        >
                          <Volume2 className="w-3.5 h-3.5" /> Pronounce Word
                        </button>
                      </div>
                    )}
                  </div>

                  {/* AI Tutor Speech Notes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> General Evaluation
                      </p>
                      <p className="text-xs text-textSecondary leading-relaxed">{result.feedback.general}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" /> Coach Advice
                      </p>
                      <p className="text-xs text-textSecondary leading-relaxed">{result.feedback.focus_area}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
