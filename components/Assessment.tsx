
import React, { useState, useEffect, useRef } from 'react';
import { User, DailyTask } from '../types';
import { generateAdaptiveQuestion, getAssessmentFeedback } from '../services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import { 
  Download, 
  Cpu, 
  User as UserIcon, 
  ShieldCheck,
  Zap,
  AlertCircle,
  LogOut,
  Lightbulb,
  Camera,
  ArrowRight,
  CheckCircle,
  RefreshCw,
  Mic,
  Smile,
  Loader2,
  TrendingUp,
  Brain,
  Activity,
  Award,
  Star,
  ZapOff,
  Navigation,
  Target,
  FlaskConical,
  Gauge
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip,
  Cell,
  LabelList,
  ResponsiveContainer
} from 'recharts';

interface AssessmentProps {
  user: User;
  dailyTask?: DailyTask | null;
  onBack: () => void;
  onComplete: (newScores: Partial<User['scores']>, sessionQuestions: string[]) => void;
}

const Assessment: React.FC<AssessmentProps> = ({ user, dailyTask, onBack, onComplete }) => {
  const TOTAL_STEPS = dailyTask ? 1 : 5;
  const [sessionState, setSessionState] = useState<'intro' | 'active' | 'processing' | 'report'>('intro');
  const [currentStep, setCurrentStep] = useState(0);
  const [history, setHistory] = useState<{ question: string, answer: string }[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [finalFeedback, setFinalFeedback] = useState<any>(null);
  const [biometricSim, setBiometricSim] = useState({ voice: 0, eye: 0, face: 0 });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (sessionState === 'active' && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [sessionState]);

  useEffect(() => {
    if (!isRecording || !streamRef.current || !analyserRef.current) return;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    let lastFrameData: Uint8ClampedArray | null = null;
    const analyze = () => {
      if (!analyserRef.current || !videoRef.current || !canvasRef.current) return;
      analyserRef.current.getByteFrequencyData(dataArray);
      const averageVolume = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      const voiceScore = Math.min(100, Math.round(averageVolume * 8));
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx && videoRef.current.videoWidth > 0) {
        canvas.width = 160;
        canvas.height = 120;
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const frameData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let diff = 0;
        if (lastFrameData) {
          for (let i = 0; i < frameData.length; i += 4) {
            diff += Math.abs(frameData[i] - lastFrameData[i]);
          }
        }
        lastFrameData = new Uint8ClampedArray(frameData);
        const motionLevel = diff / (canvas.width * canvas.height);
        const eyeScore = Math.max(75, Math.min(99, 100 - (motionLevel / 5)));
        const faceScore = Math.min(98, 85 + (averageVolume * 2));
        setBiometricSim({ voice: voiceScore, eye: Math.round(eyeScore), face: Math.round(faceScore) });
      }
      animationFrameRef.current = requestAnimationFrame(analyze);
    };
    analyze();
    return () => { if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current); };
  }, [isRecording, sessionState]);

  const initSession = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              setTranscript(prev => prev + ' ' + event.results[i][0].transcript);
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
        };
        recognitionRef.current = recognition;
      }
      setSessionState('active');
      loadNextQuestion([]);
    } catch (err) {
      alert("Camera and Microphone access is required for the assessment.");
    }
  };

  const stopHardware = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    if (audioContextRef.current) audioContextRef.current.close();
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (recognitionRef.current) recognitionRef.current.stop();
  };

  const loadNextQuestion = async (currentHistory: { question: string, answer: string }[]) => {
    setIsSynthesizing(true);
    const nextQ = await generateAdaptiveQuestion(
      currentHistory, 
      currentStep, 
      user.askedQuestions || [], 
      user.classSection
    );
    setCurrentQuestion(nextQ);
    setIsSynthesizing(false);
  };

  const handleStartRecording = () => {
    setTranscript("");
    setIsRecording(true);
    if (recognitionRef.current) recognitionRef.current.start();
  };

  const handleStopAndProceed = async () => {
    setIsRecording(false);
    if (recognitionRef.current) recognitionRef.current.stop();
    await new Promise(r => setTimeout(r, 800));
    if (!transcript.trim()) {
      alert("We didn't catch that! Try recording your answer again.");
      return;
    }
    const updatedHistory = [...history, { question: currentQuestion, answer: transcript }];
    setHistory(updatedHistory);
    if (currentStep + 1 < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
      setTranscript("");
      loadNextQuestion(updatedHistory);
    } else {
      setSessionState('processing');
      // The Gemini 3 Flash model should handle this much faster now
      const feedback = await getAssessmentFeedback(updatedHistory);
      setFinalFeedback(feedback);
      setSessionState('report');
      stopHardware();
    }
  };

  const generatePDF = () => {
    if (!finalFeedback) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = 40;

    doc.setFillColor(14, 165, 233);
    doc.rect(0, 0, pageWidth, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('SkillSynth Jr: Neural Audit', margin, 22);
    doc.setFontSize(10);
    doc.text(finalFeedback.aiVision.toUpperCase(), pageWidth - margin, 22, { align: 'right' });

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(14);
    doc.text(`Student: ${user.name}`, margin, yPos + 10);
    yPos += 20;

    const scores = [
      { k: 'Communication', v: finalFeedback.scores.communication },
      { k: 'Confidence', v: finalFeedback.scores.confidence },
      { k: 'Teamwork', v: finalFeedback.scores.teamwork },
      { k: 'Leadership', v: finalFeedback.scores.leadership },
      { k: 'Empathy', v: finalFeedback.scores.empathy },
      { k: 'Resilience', v: finalFeedback.scores.resilience }
    ];

    scores.forEach(s => {
      doc.setFontSize(10);
      doc.text(`${s.k}: ${s.v}%`, margin, yPos);
      doc.setFillColor(241, 245, 249);
      doc.rect(margin + 50, yPos - 3, 100, 4, 'F');
      doc.setFillColor(14, 165, 233);
      doc.rect(margin + 50, yPos - 3, s.v, 4, 'F');
      yPos += 10;
    });

    yPos += 10;
    doc.setFontSize(11);
    const feedbackLines = doc.splitTextToSize(`Coach says: "${finalFeedback.feedback}"`, pageWidth - 40);
    doc.text(feedbackLines, margin, yPos);
    
    doc.save(`NeuralAudit_${user.name.replace(/\s+/g, '_')}.pdf`);
  };

  if (sessionState === 'intro') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-10">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/10 blur-[60px] rounded-full animate-pulse" />
          <div className="w-24 h-24 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] flex items-center justify-center text-blue-600 relative z-10 shadow-2xl">
             <Smile size={52} />
          </div>
        </div>
        <div className="space-y-4">
           <h1 className="text-4xl md:text-5xl font-black dark:text-white tracking-tighter leading-tight">Ready for your DNA Audit?</h1>
           <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto leading-relaxed text-lg">
             A friendly conversation to discover your secret soft-skill superpowers.
           </p>
        </div>
        <div className="flex flex-col space-y-4 w-full max-w-xs pt-4">
          <button onClick={initSession} className="bg-blue-600 text-white px-10 py-6 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-slate-900 transition-all flex items-center justify-center space-x-3 shadow-2xl shadow-blue-500/20 active:scale-95">
             <Camera size={20} />
             <span>Allow Camera & Mic</span>
          </button>
          <button onClick={onBack} className="text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-red-500 transition-colors">Maybe Later</button>
        </div>
      </div>
    );
  }

  if (sessionState === 'processing') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-8 bg-white dark:bg-slate-950 overflow-hidden relative">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="grid grid-cols-6 h-full">
            {[...Array(6)].map((_, i) => <div key={i} className="border-r border-slate-200 dark:border-slate-800" />)}
          </div>
        </div>
        
        <div className="relative">
          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} 
            className="w-32 h-32 border-[8px] border-blue-600 border-t-transparent rounded-full shadow-[0_0_40px_rgba(37,99,235,0.2)]" 
          />
          <div className="absolute inset-0 flex items-center justify-center text-blue-600">
            <FlaskConical size={48} className="animate-bounce" />
          </div>
        </div>

        <div className="text-center space-y-4 relative z-10">
          <h2 className="text-4xl font-black dark:text-white tracking-tighter">Synthesizing Neural Data</h2>
          <div className="flex flex-col items-center space-y-2">
            <p className="font-black text-slate-400 uppercase tracking-[0.3em] text-[11px] flex items-center space-x-2">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />
              <span>Optimizing Latency</span>
            </p>
            <div className="w-48 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ x: '-100%' }}
                 animate={{ x: '100%' }}
                 transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                 className="h-full w-1/2 bg-blue-600"
               />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (sessionState === 'report' && finalFeedback) {
    const radarData = [
      { subject: 'Communication', A: finalFeedback.scores.communication, fullMark: 100 },
      { subject: 'Confidence', A: finalFeedback.scores.confidence, fullMark: 100 },
      { subject: 'Teamwork', A: finalFeedback.scores.teamwork, fullMark: 100 },
      { subject: 'Logic', A: finalFeedback.scores.problemSolving, fullMark: 100 },
      { subject: 'Leadership', A: finalFeedback.scores.leadership, fullMark: 100 },
      { subject: 'Empathy', A: finalFeedback.scores.empathy, fullMark: 100 },
    ];

    const subSkills = [
      { name: 'Pace', val: finalFeedback.speechAnalysis.paceScore, color: '#0EA5E9' },
      { name: 'Energy', val: finalFeedback.speechAnalysis.energyLevel, color: '#F59E0B' },
      { name: 'Resilience', val: finalFeedback.scores.resilience, color: '#8B5CF6' },
      { name: 'Clarity', val: biometricSim.voice || 85, color: '#10B981' }
    ];

    return (
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12 pb-32 overflow-x-hidden">
        <header className="bg-white dark:bg-slate-900 p-12 rounded-[4rem] shadow-2xl flex flex-col lg:flex-row justify-between items-center gap-8 glass-effect border border-slate-50 dark:border-slate-800">
          <div className="space-y-3 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start space-x-3 text-blue-600">
               <ShieldCheck size={28} />
               <span className="text-[10px] font-black uppercase tracking-[0.4em]">Audit Protocol Complete</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black dark:text-white tracking-tighter">Your Neural Dossier</h1>
            <p className="font-black text-xs text-brand-indigo uppercase tracking-[0.3em]">{user.name} • {finalFeedback.aiVision}</p>
          </div>
          <div className="flex space-x-3">
            <button onClick={generatePDF} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-8 py-5 rounded-[1.8rem] font-black uppercase tracking-widest text-[9px] flex items-center space-x-2 hover:bg-slate-200 transition-all shadow-sm"><Download size={16} /> <span>Save Profile</span></button>
            <button onClick={() => onComplete(finalFeedback.scores, history.map(h => h.question))} className="bg-blue-600 text-white px-8 py-5 rounded-[1.8rem] font-black uppercase tracking-widest text-[9px] flex items-center space-x-2 shadow-2xl shadow-blue-500/20 hover:bg-slate-900 transition-all"><LogOut size={16} /> <span>Finalize Sync</span></button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Analytics Hub */}
          <div className="lg:col-span-8 space-y-10">
            {/* Visual Mastery Matrix */}
            <div className="bg-white dark:bg-slate-900 p-12 rounded-[4rem] shadow-xl border border-slate-50 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-12">
               <div className="space-y-6">
                  <div className="flex items-center space-x-3 text-brand-indigo">
                    <Brain size={24} />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.4em]">Mastery DNA Radar</h3>
                  </div>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fontWeight: 900, fill: '#64748b' }} />
                        <Radar name="Student" dataKey="A" stroke="#4338CA" fill="#4338CA" fillOpacity={0.5} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
               </div>

               <div className="space-y-6">
                  <div className="flex items-center space-x-3 text-brand-blue">
                    <Activity size={24} />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.4em]">Neural Components</h3>
                  </div>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={subSkills} layout="vertical" margin={{ left: 10, right: 30 }}>
                        <XAxis type="number" hide domain={[0, 100]} />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} width={70} />
                        <Bar dataKey="val" radius={[0, 12, 12, 0]} barSize={24}>
                          {subSkills.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                          <LabelList dataKey="val" position="right" style={{ fontSize: 10, fontWeight: 900, fill: '#1e293b' }} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
               </div>
            </div>

            {/* AI Strategic Path */}
            <div className="bg-white dark:bg-slate-900 p-12 rounded-[4rem] shadow-xl border border-slate-50 dark:border-slate-800 space-y-10">
               <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-brand-indigo">
                    <Navigation size={24} />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.4em]">Neural Growth Roadmap</h3>
                  </div>
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">3-Phase Action Plan</span>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {finalFeedback.growthRoadmap?.map((item: any, idx: number) => (
                   <motion.div 
                     key={idx} 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: idx * 0.1 }}
                     className="relative p-8 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 group transition-all hover:bg-white dark:hover:bg-slate-800 shadow-sm"
                   >
                      <div className="absolute -top-3 -left-3 w-10 h-10 bg-brand-indigo text-white rounded-xl flex items-center justify-center font-black text-xs shadow-lg">{item.step}</div>
                      <h4 className="font-black text-brand-indigo uppercase text-[10px] tracking-widest mb-3 mt-2">{item.goal}</h4>
                      <p className="text-slate-600 dark:text-slate-400 text-sm font-medium leading-relaxed">{item.action}</p>
                   </motion.div>
                 ))}
               </div>
            </div>
            
            {/* Coach Executive Summary */}
            <div className="p-12 bg-gradient-to-br from-brand-indigo to-brand-purple text-white rounded-[4rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] -mr-32 -mt-32" />
               <div className="flex-1 space-y-4 relative z-10">
                  <div className="flex items-center space-x-3 opacity-60">
                    <Award size={24} />
                    <span className="text-[11px] font-black uppercase tracking-widest">Executive AI Summary</span>
                  </div>
                  <p className="text-2xl font-bold leading-relaxed italic tracking-tight">"{finalFeedback.feedback}"</p>
               </div>
               <div className="w-24 h-24 bg-white/10 rounded-[2.5rem] flex items-center justify-center shrink-0 border border-white/20 relative z-10 backdrop-blur-sm shadow-xl">
                  <Target size={40} className="text-white" />
               </div>
            </div>
          </div>

          {/* Right Sidebar: Quick Stats */}
          <div className="lg:col-span-4 space-y-10">
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] shadow-lg border border-slate-50 dark:border-slate-800 space-y-8">
              <div className="flex items-center justify-between text-green-600">
                 <div className="flex items-center space-x-3">
                   <CheckCircle size={24} />
                   <h3 className="text-[11px] font-black uppercase tracking-[0.4em]">Core Strengths</h3>
                 </div>
                 <Star size={16} fill="currentColor" />
              </div>
              <div className="space-y-4">
                {finalFeedback.strengths?.map((s: any, idx: number) => (
                  <div key={idx} className="p-6 bg-green-50/50 dark:bg-green-900/10 rounded-3xl border border-green-100/50 group hover:bg-green-50 transition-colors">
                    <h4 className="font-black text-green-700 dark:text-green-400 text-xs mb-1 uppercase tracking-wider">{s.title}</h4>
                    <p className="text-slate-600 dark:text-slate-400 text-xs font-medium leading-relaxed">{s.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] shadow-lg border border-slate-50 dark:border-slate-800 space-y-8">
              <div className="flex items-center justify-between text-brand-orange">
                 <div className="flex items-center space-x-3">
                   <ZapOff size={24} />
                   <h3 className="text-[11px] font-black uppercase tracking-[0.4em]">Development Areas</h3>
                 </div>
                 <AlertCircle size={16} />
              </div>
              <div className="space-y-4">
                {finalFeedback.weaknesses?.map((w: any, idx: number) => (
                  <div key={idx} className="p-6 bg-orange-50/50 dark:bg-orange-900/10 rounded-3xl border border-orange-100/50 group hover:bg-orange-50 transition-colors">
                    <h4 className="font-black text-orange-700 dark:text-orange-400 text-xs mb-1 uppercase tracking-wider">{w.title}</h4>
                    <p className="text-slate-600 dark:text-slate-400 text-xs font-medium leading-relaxed">{w.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Vocal Dynamics Advanced Card */}
            <div className="bg-slate-950 p-10 rounded-[4rem] shadow-2xl border border-white/5 space-y-8 relative overflow-hidden">
               <div className="absolute inset-0 bg-blue-600/5 pointer-events-none" />
               <div className="flex items-center justify-between text-slate-500 relative z-10">
                  <div className="flex items-center space-x-3">
                    <Gauge size={20} />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.4em]">Vocal Metrics</h3>
                  </div>
                  <Mic size={18} />
               </div>
               <div className="space-y-8 relative z-10">
                  <div>
                    <div className="flex justify-between text-white text-[10px] font-black uppercase mb-3">
                       <span className="flex items-center"><TrendingUp size={12} className="mr-2 text-blue-500" /> Pace: {finalFeedback.speechAnalysis.paceDescription}</span>
                       <span className="text-blue-400">{finalFeedback.speechAnalysis.paceScore}%</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${finalFeedback.speechAnalysis.paceScore}%` }}
                         className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                       />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-white text-[10px] font-black uppercase mb-3">
                       <span className="flex items-center"><Zap size={12} className="mr-2 text-orange-500" /> Energy: Intensive</span>
                       <span className="text-brand-orange">{finalFeedback.speechAnalysis.energyLevel}%</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${finalFeedback.speechAnalysis.energyLevel}%` }}
                         className="h-full bg-brand-orange shadow-[0_0_10px_rgba(249,115,22,0.5)]" 
                       />
                    </div>
                  </div>
               </div>
               <div className="pt-4 border-t border-white/5 text-center relative z-10">
                  <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest leading-relaxed">
                    AI analysis of word patterns, pitch, and confidence markers successful.
                  </p>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-10 min-h-screen flex flex-col">
      <div className="flex justify-between items-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <button onClick={() => { stopHardware(); onBack(); }} className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-all flex items-center">
           <LogOut size={14} className="mr-2" />
           Abort Audit
        </button>
        <div className="flex items-center space-x-8">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:block">Neural Syncing Phase</div>
          <div className="flex space-x-2">
            {[...Array(TOTAL_STEPS)].map((_, i) => (
              <div key={i} className={`h-2 rounded-full transition-all duration-700 ${i <= currentStep ? 'w-12 bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'w-4 bg-slate-200 dark:bg-slate-800'}`} />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch flex-grow">
         <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-12 rounded-[4rem] shadow-2xl border border-slate-50 dark:border-slate-800 space-y-12 flex flex-col justify-center relative overflow-hidden glass-effect">
            <div className="space-y-8 relative z-10">
               <div className="flex items-center space-x-3 text-blue-600">
                 <Zap size={24} className="fill-blue-600 animate-pulse" />
                 <span className="text-[11px] font-black uppercase tracking-[0.4em]">Neural Challenge {currentStep + 1}</span>
               </div>
               <h2 className="text-4xl md:text-5xl font-black dark:text-white leading-[1.1] tracking-tighter min-h-[160px]">
                {isSynthesizing ? (
                   <div className="flex items-center space-x-6">
                     <RefreshCw size={40} className="animate-spin text-blue-500" />
                     <span className="text-slate-400 text-3xl font-bold">Synthesizing Probe...</span>
                   </div>
                ) : (
                  currentQuestion ? `"${currentQuestion}"` : "Calibrating next behavioral scenario..."
                )}
               </h2>
            </div>
            
            <AnimatePresence mode="wait">
              {isRecording ? (
                <motion.div key="recording" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-10 relative z-10">
                  <div className="p-12 bg-slate-50 dark:bg-slate-800/50 rounded-[3rem] min-h-[200px] max-h-[300px] overflow-y-auto text-slate-600 dark:text-slate-400 custom-scrollbar text-xl font-medium border-2 border-dashed border-red-500/20 shadow-inner italic leading-relaxed">
                    {transcript || 'Awaiting voice patterns...'}
                  </div>
                  <button onClick={handleStopAndProceed} className="w-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-10 py-8 rounded-[3rem] font-black uppercase tracking-[0.4em] text-xs hover:bg-brand-orange dark:hover:bg-brand-orange dark:hover:text-white transition-all shadow-2xl flex items-center justify-center space-x-4 transform active:scale-95 group">
                    <CheckCircle size={24} className="group-hover:scale-110 transition-transform" />
                    <span>Terminate & Sync Answer</span>
                  </button>
                </motion.div>
              ) : (
                <motion.div key="start" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10">
                  <button 
                    disabled={isSynthesizing || !currentQuestion}
                    onClick={handleStartRecording} 
                    className="w-full bg-blue-600 text-white px-12 py-14 rounded-[4rem] font-black uppercase tracking-[0.4em] text-sm shadow-2xl shadow-blue-500/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex flex-col items-center space-y-6 group"
                  >
                    <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-colors">
                      <Mic size={44} />
                    </div>
                    <span>Tap to Initialize Response</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
         </div>

         <div className="lg:col-span-5 space-y-10 flex flex-col">
            <div className="relative aspect-[4/3] bg-black rounded-[4rem] overflow-hidden shadow-2xl border-[10px] border-white dark:border-slate-800">
               <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
               <AnimatePresence>
                  {isRecording && (
                     <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="absolute top-10 right-10 flex items-center space-x-4 bg-red-600 text-white px-6 py-3 rounded-full shadow-2xl">
                        <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                        <span className="text-[11px] font-black uppercase tracking-[0.3em]">LIVE AUDIT FEED</span>
                     </motion.div>
                  )}
               </AnimatePresence>
               <canvas ref={canvasRef} className="hidden" />
            </div>

            <div className="bg-slate-900 p-12 rounded-[4rem] border border-white/5 flex flex-col space-y-10 shadow-xl flex-grow justify-center relative">
               <div className="absolute top-0 right-0 p-10 opacity-5">
                  <Brain size={120} />
               </div>
               <div className="flex items-center justify-between text-slate-500 mb-2 relative z-10">
                 <span className="text-[10px] font-black uppercase tracking-[0.4em]">Biometric Telemetry</span>
                 <ShieldCheck size={20} className="opacity-40" />
               </div>
               <div className="grid grid-cols-3 gap-8 relative z-10">
                 {[
                    { label: 'Visual Focus', val: biometricSim.eye, icon: '👁️' },
                    { label: 'Vocal Strength', val: biometricSim.voice, icon: '🎙️' },
                    { label: 'DNA Energy', val: biometricSim.face, icon: '⚡' }
                 ].map(stat => (
                    <div key={stat.label} className="text-center group p-8 rounded-[3rem] bg-white/5 border border-white/5 transition-all hover:bg-white/10 hover:scale-105">
                       <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 group-hover:text-blue-400 transition-colors">{stat.label}</div>
                       <div className="text-4xl font-black text-white flex items-center justify-center space-x-1">
                          <span>{isRecording ? stat.val : '--'}</span>
                          <span className="text-xs text-slate-500 font-medium">%</span>
                       </div>
                    </div>
                 ))}
               </div>
               <p className="text-center text-[10px] font-black text-slate-600 uppercase tracking-widest leading-relaxed relative z-10">
                 Neural algorithms are monitoring vocal stability and eye focus.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Assessment;
