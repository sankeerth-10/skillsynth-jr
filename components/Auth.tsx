
import React, { useState } from 'react';
import { User, UserRole } from '../types.ts';
import { SkillSynthLogo } from './Logo.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User as UserIcon, 
  Lock, 
  GraduationCap, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  EyeOff, 
  Share2, 
  History,
  Medal,
  Award,
  Crown,
  Stars,
  Briefcase
} from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [classSection, setClassSection] = useState('8');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: name || (role === UserRole.TEACHER ? 'Educator' : 'Student'),
      classSection: classSection,
      password: password,
      role: role,
      progress: 0,
      scores: {
        communication: 0,
        confidence: 0,
        teamwork: 0,
        problemSolving: 0
      },
      completedModules: [],
      badges: [],
      streak: 1
    };
    onLogin(newUser);
  };

  const showcaseBadges = [
    { icon: Medal, label: 'Communicator', color: 'text-blue-500' },
    { icon: Award, label: 'Leader', color: 'text-purple-500' },
    { icon: Stars, label: 'Confident', color: 'text-orange-500' },
    { icon: Crown, label: 'Strategist', color: 'text-brand-indigo' }
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 overflow-x-hidden relative selection:bg-brand-blue/20">
      {/* --- Premium Background Layer --- */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-brand-blue/10 dark:bg-brand-blue/5 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            x: [0, -40, 0],
            y: [0, 60, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-indigo/10 dark:bg-brand-indigo/5 rounded-full blur-[100px]" 
        />
        <div 
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{ 
            backgroundImage: `linear-gradient(#4338CA 1px, transparent 1px), linear-gradient(90deg, #4338CA 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10 py-20">
        {/* Left Side: Branding & Mission */}
        <div className="hidden lg:flex flex-col items-start space-y-10">
          <SkillSynthLogo size={64} />
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center space-x-3 px-4 py-1.5 bg-brand-orange/10 border border-brand-orange/20 rounded-full"
            >
              <Zap size={14} className="text-brand-orange fill-brand-orange" />
              <span className="text-[10px] font-black text-brand-orange uppercase tracking-[0.3em]">School-Safe Platform</span>
            </motion.div>
            <h2 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-[1.05]">
              Building the Future of <br/>
              <span className="logo-gradient-text">Soft Skills.</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xl font-medium max-w-md leading-relaxed">
              Technical knowledge gets you in the door, but <span className="text-brand-blue font-bold">Soft Skills</span> take you to the top.
            </p>
            
            <div className="grid grid-cols-4 gap-4 max-w-sm">
              {showcaseBadges.map((badge, idx) => (
                <div key={idx} className="flex flex-col items-center space-y-2 group">
                  <div className="w-16 h-16 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <badge.icon className={`${badge.color} opacity-40 group-hover:opacity-100 transition-opacity`} size={32} />
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600 group-hover:text-brand-blue transition-colors text-center">{badge.label}</span>
                </div>
              ))}
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-100 dark:border-slate-800 rounded-3xl p-6 space-y-4 max-w-sm"
            >
              <div className="flex items-center space-x-3 text-brand-blue">
                <ShieldCheck size={20} />
                <span className="text-xs font-black uppercase tracking-widest">Privacy First Mode</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { icon: EyeOff, text: "No assessment recordings stored" },
                  { icon: Share2, text: "Private DNA Profiles" },
                  { icon: History, text: "No student-to-student comparisons" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 dark:text-slate-500">
                    <item.icon size={12} />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Side: Login Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-2xl p-12 md:p-14 border border-slate-50 dark:border-slate-800 relative overflow-hidden glass-effect"
        >
          <div className="lg:hidden flex justify-center mb-10">
            <SkillSynthLogo />
          </div>
          
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Access Terminal</h1>
            <p className="text-slate-400 dark:text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] mt-2">Secure Educational Sync</p>
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl mb-8">
            <button 
              onClick={() => setRole(UserRole.STUDENT)}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${role === UserRole.STUDENT ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Student
            </button>
            <button 
              onClick={() => setRole(UserRole.TEACHER)}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${role === UserRole.TEACHER ? 'bg-white dark:bg-slate-700 text-purple-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Teacher
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
                {role === UserRole.TEACHER ? 'Educator Name' : 'Student Name'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <UserIcon size={18} className="text-slate-300 dark:text-slate-600" />
                </div>
                <input 
                  required
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={role === UserRole.TEACHER ? "e.g. Dr. Emily Smith" : "e.g. Rahul Verma"}
                  className="w-full pl-12 pr-6 py-5 rounded-[1.5rem] bg-slate-50/50 dark:bg-slate-800/50 border-2 border-transparent focus:border-brand-blue/20 focus:bg-white dark:focus:bg-slate-800 transition-all font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600 outline-none"
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {role === UserRole.STUDENT && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Grade Level</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <GraduationCap size={18} className="text-slate-300 dark:text-slate-600" />
                    </div>
                    <select 
                      required
                      value={classSection}
                      onChange={(e) => setClassSection(e.target.value)}
                      className="w-full pl-12 pr-6 py-5 rounded-[1.5rem] bg-slate-50/50 dark:bg-slate-800/50 border-2 border-transparent focus:border-brand-blue/20 focus:bg-white dark:focus:bg-slate-800 transition-all font-bold text-slate-800 dark:text-slate-100 outline-none appearance-none"
                    >
                      {[6,7,8,9,10,11,12].map(g => (
                        <option key={g} value={g}>Grade {g}</option>
                      ))}
                    </select>
                  </div>
                </motion.div>
              )}
              {role === UserRole.TEACHER && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Class Section Code</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <Briefcase size={18} className="text-slate-300 dark:text-slate-600" />
                    </div>
                    <input 
                      required
                      type="text"
                      value={classSection}
                      onChange={(e) => setClassSection(e.target.value)}
                      placeholder="e.g. 10-A"
                      className="w-full pl-12 pr-6 py-5 rounded-[1.5rem] bg-slate-50/50 dark:bg-slate-800/50 border-2 border-transparent focus:border-brand-blue/20 focus:bg-white dark:focus:bg-slate-800 transition-all font-bold text-slate-800 dark:text-slate-100 outline-none"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Access Pin</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-300 dark:text-slate-600" />
                </div>
                <input 
                  required
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-6 py-5 rounded-[1.5rem] bg-slate-50/50 dark:bg-slate-800/50 border-2 border-transparent focus:border-brand-blue/20 focus:bg-white dark:focus:bg-slate-800 transition-all font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600 outline-none"
                />
              </div>
            </div>

            <button 
              type="submit"
              className={`w-full font-black py-6 rounded-[1.5rem] transition-all transform active:scale-[0.98] shadow-2xl mt-6 flex items-center justify-center space-x-3 group ${role === UserRole.STUDENT ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-brand-blue dark:hover:bg-brand-blue dark:hover:text-white' : 'bg-brand-indigo text-white hover:bg-slate-900'}`}
            >
              <span className="uppercase tracking-[0.2em] text-[10px]">Initialize {role === UserRole.TEACHER ? 'Educator' : 'Skill'} Sync</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center space-y-2 text-center">
            <div className="flex items-center space-x-2 text-brand-blue">
              <ShieldCheck size={14} />
              <span className="text-[9px] font-black uppercase tracking-widest">School Security Protocol Verified</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
