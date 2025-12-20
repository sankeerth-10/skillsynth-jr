
import React, { useState } from 'react';
import { User, UserRole } from '../types.ts';
import { SkillSynthLogo } from './Logo.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User as UserIcon, 
  Lock, 
  GraduationCap, 
  ArrowRight, 
  AlertCircle
} from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [classSection, setClassSection] = useState('8');
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Simulate network delay
    setTimeout(() => {
      if (isSignUp) {
        const newUser: User = {
          id: Math.random().toString(36).substring(7),
          name: name || (role === UserRole.TEACHER ? 'Educator' : 'Student'),
          classSection: classSection,
          role: role,
          progress: 0,
          scores: { communication: 0, confidence: 0, teamwork: 0, problemSolving: 0 },
          completedModules: [],
          badges: [],
          streak: 1
        };
        onLogin(newUser);
      } else {
        // Simple local mock auth: if name exists in localStorage, load it, otherwise mock login
        const savedUser = localStorage.getItem('skillSynth_user');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          if (parsed.name === name) {
            onLogin(parsed);
          } else {
            // Mock a valid login if local storage is empty or name mismatch for demo
            onLogin({
              id: 'mock-1',
              name: name,
              classSection: classSection,
              role: role,
              progress: 25,
              scores: { communication: 45, confidence: 30, teamwork: 20, problemSolving: 15 },
              completedModules: ['m1', 'm2'],
              badges: [],
              streak: 3
            });
          }
        } else {
          onLogin({
            id: 'mock-1',
            name: name,
            classSection: classSection,
            role: role,
            progress: 0,
            scores: { communication: 0, confidence: 0, teamwork: 0, problemSolving: 0 },
            completedModules: [],
            badges: [],
            streak: 1
          });
        }
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 overflow-x-hidden relative selection:bg-brand-blue/20">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, -30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-brand-blue/10 dark:bg-brand-blue/5 rounded-full blur-[120px]" 
        />
        <div 
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{ backgroundImage: `linear-gradient(#4338CA 1px, transparent 1px), linear-gradient(90deg, #4338CA 1px, transparent 1px)`, backgroundSize: '60px 60px' }}
        />
      </div>

      <div className="max-w-md w-full relative z-10 py-10">
        <div className="flex justify-center mb-12">
          <SkillSynthLogo size={64} />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl p-10 md:p-12 border border-slate-50 dark:border-slate-800 relative overflow-hidden glass-effect"
        >
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {isSignUp ? 'New DNA Profile' : 'Access Portal'}
            </h1>
            <p className="text-slate-400 dark:text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] mt-2">
              {role === UserRole.STUDENT ? 'Student Terminal' : 'Educator Access'}
            </p>
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl mb-8">
            <button 
              onClick={() => { setRole(UserRole.STUDENT); setError(null); }}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${role === UserRole.STUDENT ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Student
            </button>
            <button 
              onClick={() => { setRole(UserRole.TEACHER); setError(null); }}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${role === UserRole.TEACHER ? 'bg-white dark:bg-slate-700 text-purple-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Teacher
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl flex items-start space-x-2">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <UserIcon size={18} className="text-slate-300 dark:text-slate-600" />
                </div>
                <input 
                  required 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="e.g. Rahul Verma" 
                  className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border-2 border-transparent focus:border-brand-blue/20 focus:bg-white transition-all font-bold text-slate-800 dark:text-slate-100 outline-none" 
                />
              </div>
            </div>

            {role === UserRole.STUDENT && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Grade Level</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <GraduationCap size={18} className="text-slate-300 dark:text-slate-600" />
                  </div>
                  <select 
                    required 
                    value={classSection} 
                    onChange={(e) => setClassSection(e.target.value)} 
                    className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border-2 border-transparent focus:border-brand-blue/20 focus:bg-white transition-all font-bold text-slate-800 dark:text-slate-100 outline-none appearance-none cursor-pointer"
                  >
                    {[6,7,8,9,10,11,12].map(g => <option key={g} value={String(g)}>Grade {g}</option>)}
                  </select>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Security Key</label>
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
                  className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border-2 border-transparent focus:border-brand-blue/20 focus:bg-white transition-all font-bold text-slate-800 dark:text-slate-100 outline-none" 
                />
              </div>
            </div>

            <button 
              disabled={loading} 
              type="submit" 
              className={`w-full font-black py-5 rounded-2xl transition-all transform active:scale-[0.98] shadow-2xl mt-4 flex items-center justify-center space-x-3 group ${role === UserRole.STUDENT ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900' : 'bg-brand-indigo text-white'} disabled:opacity-50`}
            >
              <span className="uppercase tracking-[0.2em] text-[10px]">
                {loading ? 'Processing...' : (isSignUp ? 'Sync DNA Profile' : 'Access Portal')}
              </span>
              {!loading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={() => { setIsSignUp(!isSignUp); setError(null); }} 
              className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-brand-blue transition-colors"
            >
              {isSignUp ? 'Already have a profile? Access here' : 'New student? Create your DNA profile'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
