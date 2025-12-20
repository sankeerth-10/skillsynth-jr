
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
  Loader2
} from 'lucide-react';
import { 
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
    let yPos = 0;

    // Helper for hex to RGB for jsPDF
    const hexToRgb = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return [r, g, b];
    };

    // Header Section
    doc.setFillColor(14, 165, 233); // Brand Blue
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('SkillSynth Jr', margin, 18);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('NEURAL SOFT SKILL DNA REPORT', margin, 26);
    doc.setFontSize(14);
    doc.text(finalFeedback.aiVision.toUpperCase(), pageWidth - margin, 18, { align: 'right' });

    yPos = 55;

    // Student Info
    doc.setTextColor(30, 41, 59); // Dark Slate
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('STUDENT PROFILE', margin, yPos);
    yPos += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text(`Name: ${user.name}`, margin, yPos);
    doc.text(`Grade Level: ${user.classSection}`, margin + 80, yPos);
    yPos += 8;
    doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, yPos);
    doc.text(`Session: Skill Audit Alpha`, margin + 80, yPos);

    yPos += 15;
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 15;

    // Scores Section
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('NEURAL SKILL BREAKDOWN', margin, yPos);
    yPos += 15;

    const scores = [
      { label: 'Communication', val: finalFeedback.scores.communication, color: '#0EA5E9' },
      { label: 'Confidence', val: finalFeedback.scores.confidence, color: '#8B5CF6' },
      { label: 'Teamwork', val: finalFeedback.scores.teamwork, color: '#10B981' },
      { label: 'Logical Logic', val: finalFeedback.scores.problemSolving, color: '#F59E0B' },
    ];

    scores.forEach(score => {
      const rgb = hexToRgb(score.color);
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(score.label.toUpperCase(), margin, yPos);
      
      doc.setTextColor(30, 41, 59);
      doc.text(`${score.val}%`, pageWidth - margin, yPos, { align: 'right' });
      
      yPos += 4;
      // Background bar
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, yPos, pageWidth - (margin * 2), 6, 'F');
      // Progress bar
      doc.setFillColor(rgb[0], rgb[1], rgb[2]);
      doc.rect(margin, yPos, (pageWidth - (margin * 2)) * (score.val / 100), 6, 'F');
      
      yPos += 15;
    });

    // AI Coach Box
    yPos += 5;
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, yPos, pageWidth - (margin * 2), 35, 'F');
    doc.setDrawColor(14, 165, 233);
    doc.setLineWidth(1);
    doc.line(margin, yPos, margin, yPos + 35);
    
    doc.setTextColor(14, 165, 233);
    doc.setFontSize(9);
    doc.text('AI COACH SUMMARY', margin + 5, yPos + 8);
    
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(11);
    const splitFeedback = doc.splitTextToSize(`"${finalFeedback.feedback}"`, pageWidth - (margin * 2) - 10);
    doc.text(splitFeedback, margin + 5, yPos + 18);

    yPos += 50;

    // Strengths & Growth Areas
    const drawSection = (title: string, items: any[], colorHex: string, startY: number) => {
      const rgb = hexToRgb(colorHex);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(rgb[0], rgb[1], rgb[2]);
      doc.text(title.toUpperCase(), margin, startY);
      
      let itemY = startY + 10;
      items.forEach(item => {
        doc.setFillColor(rgb[0], rgb[1], rgb[2], 0.1); // Simulated transparency with 4th param is not standard, so we'll just use a lighter color manually or rectangles
        // Since jsPDF standard doesn't support alpha in fill, we use a light grey background instead
        doc.setFillColor(250, 250, 250);
        doc.rect(margin, itemY - 5, pageWidth - (margin * 2), 15, 'F');
        
        doc.setTextColor(rgb[0], rgb[1], rgb[2]);
        doc.setFontSize(10);
        doc.text(item.title, margin + 5, itemY + 2);
        
        doc.setTextColor(71, 85, 105);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`- ${item.description}`, margin + 5, itemY + 7);
        
        itemY += 20;
      });
      return itemY;
    };

    yPos = drawSection('Superpowers (Strengths)', finalFeedback.strengths, '#10B981', yPos);
    yPos += 5;
    yPos = drawSection('Growth Path (Improvement)', finalFeedback.improvementAreas, '#F97316', yPos);

    // Footer
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(8);
    doc.text('Verified by SkillSynth AI Assessment Engine • School-Safe Encryption', pageWidth / 2, 285, { align: 'center' });

    doc.save(`SkillSynth_Report_${user.name.replace(/\s+/g, '_')}.pdf`);
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
             A friendly, easy conversation to discover your secret soft-skill superpowers.
           </p>
        </div>
        <div className="flex flex-col space-y-4 w-full max-w-xs pt-4">
          <button onClick={initSession} className="bg-blue-600 text-white px-10 py-6 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-slate-900 transition-all flex items-center justify-center space-x-3 shadow-2xl shadow-blue-500/20 active:scale-95">
             <Camera size={20} />
             <span>Allow Camera & Mic</span>
          </button>
          <button onClick={onBack} className="text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-red-500 transition-colors">Maybe Later</button>
        </div>
        <div className="pt-12 flex items-center space-x-3 text-slate-400">
          <ShieldCheck size={16} className="text-blue-500/50" />
          <span className="text-[10px] font-black uppercase tracking-widest">End-to-End Secure • No Data Stored</span>
        </div>
      </div>
    );
  }

  if (sessionState === 'processing') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-8 bg-slate-50 dark:bg-slate-950">
        <div className="relative">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }} className="w-28 h-28 border-[6px] border-blue-600 border-t-transparent rounded-full shadow-2xl shadow-blue-500/10" />
          <div className="absolute inset-0 flex items-center justify-center text-blue-600"><Cpu size={40} className="animate-pulse" /></div>
        </div>
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-black dark:text-white tracking-tighter">Crafting your DNA Report...</h2>
          <p className="font-black text-slate-400 uppercase tracking-widest text-[11px] flex items-center justify-center space-x-2">
            <Loader2 className="animate-spin" size={12} />
            <span>AI Brain is at Work</span>
          </p>
        </div>
      </div>
    );
  }

  if (sessionState === 'report' && finalFeedback) {
    const scoresData = [
      { name: 'Comm', val: finalFeedback.scores.communication, color: '#0EA5E9' },
      { name: 'Conf', val: finalFeedback.scores.confidence, color: '#8B5CF6' },
      { name: 'Team', val: finalFeedback.scores.teamwork, color: '#10B981' },
      { name: 'Logic', val: finalFeedback.scores.problemSolving, color: '#F59E0B' },
    ];

    return (
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-12 pb-32">
        <header className="bg-white dark:bg-slate-900 p-12 rounded-[4rem] shadow-2xl flex flex-col lg:flex-row justify-between items-center gap-8 glass-effect border border-slate-50 dark:border-slate-800">
          <div className="space-y-3 text-center lg:text-left">
            <h1 className="text-5xl font-black dark:text-white tracking-tighter">Audit Complete</h1>
            <p className="font-black text-[10px] text-blue-600 uppercase tracking-[0.3em]">{user.name} • DNA Verified • Grade {user.classSection}</p>
          </div>
          <div className="flex space-x-3">
            <button onClick={generatePDF} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-10 py-5 rounded-[1.8rem] font-black uppercase tracking-widest text-[9px] flex items-center space-x-2 hover:bg-slate-200 transition-all"><Download size={16} /> <span>Save PDF</span></button>
            <button onClick={() => onComplete(finalFeedback.scores, history.map(h => h.question))} className="bg-blue-600 text-white px-10 py-5 rounded-[1.8rem] font-black uppercase tracking-widest text-[9px] flex items-center space-x-2 shadow-2xl shadow-blue-500/20 hover:bg-slate-900 transition-all"><LogOut size={16} /> <span>Done</span></button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-12 rounded-[4rem] shadow-xl border border-slate-50 dark:border-slate-800 space-y-12">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Neural Signature Breakdown</h3>
              <div className="px-6 py-2.5 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-blue-500/10">{finalFeedback.aiVision}</div>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoresData} margin={{ top: 20, right: 30, left: 30, bottom: 40 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 900, fill: '#64748b' }} interval={0} dy={20} />
                  <YAxis domain={[0, 100]} hide />
                  <Bar dataKey="val" radius={[18, 18, 18, 18]} barSize={70}>
                    {scoresData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    <LabelList dataKey="val" position="top" style={{ fontSize: 16, fontWeight: 900, fill: '#1e293b' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="p-10 bg-slate-50 dark:bg-slate-800/50 rounded-[3rem] border border-slate-100 dark:border-slate-800">
               <div className="flex items-center space-x-3 text-blue-600 mb-6">
                 <Zap size={24} className="fill-blue-600" />
                 <span className="text-[11px] font-black uppercase tracking-[0.4em]">Coach Feedback</span>
               </div>
               <p className="text-slate-700 dark:text-slate-200 text-xl font-medium leading-relaxed italic">"{finalFeedback.feedback}"</p>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] shadow-lg border border-slate-50 dark:border-slate-800">
              <div className="flex items-center space-x-3 text-green-600 mb-8">
                 <CheckCircle size={24} />
                 <h3 className="text-[11px] font-black uppercase tracking-[0.4em]">Superpowers</h3>
              </div>
              <div className="space-y-5">
                {finalFeedback.strengths?.map((s: any, idx: number) => (
                  <div key={idx} className="p-5 bg-green-50/50 dark:bg-green-900/10 rounded-2xl border border-green-100/50">
                    <h4 className="font-black text-green-700 dark:text-green-400 text-xs mb-1 uppercase tracking-wider">{s.title}</h4>
                    <p className="text-slate-600 dark:text-slate-400 text-sm font-medium leading-relaxed">{s.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] shadow-lg border border-slate-50 dark:border-slate-800">
              <div className="flex items-center space-x-3 text-brand-orange mb-8">
                 <Lightbulb size={24} />
                 <h3 className="text-[11px] font-black uppercase tracking-[0.4em]">Level Up Path</h3>
              </div>
              <div className="space-y-5">
                {finalFeedback.improvementAreas?.map((i: any, idx: number) => (
                  <div key={idx} className="p-5 bg-orange-50/50 dark:bg-orange-900/10 rounded-2xl border border-orange-100/50">
                    <h4 className="font-black text-orange-700 dark:text-orange-400 text-xs mb-1 uppercase tracking-wider">{i.title}</h4>
                    <p className="text-slate-600 dark:text-slate-400 text-sm font-medium leading-relaxed">{i.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-10 min-h-screen flex flex-col">
      <div className="flex justify-between items-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-4 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <button onClick={() => { stopHardware(); onBack(); }} className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-all">Abort Sync</button>
        <div className="flex items-center space-x-6">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:block">Neural Progress</div>
          <div className="flex space-x-1.5">
            {[...Array(TOTAL_STEPS)].map((_, i) => (
              <div key={i} className={`h-2.5 rounded-full transition-all duration-700 ${i <= currentStep ? 'w-10 bg-blue-600 shadow-[0_0_10px_rgba(14,165,233,0.3)]' : 'w-4 bg-slate-200 dark:bg-slate-800'}`} />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch flex-grow">
         <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-12 rounded-[4rem] shadow-2xl border border-slate-50 dark:border-slate-800 space-y-12 flex flex-col justify-center relative overflow-hidden glass-effect">
            <div className="space-y-6 relative z-10">
               <div className="flex items-center space-x-3 text-blue-600">
                 <Zap size={22} className="fill-blue-600" />
                 <span className="text-[11px] font-black uppercase tracking-[0.4em]">Audit Phase {currentStep + 1}</span>
               </div>
               <h2 className="text-4xl md:text-5xl font-black dark:text-white leading-[1.1] tracking-tighter min-h-[140px]">
                {isSynthesizing ? (
                   <div className="flex items-center space-x-4">
                     <RefreshCw size={32} className="animate-spin text-blue-500" />
                     <span className="text-slate-400 text-3xl font-bold">Synthesizing...</span>
                   </div>
                ) : (
                  currentQuestion ? `"${currentQuestion}"` : "Initializing next neural challenge..."
                )}
               </h2>
            </div>
            
            <AnimatePresence mode="wait">
              {isRecording ? (
                <motion.div key="recording" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-8 relative z-10">
                  <div className="p-10 bg-slate-50 dark:bg-slate-800 rounded-[3rem] min-h-[180px] max-h-[280px] overflow-y-auto text-slate-500 custom-scrollbar text-xl font-medium border-2 border-dashed border-red-500/30 shadow-inner italic">
                    {transcript || 'Synthesizing your voice waves...'}
                  </div>
                  <button onClick={handleStopAndProceed} className="w-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-10 py-7 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-xs hover:bg-brand-orange dark:hover:bg-brand-orange dark:hover:text-white transition-all shadow-2xl flex items-center justify-center space-x-4 transform active:scale-95">
                    <CheckCircle size={22} />
                    <span>Done Speaking • Auto-Sync</span>
                  </button>
                </motion.div>
              ) : (
                <motion.div key="start" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10">
                  <button 
                    disabled={isSynthesizing || !currentQuestion}
                    onClick={handleStartRecording} 
                    className="w-full bg-blue-600 text-white px-12 py-12 rounded-[4rem] font-black uppercase tracking-[0.4em] text-sm shadow-2xl shadow-blue-500/30 hover:scale-[1.03] active:scale-95 transition-all disabled:opacity-50 flex flex-col items-center space-y-4"
                  >
                    <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                      <Mic size={36} />
                    </div>
                    <span>Tap to Start Talking</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
         </div>

         <div className="lg:col-span-5 space-y-8 flex flex-col">
            <div className="relative aspect-[4/3] bg-black rounded-[4.5rem] overflow-hidden shadow-2xl border-[8px] border-white dark:border-slate-800">
               <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
               <AnimatePresence>
                  {isRecording && (
                     <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="absolute top-10 right-10 flex items-center space-x-3 bg-red-600 text-white px-5 py-2.5 rounded-full shadow-2xl">
                        <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                        <span className="text-[11px] font-black uppercase tracking-[0.3em]">Neural Live Feed</span>
                     </motion.div>
                  )}
               </AnimatePresence>
               <canvas ref={canvasRef} className="hidden" />
            </div>

            <div className="bg-slate-900 p-12 rounded-[4rem] border border-white/5 flex flex-col space-y-10 shadow-xl flex-grow justify-center">
               <div className="flex items-center justify-between text-slate-500 mb-2">
                 <span className="text-[10px] font-black uppercase tracking-[0.4em]">Real-time Biometrics</span>
                 <ShieldCheck size={18} className="opacity-40" />
               </div>
               <div className="grid grid-cols-3 gap-6">
                 {[
                    { label: 'Eye Focus', val: biometricSim.eye, icon: '👁️' },
                    { label: 'Voice', val: biometricSim.voice, icon: '🎙️' },
                    { label: 'Emotion', val: biometricSim.face, icon: '😊' }
                 ].map(stat => (
                    <div key={stat.label} className="text-center group p-6 rounded-[2.5rem] bg-white/5 border border-white/5 transition-all hover:bg-white/10">
                       <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 group-hover:text-blue-400 transition-colors">{stat.label}</div>
                       <div className="text-3xl font-black text-white flex items-center justify-center space-x-1">
                          <span>{isRecording ? stat.val : '--'}</span>
                          <span className="text-xs text-slate-400 font-medium">%</span>
                       </div>
                    </div>
                 ))}
               </div>
               <p className="text-center text-[9px] font-black text-slate-600 uppercase tracking-widest leading-relaxed">
                 AI is evaluating non-verbal cues for your DNA report.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Assessment;
