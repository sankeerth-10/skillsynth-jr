
import React, { useState } from 'react';
import { User } from '../types';
import { 
  Users, 
  TrendingUp, 
  Award, 
  Search, 
  ChevronRight,
  Filter,
  Plus,
  ArrowRight,
  X,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TeacherDashboardProps {
  user: User;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ user }) => {
  // Mock data for initial view - in a real "local" app, this would be empty until students share codes
  const [students, setStudents] = useState<any[]>([
    { name: 'Arjun Mehta', class: '8A', progress: 85, score: 78, status: 'Active' },
    { name: 'Sanya Gupta', class: '8B', progress: 40, score: 62, status: 'Active' },
    { name: 'Kabir Singh', class: '8A', progress: 100, score: 91, status: 'Completed' },
    { name: 'Ananya Rao', class: '8C', progress: 12, score: 45, status: 'At Risk' },
  ]);

  const [showImportModal, setShowImportModal] = useState(false);
  const [importCode, setImportCode] = useState('');

  const handleImportDNA = () => {
    try {
      const decoded = JSON.parse(atob(importCode));
      const newStudent = {
        name: decoded.n,
        class: decoded.g,
        progress: decoded.p,
        score: Math.round(Object.values(decoded.s as Record<string, number>).reduce((a, b) => a + b, 0) / 4),
        status: decoded.p === 100 ? 'Completed' : 'Active'
      };
      
      setStudents(prev => {
        const exists = prev.findIndex(s => s.name === newStudent.name);
        if (exists > -1) {
          const updated = [...prev];
          updated[exists] = newStudent;
          return updated;
        }
        return [...prev, newStudent];
      });
      
      setImportCode('');
      setShowImportModal(false);
    } catch (e) {
      alert("Invalid DNA Sync Code. Please ensure the code was copied correctly.");
    }
  };

  const avgProgress = Math.round(students.reduce((acc, s) => acc + s.progress, 0) / students.length);

  return (
    <div className="max-w-7xl mx-auto px-8 py-12 space-y-12 pb-32">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Class Intelligence Hub</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Monitoring Section {user.classSection} • {students.length} Synchronized Profiles</p>
        </div>
        <button 
          onClick={() => setShowImportModal(true)}
          className="flex items-center space-x-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest"
        >
          <Plus size={16} />
          <span>Import Student DNA</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: Users, label: 'Avg. Completion', val: `${avgProgress}%`, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { icon: TrendingUp, label: 'Top Strength', val: 'Communication', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
          { icon: Award, label: 'Growth Area', val: 'Confidence', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' }
        ].map((metric, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-xl border border-slate-50 dark:border-slate-800 flex flex-col items-center text-center space-y-4">
            <div className={`w-14 h-14 ${metric.bg} ${metric.color} rounded-2xl flex items-center justify-center`}><metric.icon size={28} /></div>
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">{metric.label}</span>
              <div className="text-4xl font-black text-slate-900 dark:text-white">{metric.val}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-xl border border-slate-50 dark:border-slate-800 overflow-hidden">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
          <div className="relative w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Search student entity..." className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm font-bold outline-none border-2 border-transparent focus:border-blue-500/20" />
          </div>
          <button className="flex items-center space-x-2 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-blue-500"><Filter size={14} /> <span>Filter List</span></button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="px-10 py-6">Student Entity</th>
                <th className="px-10 py-6">Status</th>
                <th className="px-10 py-6">Neural Progress</th>
                <th className="px-10 py-6 text-center">Score</th>
                <th className="px-10 py-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {students.map((student, idx) => (
                <tr key={idx} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-10 py-6">
                    <div className="font-black text-slate-900 dark:text-white">{student.name}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Section {student.class}</div>
                  </td>
                  <td className="px-10 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${
                      student.status === 'Completed' ? 'bg-green-50 text-green-600' : 
                      student.status === 'At Risk' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2 min-w-[120px]">
                        <div className="bg-blue-600 h-full rounded-full" style={{ width: `${student.progress}%` }}></div>
                      </div>
                      <span className="text-xs font-black">{student.progress}%</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-center">
                    <span className="text-lg font-black">{student.score}</span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <button className="p-3 bg-white dark:bg-slate-900 border rounded-xl text-slate-400 hover:text-blue-600"><ChevronRight size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showImportModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] p-10 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black dark:text-white tracking-tight">Import DNA</h2>
                <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-red-500"><X /></button>
              </div>
              <div className="space-y-4">
                <p className="text-slate-500 text-sm font-medium">Paste the Skill DNA Code provided by the student to sync their neural profile to your dashboard.</p>
                <textarea 
                  value={importCode}
                  onChange={(e) => setImportCode(e.target.value)}
                  placeholder="Paste DNA Code here..." 
                  className="w-full h-40 p-6 bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] font-mono text-[10px] outline-none border-2 border-transparent focus:border-blue-500/20" 
                />
              </div>
              <button onClick={handleImportDNA} className="w-full py-6 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs flex items-center justify-center space-x-3 hover:bg-slate-900 transition-all">
                <Plus size={18} />
                <span>Sync Student Data</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeacherDashboard;
