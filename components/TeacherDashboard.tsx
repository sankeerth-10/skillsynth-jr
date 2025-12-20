
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { 
  Users, 
  TrendingUp, 
  Award, 
  Search, 
  Download, 
  Share2,
  ChevronRight,
  Filter,
  Plus,
  ArrowRight,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TeacherDashboardProps {
  user: User;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ user }) => {
  const [students, setStudents] = useState([
    { name: 'Aarav Sharma', class: '10-A', progress: 85, score: 86, status: 'Active' },
    { name: 'Diya Patel', class: '10-A', progress: 40, score: 67, status: 'Active' },
    { name: 'Kabir Singh', class: '10-A', progress: 100, score: 96, status: 'Completed' },
    { name: 'Ananya Rao', class: '10-A', progress: 15, score: 42, status: 'At Risk' },
    { name: 'Ishan Gupta', class: '10-A', progress: 60, score: 79, status: 'Active' },
  ]);

  const [showImportModal, setShowImportModal] = useState(false);
  const [importCode, setImportCode] = useState('');

  const handleImport = () => {
    try {
      const decoded = JSON.parse(atob(importCode));
      const newStudent = {
        name: decoded.n,
        class: decoded.g,
        progress: decoded.p,
        score: Math.round(Object.values(decoded.s as Record<string, number>).reduce((a, b) => a + b, 0) / 4),
        status: decoded.p === 100 ? 'Completed' : 'Active'
      };
      setStudents(prev => [newStudent, ...prev]);
      setShowImportModal(false);
      setImportCode('');
    } catch (e) {
      alert("Invalid DNA Code. Please try again.");
    }
  };

  const avgProgress = Math.round(students.reduce((acc, s) => acc + s.progress, 0) / students.length);

  return (
    <div className="max-w-7xl mx-auto px-8 py-12 space-y-12 pb-32 transition-colors duration-300">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Class Intelligence Hub</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Monitoring Section {user.classSection} • {students.length} Students Synced</p>
        </div>
        <div className="flex space-x-4">
          <button 
            onClick={() => setShowImportModal(true)}
            className="flex items-center space-x-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl transition-all"
          >
            <Plus size={16} />
            <span>Import Student DNA</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: Users, label: 'Avg. Completion', val: `${avgProgress}%`, desc: 'Course mastery across class', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { icon: TrendingUp, label: 'Top Strength', val: 'Communication', desc: 'Highest class average', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
          { icon: Award, label: 'Growth Area', val: 'Confidence', desc: 'Focus target for Week 3', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' }
        ].map((metric, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-xl border border-slate-50 dark:border-slate-800 flex flex-col items-center text-center space-y-4">
            <div className={`w-14 h-14 ${metric.bg} ${metric.color} rounded-2xl flex items-center justify-center`}><metric.icon size={28} /></div>
            <div>
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 block">{metric.label}</span>
              <div className={`text-4xl font-black text-slate-900 dark:text-white`}>{metric.val}</div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">{metric.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-xl border border-slate-50 dark:border-slate-800 overflow-hidden">
        <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Student Progress Roster</h2>
          <div className="flex items-center space-x-4 w-full md:w-auto">
             <div className="relative flex-1 md:flex-none">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Search name..." className="w-full md:w-64 bg-slate-50 dark:bg-slate-800 border-none rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-400" />
             </div>
             <button className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-blue-600 transition-colors">
               <Filter size={20} />
             </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              <tr>
                <th className="px-10 py-6">Student Entity</th>
                <th className="px-10 py-6">Mastery Status</th>
                <th className="px-10 py-6">Neural Progress</th>
                <th className="px-10 py-6 text-center">Score</th>
                <th className="px-10 py-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {students.map((student, idx) => (
                <tr key={idx} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-10 py-6">
                    <div className="font-black text-slate-900 dark:text-slate-100">{student.name}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Grade {student.class}</div>
                  </td>
                  <td className="px-10 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      student.status === 'Completed' ? 'bg-green-50 dark:bg-green-900/20 text-green-600' : 
                      student.status === 'At Risk' ? 'bg-red-50 dark:bg-red-900/20 text-red-600' : 
                      'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2 min-w-[120px]">
                        <div className="bg-blue-600 h-full rounded-full" style={{ width: `${student.progress}%` }}></div>
                      </div>
                      <span className="text-xs font-black text-slate-700 dark:text-slate-300">{student.progress}%</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-center">
                    <span className="text-lg font-black text-slate-900 dark:text-slate-100">{student.score}</span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <button className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-400 group-hover:text-blue-600 transition-all">
                      <ChevronRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showImportModal && (
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
                <h2 className="text-3xl font-black dark:text-white">Import Student DNA</h2>
                <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-red-500"><X /></button>
              </div>
              
              <div className="space-y-4">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Paste the DNA code shared by the student below to view their profile.</p>
                <textarea 
                  value={importCode}
                  onChange={(e) => setImportCode(e.target.value)}
                  placeholder="Paste DNA code here..."
                  className="w-full h-40 bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 text-[10px] font-mono outline-none focus:border-blue-500 transition-all resize-none"
                />
              </div>

              <button 
                onClick={handleImport}
                disabled={!importCode}
                className="w-full py-5 bg-blue-600 disabled:opacity-50 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center space-x-2 hover:bg-slate-900 transition-all"
              >
                <span>Synchronize Profile</span>
                <ArrowRight size={16} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeacherDashboard;
