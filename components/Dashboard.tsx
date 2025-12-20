
import React, { useState } from 'react';
import { User, Module, DailyTask } from '../types.ts';
import { DAILY_TASKS } from '../constants.ts';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Flame, 
  Target, 
  ChevronRight, 
  CheckCircle2, 
  Brain, 
  LayoutGrid,
  Share2,
  Copy,
  Check,
  Medal,
  Award,
  Stars,
  Crown,
  Lock,
  Zap,
  ShieldCheck,
  Speaker,
  Briefcase,
  Users,
  History,
  TrendingUp,
  X
} from 'lucide-react';

interface DashboardProps {
  user: User;
  onSelectModule: (id: string) => void;
  onStartAssessment: () => void;
  onStartDailyTask: (task: DailyTask) => void;
  curriculum: Module[];
}

const Dashboard: React.FC<DashboardProps> = ({ user, onSelectModule, onStartAssessment, onStartDailyTask, curriculum }) => {
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const chartData = [
    { subject: 'Comm', A: user.scores.communication || 10, fullMark: 100 },
    { subject: 'Conf', A: user.scores.confidence || 10, fullMark: 100 },
    { subject: 'Team', A: user.scores.teamwork || 10, fullMark: 100 },
    { subject: 'Problem', A: user.scores.problemSolving || 10, fullMark: 100 },
  ];

  const currentDailyTask = DAILY_TASKS[new Date().getDate() % DAILY_TASKS.length];
  const overallScore = Math.round(chartData.reduce((acc, curr) => acc + curr.A, 0) / 4);

  const generateSyncCode = () => {
    const data = {
      n: user.name,
      g: user.classSection,
      s: user.scores,
      p: user.progress,
      h: user.scoreHistory
    };
    return btoa(JSON.stringify(data));
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generateSyncCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-12 space-y-12 pb-32">
      {/* Header Summary */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
             <div className="px-4 py-1.5 bg-brand-blue/10 text-brand-blue rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-blue/20">Active Session</div>
             <div className="flex items-center space-x-1 text-brand-orange">
                <Flame size={16} fill="currentColor" />
                <span className="text-sm font-black">{user.streak || 1} Day Streak</span>
             </div>
          </div>
          <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">
            Welcome back, <br/>
            <span className="logo-gradient-text">{user.name.split(' ')[0]}</span>
          </h1>
        </div>
        
        <div className="flex space-x-4">
          <button 
            onClick={() => setShowSyncModal(true)}
            className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-[2rem] shadow-xl flex items-center space-x-4 hover:scale-[1.02] transition-all"
          >
            <div className="w-12 h-12 bg-brand-indigo/10 text-brand-indigo rounded-2xl flex items-center justify-center group-hover:bg-brand-indigo group-hover:text-white transition-all">
              <Share2 size={20} />
            </div>
            <div className="text-left pr-4">
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Share Progress</span>
              <span className="block text-sm font-black dark:text-white">Sync DNA</span>
            </div>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Skill Radar & Daily Task */}
        <div className="lg:col-span-4 space-y-10">
          <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-10 shadow-2xl border border-slate-50 dark:border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Neural Skill DNA</h3>
               <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-brand-blue"><Brain size={18} /></div>
            </div>
            
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                  <PolarGrid stroke="#e2e8f0" strokeOpacity={0.5} />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} />
                  <Radar
                    name="Skills"
                    dataKey="A"
                    stroke="#0EA5E9"
                    strokeWidth={3}
                    fill="#0EA5E9"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-50 dark:border-slate-800 text-center">
              <span className="text-4xl font-black dark:text-white">{overallScore}</span>
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mt-1">Overall IQ Mastery</span>
            </div>
          </div>

          {/* Daily Task Card */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-slate-900 dark:bg-white rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden group cursor-pointer"
            onClick={() => onStartDailyTask(currentDailyTask)}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/20 blur-[60px] rounded-full group-hover:bg-brand-blue/40 transition-all" />
            <div className="relative z-10 space-y-6">
              <div className="flex items-center space-x-3 text-brand-blue">
                <Target size={24} />
                <span className="text-[11px] font-black uppercase tracking-[0.3em]">Micro-Mission</span>
              </div>
              <h4 className="text-2xl font-black text-white dark:text-slate-900 leading-tight">
                {currentDailyTask.title}
              </h4>
              <p className="text-slate-400 dark:text-slate-500 text-sm font-medium leading-relaxed">
                {currentDailyTask.description}
              </p>
              <div className="pt-4 flex items-center justify-between">
                <span className="text-[10px] font-black text-brand-orange uppercase tracking-widest">+20 Skill Points</span>
                <div className="w-10 h-10 bg-white/10 dark:bg-slate-100 rounded-xl flex items-center justify-center text-white dark:text-slate-900">
                  <ChevronRight size={20} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right: Curriculum Hub */}
        <div className="lg:col-span-8 space-y-10">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center">
              <LayoutGrid className="mr-4 text-brand-blue" />
              Learning Path
            </h2>
            <div className="hidden md:flex items-center space-x-6">
               <div className="text-right">
                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
                  <span className="block text-sm font-black text-brand-blue">{user.progress}% Sync Complete</span>
               </div>
               <div className="w-32 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-blue transition-all duration-1000" style={{ width: `${user.progress}%` }} />
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {curriculum.map((module) => {
              const isCompleted = user.completedModules.includes(module.id);
              return (
                <motion.div
                  key={module.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelectModule(module.id)}
                  className={`relative group bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl border border-slate-50 dark:border-slate-800 cursor-pointer overflow-hidden transition-all ${isCompleted ? 'ring-2 ring-brand-blue/30' : ''}`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isCompleted ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/30' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
                      {isCompleted ? <CheckCircle2 size={24} /> : <Zap size={24} />}
                    </div>
                    <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">Week {module.week}</span>
                  </div>
                  
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 group-hover:text-brand-blue transition-colors">
                    {module.title}
                  </h3>
                  <p className="text-slate-400 dark:text-slate-500 text-sm font-medium line-clamp-2 leading-relaxed mb-6">
                    {module.description}
                  </p>
                  
                  <div className="flex items-center space-x-2">
                    {module.skillsFocus.map(skill => (
                      <span key={skill} className="px-3 py-1 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-lg text-[8px] font-black uppercase tracking-widest">
                        {skill}
                      </span>
                    ))}
                  </div>

                  {isCompleted && (
                    <div className="absolute top-0 right-0 p-4">
                      <div className="text-[9px] font-black text-brand-blue uppercase tracking-widest flex items-center">
                         <Stars size={12} className="mr-1" /> Mastered
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
          
          {/* Assessment CTA */}
          <button 
            onClick={onStartAssessment}
            className="w-full bg-brand-blue text-white p-10 rounded-[3rem] shadow-2xl shadow-brand-blue/20 flex flex-col md:flex-row items-center justify-between text-center md:text-left group hover:bg-slate-900 transition-all"
          >
            <div className="space-y-2 mb-6 md:mb-0">
               <h3 className="text-2xl font-black uppercase tracking-widest">Final Skills Audit</h3>
               <p className="text-brand-blue-50/70 font-medium text-sm">Synthesize all your learning into a final DNA report.</p>
            </div>
            <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center group-hover:bg-brand-blue transition-all">
              <ChevronRight size={32} />
            </div>
          </button>
        </div>
      </div>

      {/* Sync DNA Modal */}
      <AnimatePresence>
        {showSyncModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] p-10 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-8"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3 text-brand-blue">
                  <ShieldCheck size={28} />
                  <h2 className="text-3xl font-black dark:text-white">Sync DNA</h2>
                </div>
                <button onClick={() => setShowSyncModal(false)} className="text-slate-400 hover:text-red-500"><X /></button>
              </div>
              
              <div className="space-y-4">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
                  Share your unique <span className="text-brand-indigo font-bold">Skill DNA Code</span> with your teacher to synchronize your progress to the class hub.
                </p>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 break-all font-mono text-[9px] text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-700 max-h-40 overflow-y-auto custom-scrollbar">
                  {generateSyncCode()}
                </div>
              </div>

              <button 
                onClick={handleCopyCode}
                className="w-full py-6 bg-brand-blue text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs flex items-center justify-center space-x-3 hover:bg-slate-900 transition-all shadow-xl shadow-brand-blue/20"
              >
                {copied ? (
                  <>
                    <Check size={18} />
                    <span>Copied to Terminal</span>
                  </>
                ) : (
                  <>
                    <Copy size={18} />
                    <span>Copy Sync Code</span>
                  </>
                )}
              </button>
              
              <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Protected by SkillSynth Secure Protocol
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
