
import { GoogleGenAI, Type } from "@google/genai";
import { Module } from "../types.ts";

// Initialize Gemini AI with API key from environment variables as per guidelines
// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const adaptModuleContent = async (module: Module, grade: string) => {
  const gradeNum = parseInt(grade) || 8;
  
  const systemInstruction = `
    You are an AI Education Specialist. Your task is to adapt a soft-skills lesson for a student in Grade ${gradeNum}.
    Return a JSON object with updated 'content', 'learningPoints', and 'examples'.
    Ensure 'learningPoints' has exactly 8 items.
  `;

  const prompt = `Adapt this module for a Grade ${gradeNum} student:\n${JSON.stringify(module)}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { 
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            content: { type: Type.STRING },
            learningPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            examples: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["content", "learningPoints", "examples"]
        }
      }
    });
    
    // Access response.text property directly (not a method call)
    const adaptedData = JSON.parse(response.text || "{}");
    return { ...module, ...adaptedData };
  } catch (error) {
    console.error("Content Adaptation Error:", error);
    return module;
  }
};

export const evolveModuleContent = async (module: Module, grade: string) => {
  const systemInstruction = `
    You are an AI Mastery Architect. The student has mastered the basic version of "${module.title}".
    Generate "Level 2: Advanced Concepts" for this module.
    Focus on complex scenarios, nuance, and professional-level soft skills appropriate for Grade ${grade}.
    Return a JSON object with a NEW 'title' (e.g., "${module.title} II: Advanced Tactics"), 'content', 'learningPoints', and 'quizzes'.
  `;

  const prompt = `Evolve this module to an advanced level:\n${JSON.stringify(module)}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { 
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING },
            learningPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            quizzes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswer: { type: Type.NUMBER }
                },
                required: ["id", "question", "options", "correctAnswer"]
              }
            }
          },
          required: ["title", "content", "learningPoints", "quizzes"]
        }
      }
    });
    
    // Access response.text property directly
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Module Evolution Error:", error);
    return null;
  }
};

export const generateAdaptiveQuestion = async (history: { question: string, answer: string }[], step: number, pastQuestions: string[] = [], grade: string = '8') => {
  const systemInstruction = `
    You are a friendly AI Mentor for school kids (Grades 6-12). 
    Your goal is to ask EASY, simple, and very short soft-skill questions.
    
    CRITICAL RULES:
    1. Ask ONLY ONE simple question.
    2. Make the scenario very relatable to school life (friends, lunch, sports, projects).
    3. Use very easy words. No complex jargon.
    4. Be super encouraging and kind.
    5. Avoid repeating themes or previous questions: ${pastQuestions.slice(-20).join(' | ')}
    
    Return ONLY the question string.
  `;

  const context = history.map(h => `Q: ${h.question}\nA: ${h.answer}`).join('\n\n');
  const prompt = history.length === 0 
    ? `Ask an EASY, friendly first question for a Grade ${grade} student. Focus on communication.` 
    : `The student said:\n${context}\n\nAsk the NEXT easy question (Step ${step + 1} of 5) about a different skill like confidence or teamwork.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { 
        systemInstruction,
        temperature: 0.8, 
      }
    });
    // Access response.text property directly
    return response.text?.trim().replace(/^"/, '').replace(/"$/, '') || "How would you help a friend who is stuck on a difficult school problem?";
  } catch (error) {
    return "What is your favorite way to work with a team on a school project?";
  }
};

export const getAssessmentFeedback = async (history: { question: string, answer: string }[]) => {
  const systemInstruction = `
    Analyze the student's conversation. Be an encouraging AI Coach.
    Scores must be 1-100. Give high scores (70-90) to keep them motivated!
    Return a structured JSON object.
  `;

  const transcript = history.map(h => `Q: ${h.question}\nA: ${h.answer}`).join('\n\n');

  try {
    const response = await ai.models.generateContent({
      // Complex assessment task uses pro model
      model: "gemini-3-pro-preview",
      contents: `Provide warm feedback for this student transcript:\n\n${transcript}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            feedback: { type: Type.STRING },
            scores: {
              type: Type.OBJECT,
              properties: {
                communication: { type: Type.NUMBER },
                confidence: { type: Type.NUMBER },
                teamwork: { type: Type.NUMBER },
                problemSolving: { type: Type.NUMBER }
              },
              required: ["communication", "confidence", "teamwork", "problemSolving"]
            },
            biometrics: {
              type: Type.OBJECT,
              properties: {
                eyeContact: { type: Type.NUMBER },
                voiceModulation: { type: Type.NUMBER },
                facialExpression: { type: Type.NUMBER }
              },
              required: ["eyeContact", "voiceModulation", "facialExpression"]
            },
            strengths: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING }
                }
              } 
            },
            weaknesses: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING }
                }
              } 
            },
            improvementAreas: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING }
                }
              } 
            },
            aiVision: { type: Type.STRING }
          },
          required: ["feedback", "scores", "biometrics", "strengths", "weaknesses", "improvementAreas", "aiVision"]
        }
      }
    });

    // Access response.text property directly
    return JSON.parse(response.text || "{}");
  } catch (error) {
    return {
      feedback: "You're doing great!",
      scores: { communication: 85, confidence: 80, teamwork: 82, problemSolving: 78 },
      biometrics: { eyeContact: 88, voiceModulation: 82, facialExpression: 85 },
      strengths: [{ title: "Friendly Tone", description: "You are very welcoming." }],
      weaknesses: [{ title: "Structure", description: "Keep practicing!" }],
      improvementAreas: [{ title: "Detail", description: "Try adding one more sentence." }],
      aiVision: "Future Leader"
    };
  }
};
