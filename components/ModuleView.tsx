
import React, { useState, useEffect, useRef } from 'react';
import { Module, User } from '../types';
import { adaptModuleContent, evolveModuleContent } from '../services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  CheckCircle2, 
  ChevronRight, 
  Heart, 
  Timer, 
  Trophy, 
  Zap, 
  Cpu, 
  BrainCircuit, 
  Sparkles, 
  ArrowUpCircle, 
  Image as ImageIcon
} from 'lucide-react';

interface ModuleViewProps {
  module: Module;
  user: User;
  onBack: () => void;
  onComplete: (evolvedModule?: any) => void;
}

const QUESTION_TIME_LIMIT = 20;

const ModuleView: React.FC<ModuleViewProps> = ({ module, user, onBack, onComplete }) => {
  const [viewState, setViewState] = useState<'synthesizing' | 'content' | 'quiz_intro' | 'quiz_active' | 'quiz_result'>('synthesizing');
  const [adaptedModule, setAdaptedModule] = useState<Module | null>(null);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_LIMIT);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [shake, setShake] = useState(false);
  const [isEvolving, setIsEvolving] = useState(false);

  // Fix: Replaced NodeJS.Timeout with ReturnType<typeof setInterval> to resolve "Cannot find namespace 'NodeJS'" error in browser environment.
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const performSynthesis = async () => {
      await new Promise(r => setTimeout(r, 1500));
      const adapted = await adaptModuleContent(module, user.classSection);
      setAdaptedModule(adapted);
      setViewState('content');
    };
    performSynthesis();
  }, [module, user.classSection]);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.pageYOffset;
      setScrollProgress((currentScroll / (totalScroll || 1)) * 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (viewState === 'quiz_active' && !isAnswered && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isAnswered) {
      handleWrongAnswer();
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [viewState, timeLeft, isAnswered]);

  const handleWrongAnswer = () => {
    setIsAnswered(true);
    setLives((prev) => Math.max(0, prev - 1));
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleOptionSelect = (idx: number) => {
    if (isAnswered || !adaptedModule) return;
    setSelectedOption(idx);
    setIsAnswered(true);
    if (idx === adaptedModule.quizzes[currentQuizIndex].correctAnswer) {
      const bonus = Math.round((timeLeft / QUESTION_TIME_LIMIT) * 50);
      setScore((prev) => prev + 100 + bonus);
    } else {
      setLives((prev) => Math.max(0, prev - 1));
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const nextQuestion = () => {
    if (!adaptedModule) return;
    if (currentQuizIndex < adaptedModule.quizzes.length - 1 && lives > 0) {
      setCurrentQuizIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeLeft(QUESTION_TIME_LIMIT);
    } else {
      setViewState('quiz_result');
    }
  };

  const handleEvolve = async () => {
    setIsEvolving(true);
    const evolved = await evolveModuleContent(currentModule, user.classSection);
    if (evolved) {
      onComplete(evolved);
    } else {
      onComplete();
    }
  };

  const resetQuiz = () => {
    setCurrentQuizIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setLives(3);
    setScore(0);
    setTimeLeft(QUESTION_TIME_LIMIT);
    setViewState('quiz_active');
  };

  if (viewState === 'synthesizing' || isEvolving) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center p-10">
        <div className="relative mb-12">
          <motion.div 
            animate={{ rotate: 360, scale: [1, 1.1, 1] }} 
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -inset-8 bg-blue-500/10 rounded-full blur-3xl"
          />
          <BrainCircuit className="text-blue-500 w-24 h-24 relative z-10 animate-pulse" />
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-black text-white tracking-tighter">
            {isEvolving ? "Synthesizing Level 2 Concepts" : "Synthesizing Courseware"}
          </h2>
          <div className="flex items-center justify-center space-x-3 text-blue-400 font-black text-xs uppercase tracking-[0.3em]">
             <Sparkles size={14} />
             <span>Optimizing for Grade {user.classSection}</span>
          </div>
          <p className="text-slate-500 text-sm max-w-xs font-medium mx-auto mt-4">
            SkillSynth AI is {isEvolving ? "generating advanced logic" : "restructuring complexity"} for your specific level.
          </p>
        </div>
      </div>
    );
  }

  const currentModule = adaptedModule || module;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {viewState === 'content' && (
        <div className="fixed top-0 left-0 w-full h-1 z-[60]">
          <div className="h-full bg-blue-600 transition-all duration-150 shadow-[0_0_10px_#0EA5E9]" style={{ width: `${scrollProgress}%` }} />
        </div>
      )}

      <div className="max-w-4xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {viewState === 'content' && (
            <motion.div key="content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12 pb-20">
              <button onClick={onBack} className="group flex items-center space-x-2 text-slate-400 dark:text-slate-500 font-semibold mb-12 hover:text-blue-600 transition-all">
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span>Return to Hub</span>
              </button>

              <header className="space-y-6 text-center">
                <div className="flex items-center justify-center space-x-4">
                  <span className="px-4 py-1.5 bg-blue-600 text-white rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg shadow-blue-500/20">Week {currentModule.week}</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-slate-100 leading-tight tracking-tight">{currentModule.title}</h1>
                <p className="text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto">{currentModule.description}</p>
              </header>

              {/* Module Hero Visual */}
              {currentModule.visuals?.image && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative h-96 rounded-[4rem] overflow-hidden shadow-2xl group border border-slate-200 dark:border-slate-800">
                  <img 
                    src={currentModule.visuals.image} 
                    alt={currentModule.title} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                    loading="eager"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop`;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  <div className="absolute bottom-10 left-10 flex items-center space-x-3 text-white">
                    <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20"><ImageIcon size={18} /></div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Visual Insight Tool</span>
                  </div>
                </motion.div>
              )}

              <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-10 md:p-16 shadow-2xl border border-slate-100 dark:border-slate-800 glass-effect">
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <div className="flex items-center justify-between mb-12">
                     <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center">
                      <span className="w-2 h-8 bg-blue-600 rounded-full mr-4"></span>
                      Skill Core
                    </h3>
                  </div>
                  <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed first-letter:text-7xl first-letter:font-black first-letter:text-blue-600 first-letter:mr-4 first-letter:float-left">
                    {currentModule.content}
                  </p>
                </div>

                <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {currentModule.learningPoints.map((point, idx) => (
                    <motion.div key={idx} whileHover={{ y: -5 }} className="p-8 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 group transition-all">
                      <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center text-blue-600 dark:text-blue-400 font-black mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">{idx + 1}</div>
                      <p className="text-slate-800 dark:text-slate-100 font-bold leading-snug">
                        {point.includes(':') ? (
                          <><span className="text-blue-600 dark:text-blue-400 block mb-1 uppercase text-[10px] tracking-widest">{point.split(':')[0]}</span>{point.split(':')[1]}</>
                        ) : point}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="pt-8">
                <button 
                  onClick={() => currentModule.quizzes.length > 0 ? setViewState('quiz_intro') : onComplete()}
                  className="w-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-black py-8 rounded-[2.5rem] hover:bg-blue-600 dark:hover:bg-blue-500 transition-all transform hover:scale-[1.01] shadow-2xl flex items-center justify-center space-x-4 uppercase tracking-[0.2em] text-xs"
                >
                  <Zap size={18} fill="currentColor" />
                  <span>{currentModule.quizzes.length > 0 ? "Begin Mastery Challenge" : "Complete Skill Module"}</span>
                </button>
              </div>
            </motion.div>
          )}

          {viewState === 'quiz_intro' && (
            <motion.div key="quiz_intro" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-12">
              <div className="w-32 h-32 bg-blue-600 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl shadow-blue-500/40 relative z-10"><Trophy size={64} /></div>
              <div className="space-y-4">
                <h2 className="text-5xl font-black dark:text-slate-100 tracking-tighter">Skill Challenge</h2>
                <p className="text-xl text-slate-400 max-w-md font-medium">Quick-fire questions to solidify your learning.</p>
              </div>
              <button onClick={() => setViewState('quiz_active')} className="bg-blue-600 text-white px-16 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-slate-900 transition-all shadow-2xl shadow-blue-500/30">Initialize</button>
            </motion.div>
          )}

          {viewState === 'quiz_active' && (
            <motion.div key="quiz_active" animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}} className="space-y-12">
              <div className="flex justify-between items-center">
                <div className="flex space-x-1.5">
                  {[...Array(3)].map((_, i) => (
                    <Heart key={i} size={24} className={`transition-all duration-500 ${i < lives ? 'text-red-500 fill-red-500' : 'text-slate-200 dark:text-slate-800'}`} />
                  ))}
                </div>
                <div className={`flex items-center space-x-3 px-6 py-3 rounded-2xl ${timeLeft < 5 ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-600'}`}>
                  <Timer size={20} /><span className="font-black text-xl tabular-nums">{timeLeft}</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 shadow-2xl border border-slate-50 dark:border-slate-800 relative">
                <div className="mb-10 pt-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Question {currentQuizIndex + 1} / {currentModule.quizzes.length}</span>
                  <h3 className="text-3xl font-black dark:text-slate-100 leading-tight">{currentModule.quizzes[currentQuizIndex].question}</h3>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {currentModule.quizzes[currentQuizIndex].options.map((option, idx) => {
                    const isCorrect = idx === currentModule.quizzes[currentQuizIndex].correctAnswer;
                    const isSelected = selectedOption === idx;
                    let btnStyle = "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900";
                    if (isAnswered) {
                      if (isCorrect) btnStyle = "border-green-500 bg-green-50 text-green-700";
                      else if (isSelected) btnStyle = "border-red-500 bg-red-50 text-red-700";
                      else btnStyle = "opacity-50 border-slate-100 grayscale";
                    }
                    return (
                      <button key={idx} disabled={isAnswered} onClick={() => handleOptionSelect(idx)} className={`w-full text-left p-6 rounded-[1.5rem] border-2 transition-all flex items-center justify-between ${btnStyle}`}>
                        <div className="flex items-center space-x-5">
                          <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${isSelected ? 'bg-current text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>{String.fromCharCode(65 + idx)}</span>
                          <span className="font-bold text-lg">{option}</span>
                        </div>
                        {isAnswered && isCorrect && <CheckCircle2 className="text-green-500" size={24} />}
                      </button>
                    );
                  })}
                </div>

                {isAnswered && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-10">
                    <button onClick={nextQuestion} className="w-full py-6 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-black rounded-2xl flex items-center justify-center space-x-3 uppercase tracking-widest text-xs">
                      <span>{currentQuizIndex === currentModule.quizzes.length - 1 || lives === 0 ? "Finish Challenge" : "Next Question"}</span>
                      <ChevronRight size={16} />
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {viewState === 'quiz_result' && (
            <motion.div key="quiz_result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="min-h-[70vh] flex flex-col items-center justify-center text-center">
              <div className="bg-white dark:bg-slate-900 rounded-[4rem] p-16 shadow-2xl border border-slate-50 dark:border-slate-800 w-full max-w-2xl space-y-12 relative overflow-hidden">
                <div className="space-y-4">
                  <h2 className="text-6xl font-black dark:text-slate-100 tracking-tighter">{lives > 0 ? "Mastery Unlocked!" : "Challenge Failed"}</h2>
                  <p className="text-xl text-slate-500 font-medium">You've {lives > 0 ? "synthesized this skill" : "encountered a logic gap"}.</p>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[2rem] border border-slate-100">
                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Score</span>
                    <span className="text-5xl font-black dark:text-slate-100">{score}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[2rem] border border-slate-100">
                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Rank</span>
                    <span className={`text-2xl font-black ${lives > 0 ? 'text-green-600' : 'text-red-600'}`}>{lives > 0 ? "S-TIER" : "RETIRED"}</span>
                  </div>
                </div>

                <div className="flex flex-col space-y-4 pt-8">
                  {lives > 0 ? (
                    <>
                      <button 
                        onClick={handleEvolve}
                        className="w-full py-6 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black rounded-3xl hover:bg-blue-600 transition-all uppercase tracking-[0.2em] text-xs flex items-center justify-center space-x-3"
                      >
                        <ArrowUpCircle size={18} />
                        <span>Synthesize Level 2 Concepts</span>
                      </button>
                      <button onClick={() => onComplete()} className="w-full py-6 bg-blue-600 text-white font-black rounded-3xl hover:bg-slate-900 transition-all uppercase tracking-[0.2em] text-xs">Return to Hub</button>
                    </>
                  ) : (
                    <button onClick={resetQuiz} className="w-full py-6 bg-blue-600 text-white font-black rounded-3xl hover:bg-slate-900 transition-all uppercase tracking-[0.2em] text-xs">Re-Initialize</button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ModuleView;
