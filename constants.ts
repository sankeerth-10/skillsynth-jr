
import { Module, DailyTask } from './types';

export const CURRICULUM: Module[] = [
  {
    id: 'm1',
    week: 1,
    title: 'Communication Basics',
    description: 'Master the art of expressing ideas clearly and listening with intent.',
    visuals: {
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      videoPlaceholder: "Observe the balance between speaking and active listening in a professional setting."
    },
    content: 'Good communication is like building a bridge between your mind and someone else\'s. To be a great communicator, you don\'t need to use big words; you just need to be clear. Think of the "Three S" rule: Simple, Short, and Sincere. When you speak, look the person in the eye and make sure your voice is loud enough to be heard but soft enough to be friendly. Remember, communication is a two-way street—listening is just as important as talking. By paying close attention to what others say, you show them respect and learn things you might have missed!',
    learningPoints: [
      'The 70/30 Rule: Spend more time listening than talking to truly understand others.',
      'Active Listening: Nod and say "I see" or "Tell me more" to show you are paying attention.',
      'Clarifying Questions: If you don\'t understand, ask "Could you explain that part again?" instead of staying confused.',
      'Body Language: Keep your arms uncrossed and face the person you are talking to.',
      'Open-Ended Questions: Ask questions that start with "How" or "Why" to get more than a "yes" or "no" answer.',
      'The Feedback Loop: Briefly repeat what someone said to ensure you understood correctly.',
      'Wait for the Finish: Never interrupt; wait for a full two seconds after someone stops speaking before you start.',
      'Tone Control: Your voice volume should match the environment—whisper in the library, speak up in the playground.'
    ],
    examples: [
      'When a friend is sad, instead of giving advice right away, say: "I’m listening, do you want to talk about it?"',
      'If a teacher gives a long instruction, summarize it back: "So, we need to finish page 5 and then start the drawing, right?"'
    ],
    quizzes: [
      {
        id: 'q1',
        question: 'What is the "70/30 Rule" in communication?',
        options: ['Talk for 70% of the time', 'Listen for 70% of the time', 'Finish 70% of your work', 'Sleep for 70% of the day'],
        correctAnswer: 1
      },
      {
        id: 'q2',
        question: 'Which of these is a sign of good body language?',
        options: ['Looking at your shoes', 'Crossing your arms tightly', 'Facing the person speaking', 'Checking your watch'],
        correctAnswer: 2
      }
    ],
    skillsFocus: ['communication']
  },
  {
    id: 'm2',
    week: 1,
    title: 'Classroom Etiquette 2.0',
    description: 'Navigate modern learning environments with grace and professionalism.',
    visuals: {
      image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1200&auto=format&fit=crop",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      videoPlaceholder: "Classroom dynamics simulation: Showing respect for shared learning spaces."
    },
    content: 'Your classroom is your "professional office." Being a "Classroom Rockstar" means helping the lesson flow smoothly. This means knowing when to be a quiet observer and when to be an active contributor. Respecting the "Learning Zone" of your classmates is key—avoid distractions like tapping pens or whispering when the teacher is speaking. If you need to ask a question, wait for a natural pause. By being polite and prepared, you make the classroom a better place for everyone to learn, including yourself!',
    learningPoints: [
      'The "Hand-Raise" Habit: Wait to be called on so everyone gets a chance to speak.',
      'Digital Manners: If you use a tablet or laptop, keep it only on school-related tabs.',
      'Resource Respect: Treat school books and shared supplies better than your own toys.',
      'Promptness: Being in your seat and ready before the bell rings shows you value everyone\'s time.',
      'Workspace Hygiene: Keep your desk clean so others around you don\'t feel cluttered or distracted.',
      'Eye Tracking: Look at the teacher or the student who is speaking to show you are "mentally present."',
      'Transition Silence: Stay quiet when moving from one activity to another to keep the focus high.',
      'Preparedness: Check your bag for all needed supplies (pens, notebooks) before the lesson starts.'
    ],
    examples: [
      'If you disagree with a classmate, say "I see your point, but I have a different idea," instead of saying "You\'re wrong."',
      'Keeping your desk organized so you don\'t spend 5 minutes looking for a pencil while the teacher is explaining.'
    ],
    quizzes: [
      {
        id: 'q3',
        question: 'What does it mean to respect the "Learning Zone"?',
        options: ['Doing your homework in another class', 'Avoiding distractions for yourself and others', 'Sleeping during the break', 'Sitting in the back row'],
        correctAnswer: 1
      }
    ],
    skillsFocus: ['communication']
  },
  {
    id: 'm3',
    week: 2,
    title: 'Unshakeable Confidence',
    description: 'Harness internal strength to face any academic or social challenge.',
    visuals: {
      image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=1200&auto=format&fit=crop",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      videoPlaceholder: "Visualizing power poses and confident posture in real-time."
    },
    content: 'Confidence isn\'t about never being afraid; it\'s about doing things even when you feel a little nervous. Think of it as a muscle—the more you use it, the stronger it gets. Start with "Small Wins," like answering one question in class or saying hello to someone new. When you make a mistake, don\'t be hard on yourself! Mistakes are just "Information" on how to do better next time. Stand tall, keep your chin up, and remember that your voice matters just as much as anyone else\'s.',
    learningPoints: [
      'Positive Self-Talk: Replace "I can\'t do this" with "I\'m still learning how to do this."',
      'The 5-Second Rule: Count 5-4-3-2-1 and take action before your brain gets too scared.',
      'Body Power: Standing straight and taking deep breaths actually tells your brain to feel calmer.',
      'Contribution Focus: Focus on how your idea might help the class rather than how people will look at you.',
      'The Mirror Method: Practice your introduction or a speech in front of a mirror to see your own strength.',
      'Celebrate Progress: Write down one thing you did bravely every day, no matter how small.',
      'Dress for Success: Wearing clean, tidy clothes can often make you feel more ready to take on the day.',
      'Eye Contact Warm-up: Try to maintain eye contact with people you know well first to build the habit.'
    ],
    examples: [
      'Raising your hand to answer a question even if you aren\'t 100% sure of the answer.',
      'Joining a new club or sport even if you don\'t know anyone else there yet.'
    ],
    quizzes: [],
    skillsFocus: ['confidence']
  },
  {
    id: 'm4',
    week: 2,
    title: 'Articulate Speech',
    description: 'Transform your voice into a powerful tool for persuasion and leadership.',
    visuals: {
      image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=1200&auto=format&fit=crop",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
      videoPlaceholder: "Enunciation and volume control demonstration for public speaking."
    },
    content: 'Have you ever had a great idea but were too quiet for people to hear it? Or did you speak so fast that everyone looked confused? Speaking clearly is a superpower! It’s all about controlling your "Volume" and your "Pace." Practice speaking as if you are sending your words to the back of the room. Don\'t be afraid of "The Power Pause"—taking a breath between sentences gives your listeners time to think about what you just said. When you speak clearly, people listen closely!',
    learningPoints: [
      'Filler Filtering: Try to catch yourself saying "um" or "like" and replace them with a silent breath.',
      'Enunciation: Make sure to finish the ends of your words so they don\'t sound blurry.',
      'Projection: Speak from your stomach, not just your throat, to make your voice carry further.',
      'Eye Contact Sync: Try to look at different people in the room while you are speaking.',
      'Vary Your Pitch: Don\'t speak in a "robot voice"; use high and low notes to make your speech interesting.',
      'The Speed Brake: If you notice you are speaking too fast, take a deep breath and slow down.',
      'Word Choice: Use descriptive words instead of "good" or "nice" to paint a picture for your audience.',
      'Ending Strong: Always finish your sentences with confidence instead of letting your voice fade out.'
    ],
    examples: [
      'Reading a poem out loud and slowing down on the important parts to make them sound special.',
      'Counting to three in your head after someone asks you a question before you start answering.'
    ],
    quizzes: [],
    skillsFocus: ['confidence', 'communication']
  },
  {
    id: 'm5',
    week: 3,
    title: 'Strategic Teamwork',
    description: 'Unlock the collective intelligence of your group through collaboration.',
    visuals: {
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
      videoPlaceholder: "Group brainstorming and delegation simulation."
    },
    content: 'A team is like a puzzle—every piece is different, but they all need to fit together to see the big picture. Being a great teammate doesn\'t mean you have to do everything yourself. It means knowing your "Role" and helping others do their best, too. If you are good at drawing, help with the poster. If you are good at writing, help with the report. The best teams are the ones where everyone feels safe to share their ideas without being laughed at. When we work together, we achieve things we never could alone!',
    learningPoints: [
      'Role Clarity: Ask "What can I do to help the most right now?"',
      'Idea Inclusion: If someone hasn\'t spoken yet, say "What do you think about this?"',
      'Encouragement: Celebrate your teammates\' successes by saying "Great idea!" or "Good job!"',
      'Conflict Resolution: If you disagree, focus on the problem, not the person.',
      'Dependability: If you say you will do a task, make sure it is finished by the time the team needs it.',
      'Constructive Feedback: If you see a mistake, say "How about we try it this way?" instead of "That\'s bad."',
      'Shared Goals: Keep reminding the team what the final project should look like so everyone stays on track.',
      'The "We" Mentality: Use words like "Our" and "Us" instead of "Mine" and "I" when talking about the project.'
    ],
    examples: [
      'Dividing a group project into small tasks so everyone has something clear to work on.',
      'Helping a teammate who is stuck on their part of the project instead of finishing yours and stopping.'
    ],
    quizzes: [],
    skillsFocus: ['teamwork']
  },
  {
    id: 'm6',
    week: 3,
    title: 'Modern Leadership',
    description: 'Guide your peers with empathy, integrity, and clear vision.',
    visuals: {
      image: "https://images.unsplash.com/photo-1517245385167-637899433824?q=80&w=1200&auto=format&fit=crop",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
      videoPlaceholder: "Leadership in action: Resolving team conflicts through active mediation."
    },
    content: 'You don\'t need a title to be a leader. A leader is simply someone who helps a group reach a goal while making sure everyone feels included. Think of a leader as a "Captain" who keeps the ship moving in the right direction. Good leaders listen more than they talk and lead by example. If you want your team to be hard-working, you have to be the hardest worker first! Leadership is about kindness, responsibility, and helping others find their own strengths.',
    learningPoints: [
      'Service Leadership: Ask yourself, "How can I help my team succeed today?"',
      'Decision Making: Listen to all ideas before helping the group choose the best path.',
      'Integrity: If you say you will do something, make sure you do it!',
      'Inspiration: Use positive words to keep the group\'s energy high when things get tough.',
      'Fairness: Ensure everyone gets an equal turn to share their thoughts and work on tasks.',
      'Problem Ownership: When things go wrong, a leader helps find a solution instead of blaming others.',
      'Vulnerability: Don\'t be afraid to say "I don\'t know the answer, let\'s find it together."',
      'Recognition: Publicly thank your teammates for their specific contributions in front of others.'
    ],
    examples: [
      'Organizing a quick meeting to make sure everyone knows what the next step of a project is.',
      'Being the first person to start cleaning up after a group activity without being asked.'
    ],
    quizzes: [],
    skillsFocus: ['teamwork', 'confidence']
  },
  {
    id: 'm7',
    week: 4,
    title: 'Creative Problem Solving',
    description: 'Turn obstacles into opportunities with analytical and lateral thinking.',
    visuals: {
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
      videoPlaceholder: "Mental mapping session: Deconstructing a complex problem into solvable parts."
    },
    content: 'Life is full of "Brain Teasers." When something doesn\'t go as planned, don\'t get frustrated—get curious! Problem solving is like being a detective. First, you have to find out what the real problem is. Then, you brainstorm as many "Crazy Ideas" as you can—sometimes the silliest idea leads to the best solution! Don\'t be afraid to try something and fail. Every time a solution doesn\'t work, you are one step closer to finding the one that does.',
    learningPoints: [
      'The "What If" Game: Ask "What if we tried this completely differently?" to spark new ideas.',
      'Step-by-Step Logic: Break a big problem into tiny pieces that are easier to handle.',
      'Alternative Options: Always try to have a "Plan B" in case your first idea doesn\'t work.',
      'Perspective Shifting: Ask "How would my favorite hero solve this?" to think outside the box.',
      'Identify the "Root": Is the problem really what you think it is, or is there something hidden underneath?',
      'The 5 Whys: Ask "Why?" five times in a row to get to the bottom of a recurring issue.',
      'Sketch It Out: Draw the problem on paper to see connections you might have missed in your head.',
      'Collaboration: Ask a friend for their opinion—they might see a solution that you can\'t.'
    ],
    examples: [
      'If you lose your homework, instead of panicking, make a list of places it could be and check them one by one.',
      'If your group runs out of glue for a poster, brainstorming other ways to attach things, like using tape or string.'
    ],
    quizzes: [],
    skillsFocus: ['problemSolving']
  },
  {
    id: 'm8',
    week: 4,
    title: 'High Emotional Intelligence',
    description: 'The secret weapon for social success and mental well-being.',
    visuals: {
      image: "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?q=80&w=1200&auto=format&fit=crop",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
      videoPlaceholder: "Emotion regulation techniques: Navigating difficult social situations with empathy."
    },
    content: 'Your emotions are like the weather—they change all the time, and that\'s okay! Emotional Intelligence (EQ) is about being the "Weather Reporter" for your own feelings. If you feel "Cloudy" (sad) or "Thunderous" (angry), you can take steps to bring back the "Sunshine." EQ also helps you understand how others are feeling. If a friend is being quiet, maybe they are feeling "Rainy" inside. By understanding feelings, you can stay calm, make better choices, and be a much better friend.',
    learningPoints: [
      'Naming Emotions: When you feel something, try to name it. "I feel frustrated because..."',
      'The Pause Button: Before reacting when you are angry, take three slow breaths.',
      'Empathy: Try to "Put on someone else\'s glasses" to see why they might be acting a certain way.',
      'Resilience: Remind yourself that bad feelings are like clouds—they always pass eventually.',
      'Emotional Triggers: Learn what makes you upset and prepare a plan for when it happens.',
      'Self-Care: Know when you need to take a break or drink water to reset your mood.',
      'Gratitude: Each evening, think of three things you are thankful for to train your brain for happiness.',
      'Apologizing: If you hurt someone\'s feelings, say sorry sincerely without making excuses.'
    ],
    examples: [
      'Counting to ten before answering back to someone who was mean to you on the playground.',
      'Noticing a classmate is sitting alone and inviting them to join your game.'
    ],
    quizzes: [],
    skillsFocus: ['problemSolving', 'communication']
  }
];

export const DAILY_TASKS: DailyTask[] = [
  { id: 't1', title: 'The Daily Debrief', description: 'Tell us about your day! What were the highlights and what did you learn today?', skill: 'communication' },
  { id: 't2', title: 'The Friendship Spotlight', description: 'Introduce your best friends! Tell us about their unique hobbies, talents, and why they are great friends.', skill: 'communication' },
  { id: 't3', title: 'The 30s Elevator Pitch', description: 'Introduce yourself and one thing you are passionate about in exactly 30 seconds.', skill: 'confidence' },
  { id: 't4', title: 'The Expert Teacher', description: 'Explain a simple concept you learned today to an imaginary 5-year-old.', skill: 'confidence' },
  { id: 't5', title: 'The Polite Refusal', description: 'Practice saying "No" to a hypothetical distraction politely but firmly.', skill: 'communication' },
  { id: 't6', title: 'The Hype Man', description: 'Find one peer today and give them a "skill-based" compliment (e.g., "I liked how you phrased that").', skill: 'teamwork' },
  { id: 't7', title: 'The Stoic Moment', description: 'Identify one minor frustration today and choose to react with curiosity instead of anger.', skill: 'problemSolving' }
];

export const ASSESSMENT_QUESTIONS = [
  "Imagine a new student joins your class today. How would you introduce yourself and the school to make them feel welcome?",
  "Tell us about a time you had to solve a difficult problem with a group of people. What was your role?",
  "If you noticed a friend was being quiet and seemed upset, how would you approach them without being intrusive?",
  "What is one soft skill you want to master this month, and why do you think it is important for your future?",
  "Describe a situation where you had to change your mind after hearing someone else's perspective. How did that feel?"
];
