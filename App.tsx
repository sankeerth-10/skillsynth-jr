
import React, { useState, useEffect } from 'react';
import { User, Module, DailyTask, UserRole } from './types.ts';
import Auth from './components/Auth.tsx';
import Dashboard from './components/Dashboard.tsx';
import TeacherDashboard from './components/TeacherDashboard.tsx';
import ModuleView from './components/ModuleView.tsx';
import Assessment from './components/Assessment.tsx';
import { CURRICULUM } from './constants.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { SkillSynthLogo } from './components/Logo.tsx';
import { Sun, Moon } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [curriculum, setCurriculum] = useState<Module[]>(CURRICULUM);
  const [currentView, setCurrentView] = useState<'dashboard' | 'module' | 'assessment'>('dashboard');
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [activeDailyTask, setActiveDailyTask] = useState<DailyTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    // 1. Handle Theme
    const savedTheme = localStorage.getItem('theme');
    const shouldBeDark = savedTheme === 'dark' || !savedTheme;
    setIsDarkMode(shouldBeDark);
    if (shouldBeDark) document.documentElement.classList.add('dark');

    // 2. Load Local Session
    const savedUser = localStorage.getItem('skillSynth_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse local user", e);
      }
    }
    setLoading(false);
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('skillSynth_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('skillSynth_user');
    setCurrentView('dashboard');
    setActiveModuleId(null);
  };

  const updateProgress = (moduleId: string, evolvedModule?: any) => {
    if (!user) return;
    
    let updatedCurriculum = [...curriculum];
    if (evolvedModule) {
      const newModule: Module = {
        ...evolvedModule,
        id: `${moduleId}_v2`,
        week: curriculum.find(m => m.id === moduleId)?.week || 1,
        skillsFocus: curriculum.find(m => m.id === moduleId)?.skillsFocus || ['communication']
      };
      const index = updatedCurriculum.findIndex(m => m.id === moduleId);
      if (index !== -1) updatedCurriculum[index] = newModule;
      else updatedCurriculum.push(newModule);
      setCurriculum(updatedCurriculum);
    }

    const completed = [...(user.completedModules || [])];
    if (!completed.includes(moduleId)) completed.push(moduleId);
    const newProgress = Math.round((completed.length / updatedCurriculum.length) * 100);
    
    const updatedUser = { 
      ...user, 
      completedModules: completed, 
      progress: newProgress 
    };
    setUser(updatedUser);
    localStorage.setItem('skillSynth_user', JSON.stringify(updatedUser));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="h-10 w-10 border-4 border-brand-blue border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return <Auth onLogin={handleLogin} />;

  return (
    <div className="min-h-screen flex flex-col selection:bg-brand-blue/20 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
      <nav className="glass-effect sticky top-0 z-50 border-b border-slate-100 dark:border-slate-800 px-8 py-4 flex justify-between items-center">
        <div className="cursor-pointer" onClick={() => setCurrentView('dashboard')}><SkillSynthLogo /></div>
        <div className="flex items-center space-x-6">
          <ThemeToggle isDark={isDarkMode} onToggle={toggleTheme} />
          <div className="hidden md:flex flex-col items-end">
            <span className="text-slate-900 dark:text-slate-100 font-bold text-sm">{user.name}</span>
            <span className="text-brand-indigo dark:text-brand-blue text-[10px] font-black uppercase tracking-widest">{user.role === UserRole.TEACHER ? 'Educator' : `Grade ${user.classSection}`}</span>
          </div>
          <button onClick={handleLogout} className="text-slate-400 hover:text-brand-orange transition-colors text-xs font-black uppercase tracking-widest">Sign Out</button>
        </div>
      </nav>

      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div key={currentView} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            {user.role === UserRole.TEACHER ? <TeacherDashboard user={user} /> : (
              <>
                {currentView === 'dashboard' && <Dashboard user={user} onSelectModule={(id) => { setActiveModuleId(id); setCurrentView('module'); }} onStartAssessment={() => { setActiveDailyTask(null); setCurrentView('assessment'); }} onStartDailyTask={(task) => { setActiveDailyTask(task); setCurrentView('assessment'); }} curriculum={curriculum} />}
                {currentView === 'module' && activeModuleId && <ModuleView module={curriculum.find(m => m.id === activeModuleId)!} user={user} onBack={() => setCurrentView('dashboard')} onComplete={updateProgress} />}
                {currentView === 'assessment' && (
                  <Assessment 
                    user={user} 
                    dailyTask={activeDailyTask}
                    onBack={() => setCurrentView('dashboard')} 
                    onComplete={(newScores, sessionQuestions) => {
                      const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      const history = [...(user.scoreHistory || [])];
                      const blendedScores = {
                        communication: Math.round(((user.scores.communication || 0) + (newScores.communication || 0)) / (user.scores.communication ? 2 : 1)) || (newScores.communication || 0),
                        confidence: Math.round(((user.scores.confidence || 0) + (newScores.confidence || 0)) / (user.scores.confidence ? 2 : 1)) || (newScores.confidence || 0),
                        teamwork: Math.round(((user.scores.teamwork || 0) + (newScores.teamwork || 0)) / (user.scores.teamwork ? 2 : 1)) || (newScores.teamwork || 0),
                        problemSolving: Math.round(((user.scores.problemSolving || 0) + (newScores.problemSolving || 0)) / (user.scores.problemSolving ? 2 : 1)) || (newScores.problemSolving || 0),
                      };
                      history.push({ date, ...blendedScores });
                      const updatedUser = { 
                        ...user, 
                        scores: blendedScores, 
                        scoreHistory: history.slice(-10), 
                        streak: user.streak + (activeDailyTask ? 1 : 0),
                        askedQuestions: [...(user.askedQuestions || []), ...sessionQuestions]
                      };
                      setUser(updatedUser);
                      localStorage.setItem('skillSynth_user', JSON.stringify(updatedUser));
                      setCurrentView('dashboard');
                    }}
                  />
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 py-12 px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <SkillSynthLogo className="opacity-50 grayscale" />
        <p className="text-slate-400 text-xs font-medium">© 2024. SkillSynth Jr Local DNA Protocol.</p>
      </footer>
    </div>
  );
};

const ThemeToggle: React.FC<{ isDark: boolean, onToggle: () => void }> = ({ isDark, onToggle }) => (
  <button onClick={onToggle} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 transition-all">
    {isDark ? <Moon size={20} /> : <Sun size={20} />}
  </button>
);

export default App;
