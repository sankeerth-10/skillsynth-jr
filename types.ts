
export enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  classSection: string;
  phoneNumber?: string;
  password?: string;
  role: UserRole;
  progress: number; // 0 to 100
  scores: {
    communication: number;
    confidence: number;
    teamwork: number;
    problemSolving: number;
  };
  scoreHistory?: {
    date: string;
    communication: number;
    confidence: number;
    teamwork: number;
    problemSolving: number;
  }[];
  completedModules: string[];
  badges: string[];
  askedQuestions?: string[]; // Track past questions to prevent repeats
  streak: number;
}

export interface Module {
  id: string;
  week: number;
  title: string;
  description: string;
  content: string;
  learningPoints: string[];
  examples: string[];
  quizzes: QuizQuestion[];
  skillsFocus: (keyof User['scores'])[];
  visuals?: {
    image?: string;
    videoPlaceholder?: string;
    videoUrl?: string;
  };
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface AssessmentAttempt {
  id: string;
  studentId: string;
  timestamp: number;
  transcript: string;
  feedback: string;
  scores: Partial<User['scores']>;
}

export interface DailyTask {
  id: string;
  title: string;
  description: string;
  skill: keyof User['scores'];
}
