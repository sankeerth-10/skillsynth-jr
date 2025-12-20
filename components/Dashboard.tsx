
import React, { useState } from 'react';
import { User, Module, DailyTask } from '../types';
import { DAILY_TASKS } from '../constants';
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
  TrendingUp
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
    const data = JSON.stringify({
      n: user.name,
      g: user.classSection,
      s: user.scores,
      p: user.progress,
      st: user.streak,
      m: user.completedModules
    });
    return btoa(data);
  };

  const copySyncCode = () => {
    navigator.clipboard.writeText(generateSyncCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const Heart = ({ size, className }: { size?: number, className?: string }) => <Stars size={size} className={className} />;

  const badgeConfig = [
    { id: 'm1', icon: Medal, label: 'Cadet', skill: 'Communication' },
    { id: 'm2', icon: ShieldCheck, label: 'Sentinel', skill: 'Etiquette' },
    { id: 'm3', icon: Zap, label: 'Titan', skill: 'Confidence' },
    { id: 'm4', icon: Speaker, label: 'Orator', skill: 'Eloquence' },
    { id: 'm5', icon: Users, label: 'Ally', skill: 'Teamwork' },
    { id: 'm6', icon: Crown, label: 'Leader', skill: 'Influence' },
    { id: 'm7', icon: Brain, label: 'Architect', skill: 'Logic' },
    { id: 'm8', icon: Heart, iconColor: 'text-red-500', label: 'Empath', skill: 'EQ' }
  ];

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div animate={{ backgroundPosition: ['0px 0px', '0px 100px'] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]" style={{ backgroundImage: `linear-gradient(rgba(14, 165, 233, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(14, 165, 233, 0.2) 1px, transparent 1px)`, backgroundSize: '100px 100px' }} />
        <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-brand-blue/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-8 py-12 space-y-16 pb-32">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="lg:col-span-8 bg-slate-900 dark:bg-slate-900/50 rounded-[4rem] p-12 text-white relative overflow-hidden flex flex-col justify-between shadow-2xl border border-transparent dark:border-white/5">
            <div className="relative z-10 space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="px-4 py-1.5 bg-brand-blue rounded-full text-[11px] font-black uppercase tracking-[0.2em]">Soft Skill DNA Sync</span>
                  <div className="flex items-center text-brand-orange font-black text-[11px] space-x-1.5 bg-white/5 px-4 py-1.5 rounded-full border border-white/10"><Flame size={14} className="fill-brand-orange" /><span className="tracking-widest uppercase">{user.streak} DAY STREAK</span></div>
                </div>
                <button 
                  onClick={() => setShowSyncModal(true)}
                  className="p-3 bg-white/10 rounded-2xl hover:bg-brand-blue transition-colors group"
                  title="Export DNA Profile"
                >
                  <Share2 size={18} className="text-white" />
                </button>
              </div>
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none text-white">Hey, <span className="text-brand-blue">{user.name.split(' ')[0]}.</span></h1>
              <p className="text-slate-300 text-xl max-w-md font-medium leading-relaxed">Technical tools change, but <span className="text-white font-bold">Soft Skills are eternal</span>.</p>
            </div>
            <div className="mt-20 flex items-end justify-between relative z-10">
              <div className="flex-1 max-w-md">
                <div className="flex justify-between text-[11px] font-black tracking-widest uppercase mb-4 text-slate-400"><span>Curriculum Mastery</span><span className="text-brand-blue">{user.progress}%</span></div>
                <div className="w-full bg-slate-800/50 rounded-full h-3 overflow-hidden border border-white/5"><motion.div initial={{ width: 0 }} animate={{ width: `${user.progress}%` }} className="bg-gradient-to-r from-brand-blue via-brand-indigo to-brand-orange h-full" /></div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-[4rem] p-10 shadow-xl border border-slate-50 dark:border-slate-800 flex flex-col justify-between relative overflow-hidden glass-effect">
            <div className="space-y-6 relative z-10">
              <div className="flex items-center space-x-2.5"><div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center"><Brain size={20} className="text-brand-indigo dark:text-brand-blue" /></div><h3 className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Neural Skill Matrix</h3></div>
              <div className="h-64 w-full relative">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"><div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full border-4 border-brand-blue shadow-lg flex flex-col items-center justify-center"><span className="text-lg font-black text-slate-900 dark:text-white leading-none">{overallScore}</span><span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">SSI</span></div></div>
                <ResponsiveContainer width="100%" height="100%"><RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}><PolarGrid stroke="#94A3B8" className="opacity-20 dark:opacity-10" /><PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 900, fill: '#94A3B8' }} /><Radar name="Skills" dataKey="A" stroke="#0EA5E9" strokeWidth={3} fill="#4338CA" fillOpacity={0.15} /></RadarChart></ResponsiveContainer>
              </div>
            </div>
            <button onClick={onStartAssessment} className="mt-8 w-full py-6 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-black rounded-[2rem] hover:bg-brand-blue transition-all uppercase tracking-widest text-[11px] flex items-center justify-center space-x-3 group"><span>Launch Skill Audit</span><ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" /></button>
          </motion.div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <motion.div whileHover={{ y: -8 }} className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-[4rem] p-12 shadow-2xl border border-slate-50 dark:border-slate-800 relative overflow-hidden glass-effect flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-3 text-brand-blue mb-10 bg-brand-blue/5 w-fit px-4 py-1.5 rounded-full border border-brand-blue/10"><Target size={18} /><h2 className="text-[10px] font-black uppercase tracking-[0.2em]">Daily Skill Burst</h2></div>
              <div className="space-y-4"><h3 className="text-4xl font-black dark:text-white leading-[1.1] tracking-tight">{currentDailyTask.title}</h3><p className="text-slate-500 dark:text-slate-400 text-xl leading-relaxed font-medium">{currentDailyTask.description}</p></div>
            </div>
            <div className="pt-12"><button onClick={() => onStartDailyTask(currentDailyTask)} className="w-full bg-brand-orange text-white px-10 py-6 rounded-[2.2rem] font-black hover:bg-slate-900 transition-all shadow-2xl text-xs uppercase tracking-[0.2em] flex items-center justify-center space-x-4"><span>Conquer Today</span><Sparkles size={16} /></button></div>
          </motion.div>

          <div className="lg:col-span-5 space-y-8">
            <div className="flex items-center space-x-3 px-6"><div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-brand-indigo"><LayoutGrid size={16} /></div><h2 className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em]">Skill Path</h2></div>
            <div className="grid grid-cols-1 gap-5 overflow-y-auto max-h-[500px] pr-3 custom-scrollbar p-2">
              {curriculum.map((module, idx) => {
                const isCompleted = user.completedModules.includes(module.id);
                return (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.08 }} key={module.id} onClick={() => onSelectModule(module.id)} className={`group bg-white dark:bg-slate-900 rounded-[2.5rem] p-7 border-2 transition-all cursor-pointer flex items-center justify-between shadow-sm glass-effect ${isCompleted ? 'border-green-100 dark:border-green-900/30' : 'border-transparent dark:border-slate-800 hover:border-brand-blue/10'}`}>
                    <div className="flex items-center space-x-8">
                      <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 ${isCompleted ? 'bg-green-50 text-green-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-brand-blue group-hover:text-white'}`}>{isCompleted ? <CheckCircle2 size={32} /> : <span className="text-sm font-black uppercase tracking-widest">W{module.week}</span>}</div>
                      <div className="space-y-1"><h4 className={`font-black text-xl tracking-tight ${isCompleted ? 'text-green-800 dark:text-green-400' : 'text-slate-800 dark:text-slate-100'}`}>{module.title}</h4><p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{module.description}</p></div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-xl border border-slate-50 dark:border-slate-800 glass-effect flex flex-col space-y-8">
             <div className="flex items-center space-x-3"><History size={20} className="text-brand-blue" /><h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">DNA Timeline</h3></div>
             <div className="flex-grow space-y-4 overflow-y-auto custom-scrollbar max-h-80">
                {user.scoreHistory && user.scoreHistory.length > 0 ? (
                  user.scoreHistory.slice().reverse().map((entry, idx) => (
                    <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl flex items-center justify-between">
                       <div><div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{entry.date}</div><div className="text-xs font-bold text-slate-700 dark:text-slate-200">Skill Audit Complete</div></div>
                       <div className="text-brand-blue font-black flex items-center space-x-1">
                          <TrendingUp size={12} />
                          <span>{Math.round((entry.communication + entry.confidence + entry.teamwork + entry.problemSolving) / 4)}</span>
                       </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <History size={32} className="text-slate-200 dark:text-slate-800 mb-4" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">No audits recorded yet.<br/>Complete your first audit!</p>
                  </div>
                )}
             </div>
          </motion.div>
        </section>

        {/* --- Badge Vault Section --- */}
        <section className="space-y-8">
          <div className="flex items-center justify-center space-x-4">
            <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-800" />
            <div className="flex items-center space-x-3 px-8 text-brand-indigo dark:text-brand-blue">
              <Award size={24} />
              <h2 className="text-xs font-black uppercase tracking-[0.5em]">The Skill Badge Vault</h2>
            </div>
            <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-800" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
            {badgeConfig.map((badge, idx) => {
              const isUnlocked = user.completedModules.includes(badge.id) || user.completedModules.includes(`${badge.id}_v2`) || overallScore > (idx * 12);
              return (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex flex-col items-center space-y-3 group"
                >
                  <div className={`
                    relative w-full aspect-square rounded-[2rem] flex items-center justify-center transition-all duration-700
                    ${isUnlocked 
                      ? 'bg-white dark:bg-slate-900 shadow-xl border-2 border-brand-blue/20 badge-pop' 
                      : 'bg-slate-50 dark:bg-slate-900/40 border-2 border-slate-100 dark:border-slate-800 grayscale opacity-40'
                    }
                  `}>
                    {isUnlocked ? (
                      <>
                        <badge.icon size={48} className={badge.iconColor || "text-brand-blue"} />
                        <div className="absolute inset-0 bg-brand-blue/10 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <motion.div 
                          animate={{ scale: [1, 1.2, 1] }} 
                          transition={{ repeat: Infinity, duration: 4 }}
                          className="absolute -top-2 -right-2 bg-brand-orange text-white w-6 h-6 rounded-full flex items-center justify-center shadow-lg"
                        >
                          <Stars size={12} fill="currentColor" />
                        </motion.div>
                      </>
                    ) : (
                      <Lock size={32} className="text-slate-300 dark:text-slate-700" />
                    )}
                  </div>
                  <div className="text-center">
                    <div className={`text-[10px] font-black uppercase tracking-widest ${isUnlocked ? 'text-slate-800 dark:text-white' : 'text-slate-400 dark:text-slate-600'}`}>
                      {badge.label}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        <footer className="text-center pt-16">
          <p className="text-slate-400 text-[8px] font-black uppercase tracking-[0.5em] mt-4">Advanced Neural Skill Sync • School-Approved MVP</p>
        </footer>
      </div>

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
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-4">
                  <Share2 size={32} />
                </div>
                <h2 className="text-3xl font-black dark:text-white">Share Your Profile</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Export your unique DNA code for teacher review.</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Your Unique DNA Code</div>
                <div className="break-all font-mono text-[10px] text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 max-h-32 overflow-y-auto custom-scrollbar">
                  {generateSyncCode()}
                </div>
              </div>

              <div className="flex flex-col space-y-3">
                <button 
                  onClick={copySyncCode}
                  className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center space-x-2 hover:bg-slate-900 transition-all"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copied ? 'Copied to Clipboard' : 'Copy DNA Code'}</span>
                </button>
                <button 
                  onClick={() => setShowSyncModal(false)}
                  className="w-full py-5 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-slate-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
